import {
  pitchFromMidi,
  melodyFromEvents,
  type Melody,
  type MelodyEvent,
} from "@melos/core-theory";

/**
 * Парсер Standard MIDI File (формат 0 і 1).
 * Реалізує підмножину SMF, достатню для імпорту мелодій:
 * - note-on (0x90)/note-off (0x80), zero-velocity note-on = note-off
 * - set-tempo (0xFF 0x51) для BPM
 * - інші meta/sysex — пропускаються
 *
 * Багатоканальні треки зводяться в моно-мелодію (вибирається верхній голос
 * за тіками; для повного багатоголосся знадобиться окремий пайплайн).
 */

class Reader {
  pos = 0;
  constructor(public bytes: Uint8Array) {}

  u8(): number { return this.bytes[this.pos++]!; }
  u16(): number { return (this.u8() << 8) | this.u8(); }
  u32(): number {
    // важливо: робимо через множення, щоб не отримати знаковий int32
    return this.u8() * 0x1000000 + (this.u8() << 16) + (this.u8() << 8) + this.u8();
  }
  vlq(): number {
    let v = 0;
    for (;;) {
      const b = this.u8();
      v = (v << 7) | (b & 0x7f);
      if ((b & 0x80) === 0) return v;
    }
  }
  tag(): string {
    return String.fromCharCode(this.u8(), this.u8(), this.u8(), this.u8());
  }
  slice(n: number): Uint8Array {
    const s = this.bytes.subarray(this.pos, this.pos + n);
    this.pos += n;
    return s;
  }
}

interface RawEvent {
  /** Абсолютні тіки від початку треку. */
  tick: number;
  type: "on" | "off" | "tempo";
  midi?: number;
  velocity?: number;
  usPerQuarter?: number;
}

function parseTrack(r: Reader, len: number): RawEvent[] {
  const end = r.pos + len;
  const events: RawEvent[] = [];
  let tick = 0;
  let runningStatus = 0;

  while (r.pos < end) {
    tick += r.vlq();
    let status = r.bytes[r.pos]!;
    if (status < 0x80) {
      // running status — використовуємо попередній
      status = runningStatus;
    } else {
      r.pos++;
      runningStatus = status;
    }
    const hi = status & 0xf0;

    if (hi === 0x90) { // note-on
      const note = r.u8();
      const vel = r.u8();
      if (vel === 0) events.push({ tick, type: "off", midi: note });
      else events.push({ tick, type: "on", midi: note, velocity: vel });
    } else if (hi === 0x80) { // note-off
      const note = r.u8(); const vel = r.u8(); void vel;
      events.push({ tick, type: "off", midi: note });
    } else if (hi === 0xa0 || hi === 0xb0 || hi === 0xe0) {
      // 2-байтові дані, які нам не потрібні
      r.pos += 2;
    } else if (hi === 0xc0 || hi === 0xd0) {
      r.pos += 1;
    } else if (status === 0xff) { // meta
      const metaType = r.u8();
      const metaLen = r.vlq();
      if (metaType === 0x51 && metaLen === 3) {
        const us = (r.u8() << 16) | (r.u8() << 8) | r.u8();
        events.push({ tick, type: "tempo", usPerQuarter: us });
      } else if (metaType === 0x2f) {
        r.pos = end; // end-of-track
        break;
      } else {
        r.pos += metaLen;
      }
    } else if (status === 0xf0 || status === 0xf7) { // sysex
      const sysLen = r.vlq();
      r.pos += sysLen;
    } else {
      // невідомий статус — намагаємось не зависнути
      break;
    }
  }
  r.pos = end;
  return events;
}

export interface ParsedMidi {
  melody: Melody;
  bpm: number;
  /** Кількість «голосів», що були в треках (для індикатора). */
  voices: number;
}

/**
 * Парсити SMF-файл у Melody.
 * Об'єднує треки за абсолютним часом; при перекритті лишає верхню ноту.
 */
export function midiFileToMelody(bytes: Uint8Array): ParsedMidi {
  const r = new Reader(bytes);
  if (r.tag() !== "MThd") throw new Error("Невалідний MIDI: відсутній MThd");
  const headerLen = r.u32();
  if (headerLen !== 6) throw new Error("Невалідний MIDI: невірна довжина заголовка");
  const format = r.u16(); void format;
  const ntracks = r.u16();
  const division = r.u16();
  if (division & 0x8000) throw new Error("SMPTE-розбивка не підтримується");

  // Зібрати всі події з усіх треків.
  const all: RawEvent[] = [];
  for (let i = 0; i < ntracks; i++) {
    if (r.tag() !== "MTrk") throw new Error(`Невалідний MIDI: трек ${i} без MTrk`);
    const tlen = r.u32();
    const evs = parseTrack(r, tlen);
    all.push(...evs);
  }
  all.sort((a, b) => a.tick - b.tick);

  // BPM з першого set-tempo (інакше 120).
  let usPerQuarter = 500000;
  for (const e of all) {
    if (e.type === "tempo") { usPerQuarter = e.usPerQuarter!; break; }
  }
  const bpm = Math.round(60000000 / usPerQuarter);

  // Парні on/off → ноти. Стек активних нот за midi.
  type Active = { tick: number; midi: number };
  const active = new Map<number, Active>();
  interface Note { onsetTick: number; offTick: number; midi: number }
  const notes: Note[] = [];

  for (const e of all) {
    if (e.type === "on") {
      const ex = active.get(e.midi!);
      if (ex) notes.push({ onsetTick: ex.tick, offTick: e.tick, midi: e.midi! });
      active.set(e.midi!, { tick: e.tick, midi: e.midi! });
    } else if (e.type === "off") {
      const ex = active.get(e.midi!);
      if (ex) {
        notes.push({ onsetTick: ex.tick, offTick: e.tick, midi: e.midi! });
        active.delete(e.midi!);
      }
    }
  }

  if (notes.length === 0) {
    return { melody: melodyFromEvents([], 4), bpm, voices: 0 };
  }

  // Моно-редукція: при перекритті — верхня нота. Сортуємо за початком, обрізаємо.
  notes.sort((a, b) => a.onsetTick - b.onsetTick || a.midi - b.midi);
  const mono: Note[] = [];
  for (const n of notes) {
    const prev = mono[mono.length - 1];
    if (prev && prev.offTick > n.onsetTick) {
      if (n.midi > prev.midi) {
        prev.offTick = n.onsetTick;
        mono.push(n);
      }
      // інакше пропустити нижню (буде заглушена верхньою)
    } else {
      mono.push(n);
    }
  }

  // Конвертація тіків у долі (quarter notes).
  const events: MelodyEvent[] = mono.map((n) => ({
    pitch: pitchFromMidi(n.midi),
    onset: n.onsetTick / division,
    duration: Math.max(1 / 16, (n.offTick - n.onsetTick) / division),
  }));

  return {
    melody: melodyFromEvents(events, 4),
    bpm,
    voices: notes.length - mono.length > 0 ? 2 : 1,
  };
}

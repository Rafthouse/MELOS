import { pitchFromMidi, melodyTotalBeats, type Melody, type Scale } from "@melos/core-theory";
import type { Meter } from "./components/PianoRoll";

/** Експорт мелодії у Standard MIDI File (формат 0) і MusicXML. */

const MIDI_DIV = 480; // тіків на чверть

function varLen(value: number): number[] {
  const bytes: number[] = [];
  let buffer = value & 0x7f;
  while ((value >>= 7)) {
    buffer <<= 8;
    buffer |= (value & 0x7f) | 0x80;
  }
  for (;;) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) buffer >>= 8;
    else break;
  }
  return bytes;
}

function u32(n: number): number[] {
  return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

/** Згенерувати байти MIDI-файлу. */
export function melodyToMidi(melody: Melody, bpm: number): Uint8Array {
  type Ev = { tick: number; on: boolean; midi: number };
  const evs: Ev[] = [];
  for (const n of melody.notes) {
    const start = Math.round(n.onset * MIDI_DIV);
    const end = Math.max(start + 1, Math.round((n.onset + n.duration) * MIDI_DIV));
    evs.push({ tick: start, on: true, midi: n.pitch.midi });
    evs.push({ tick: end, on: false, midi: n.pitch.midi });
  }
  // off перед on на одному тіку
  evs.sort((a, b) => a.tick - b.tick || Number(a.on) - Number(b.on));

  const track: number[] = [];
  // темп
  const usPerQuarter = Math.round(60000000 / bpm);
  track.push(0x00, 0xff, 0x51, 0x03, (usPerQuarter >> 16) & 0xff, (usPerQuarter >> 8) & 0xff, usPerQuarter & 0xff);

  let prev = 0;
  for (const e of evs) {
    track.push(...varLen(e.tick - prev));
    track.push(e.on ? 0x90 : 0x80, e.midi & 0x7f, e.on ? 0x60 : 0x00);
    prev = e.tick;
  }
  track.push(0x00, 0xff, 0x2f, 0x00); // end of track

  const header = [0x4d, 0x54, 0x68, 0x64, ...u32(6), 0x00, 0x00, 0x00, 0x01, (MIDI_DIV >> 8) & 0xff, MIDI_DIV & 0xff];
  const trackChunk = [0x4d, 0x54, 0x72, 0x6b, ...u32(track.length), ...track];
  return new Uint8Array([...header, ...trackChunk]);
}

// ─────────────────────── MusicXML ───────────────────────

const XML_DIV = 8; // дільниць на чверть (роздільність до 32-х)
const TYPE_BY_DUR: { beats: number; type: string; dots: number }[] = [
  { beats: 4, type: "whole", dots: 0 },
  { beats: 3, type: "half", dots: 1 },
  { beats: 2, type: "half", dots: 0 },
  { beats: 1.5, type: "quarter", dots: 1 },
  { beats: 1, type: "quarter", dots: 0 },
  { beats: 0.75, type: "eighth", dots: 1 },
  { beats: 0.5, type: "eighth", dots: 0 },
  { beats: 0.375, type: "16th", dots: 1 },
  { beats: 0.25, type: "16th", dots: 0 },
  { beats: 0.125, type: "32nd", dots: 0 },
];
function nearestType(beats: number) {
  let best = TYPE_BY_DUR[4]!;
  let bd = Infinity;
  for (const e of TYPE_BY_DUR) {
    const d = Math.abs(beats - e.beats);
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

interface Piece { rest: boolean; midi: number; beats: number; tieStart: boolean; tieEnd: boolean }

function splitMeasures(melody: Melody, measureBeats: number): Piece[][] {
  const sorted = [...melody.notes].sort((a, b) => a.onset - b.onset);
  const items: { rest: boolean; midi: number; beats: number }[] = [];
  let cur = 0;
  for (const n of sorted) {
    if (n.onset > cur + 1e-3) items.push({ rest: true, midi: 0, beats: n.onset - cur });
    items.push({ rest: false, midi: n.pitch.midi, beats: n.duration });
    cur = Math.max(cur, n.onset + n.duration);
  }
  const measures: Piece[][] = [];
  let pos = 0;
  for (const it of items) {
    let rem = it.beats;
    let cont = false;
    while (rem > 1e-6) {
      const mi = Math.floor(pos / measureBeats + 1e-9);
      const take = Math.min(rem, (mi + 1) * measureBeats - pos);
      while (measures.length <= mi) measures.push([]);
      const willCont = rem - take > 1e-6;
      measures[mi]!.push({ rest: it.rest, midi: it.midi, beats: take, tieStart: !it.rest && willCont, tieEnd: !it.rest && cont });
      pos += take; rem -= take; cont = true;
    }
  }
  return measures;
}

function spell(midi: number, scale: Scale): { step: string; alter: number; octave: number } {
  const pc = ((midi % 12) + 12) % 12;
  const idx = scale.chromas.indexOf(pc);
  const name = idx >= 0 ? scale.noteNames[idx]! : pitchFromMidi(midi).name;
  const step = name[0]!;
  const alter = name.includes("#") ? 1 : name.includes("b") ? -1 : 0;
  return { step, alter, octave: Math.floor(midi / 12) - 1 };
}

/** Згенерувати MusicXML (score-partwise). */
export function melodyToMusicXML(melody: Melody, scale: Scale, meter: Meter): string {
  const measureBeats = (meter.num * 4) / meter.den;
  const measures = splitMeasures(melody, measureBeats);
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">');
  lines.push('<score-partwise version="3.1">');
  lines.push('<part-list><score-part id="P1"><part-name>Melody</part-name></score-part></part-list>');
  lines.push('<part id="P1">');

  measures.forEach((pieces, mi) => {
    lines.push(`<measure number="${mi + 1}">`);
    if (mi === 0) {
      lines.push(`<attributes><divisions>${XML_DIV}</divisions><time><beats>${meter.num}</beats><beat-type>${meter.den}</beat-type></time><clef><sign>G</sign><line>2</line></clef></attributes>`);
    }
    for (const p of pieces) {
      const { type, dots } = nearestType(p.beats);
      const dur = Math.max(1, Math.round(p.beats * XML_DIV));
      const dotXml = dots > 0 ? "<dot/>" : "";
      if (p.rest) {
        lines.push(`<note><rest/><duration>${dur}</duration><type>${type}</type>${dotXml}</note>`);
      } else {
        const { step, alter, octave } = spell(p.midi, scale);
        const alterXml = alter !== 0 ? `<alter>${alter}</alter>` : "";
        const tieEl = p.tieStart ? '<tie type="start"/>' : p.tieEnd ? '<tie type="stop"/>' : "";
        const tiedNot = p.tieStart ? '<notations><tied type="start"/></notations>'
          : p.tieEnd ? '<notations><tied type="stop"/></notations>' : "";
        lines.push(`<note><pitch><step>${step}</step>${alterXml}<octave>${octave}</octave></pitch><duration>${dur}</duration>${tieEl}<type>${type}</type>${dotXml}${tiedNot}</note>`);
      }
    }
    lines.push("</measure>");
  });

  lines.push("</part></score-partwise>");
  return lines.join("\n");
}

// ─────────────────────── Завантаження ───────────────────────

function download(data: BlobPart, filename: string, mime: string): void {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadMidi(melody: Melody, bpm: number, name = "melos-melody"): void {
  if (melody.notes.length === 0) return;
  const bytes = melodyToMidi(melody, bpm);
  download(bytes as unknown as BlobPart, `${name}.mid`, "audio/midi");
}

export function downloadMusicXML(melody: Melody, scale: Scale, meter: Meter, name = "melos-melody"): void {
  if (melody.notes.length === 0) return;
  download(melodyToMusicXML(melody, scale, meter), `${name}.musicxml`, "application/vnd.recordare.musicxml+xml");
}

/** Загальна тривалість для імені/налагодження. */
export function exportSummary(melody: Melody): { notes: number; beats: number } {
  return { notes: melody.notes.length, beats: melodyTotalBeats(melody) };
}

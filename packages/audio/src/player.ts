import * as Tone from "tone";
import type { Pitch, Scale } from "@melos/core-theory";
import { pitchesInOctave } from "@melos/core-theory";
import { getInstrument, type InstrumentId } from "./instruments";

/**
 * Одна нота для програвання.
 */
export interface NoteEvent {
  /** Ім'я ноти з октавою: "C4", "Eb5". */
  readonly note: string;
  /** Тривалість (Tone.js notation): "4n", "8n", "2n", "1n", або секунди. */
  readonly duration: string | number;
  /** Час відносно початку послідовності (секунди). */
  readonly time: number;
  /** Velocity 0–1 (гучність ноти). За замовчуванням 0.8. */
  readonly velocity?: number;
}

/** Опції програвання. */
export interface PlayOptions {
  /** Інструмент. За замовчуванням "piano". */
  instrument?: InstrumentId;
  /** BPM для розрахунку тривалостей. Якщо не задано — поточний глобальний. */
  bpm?: number;
  /** Callback після завершення програвання. */
  onComplete?: () => void;
}

// ──────────────────────── Активне програвання ────────────────────────

let currentPartId = 0;
let activePart: Tone.Part | null = null;

/** Зупинити поточне програвання. */
export function stopPlayback(): void {
  if (activePart) {
    activePart.stop();
    activePart.dispose();
    activePart = null;
  }
  Tone.getTransport().stop();
}

/** Чи щось зараз грає? */
export function isPlaying(): boolean {
  return activePart !== null && Tone.getTransport().state === "started";
}

/**
 * Програти послідовність NoteEvent-ів.
 * Зупиняє попереднє програвання, якщо є.
 */
export function playSequence(events: readonly NoteEvent[], opts: PlayOptions = {}): void {
  stopPlayback();
  if (events.length === 0) return;

  const instrumentId = opts.instrument ?? "piano";
  const instrument = getInstrument(instrumentId);
  const partId = ++currentPartId;

  const maxTime = events.reduce((max, e) => {
    const dur = typeof e.duration === "number" ? e.duration : Tone.Time(e.duration).toSeconds();
    return Math.max(max, e.time + dur);
  }, 0);

  const part = new Tone.Part((time, event: NoteEvent) => {
    if (partId !== currentPartId) return;

    if ("triggerAttackRelease" in instrument) {
      (instrument as Tone.PolySynth).triggerAttackRelease(
        event.note,
        event.duration,
        time,
        event.velocity ?? 0.8,
      );
    }
  }, events.map((e) => [e.time, e] as const));

  part.start(0);
  activePart = part;

  if (opts.bpm) {
    Tone.getTransport().bpm.value = opts.bpm;
  }

  Tone.getTransport().start();

  // Авто-стоп після завершення
  const safetyMargin = 0.5;
  Tone.getTransport().scheduleOnce(() => {
    if (partId === currentPartId) {
      stopPlayback();
      opts.onComplete?.();
    }
  }, `+${maxTime + safetyMargin}`);
}

// ──────────────────────── Високорівневі функції ────────────────────────

/**
 * Програти одну ноту.
 */
export function playNote(
  note: string,
  duration: string | number = "4n",
  opts: PlayOptions = {},
): void {
  playSequence([{ note, duration, time: 0 }], opts);
}

/**
 * Програти інтервал (мелодичний — дві ноти послідовно).
 */
export function playInterval(
  note1: string,
  note2: string,
  opts: PlayOptions & { harmonic?: boolean } = {},
): void {
  const dur = "2n";
  if (opts.harmonic) {
    playSequence([
      { note: note1, duration: dur, time: 0 },
      { note: note2, duration: dur, time: 0 },
    ], opts);
  } else {
    const gap = Tone.Time(dur).toSeconds();
    playSequence([
      { note: note1, duration: dur, time: 0 },
      { note: note2, duration: dur, time: gap },
    ], opts);
  }
}

/**
 * Програти акорд (усі ноти одночасно).
 */
export function playChord(
  notes: readonly string[],
  duration: string | number = "1n",
  opts: PlayOptions = {},
): void {
  playSequence(
    notes.map((note) => ({ note, duration, time: 0 })),
    opts,
  );
}

/** Напрямок програвання гами. */
export type ScaleDirection = "ascending" | "descending" | "ascending-descending";

/**
 * Програти гаму (Scale з core-theory) в заданій октаві.
 *
 * Це основна функція Mode Explorer: користувач обирає лад і тоніку —
 * чує всі ноти послідовно, з поверненням до тоніки октавою вище.
 */
export function playScale(
  scale: Scale,
  octave: number = 4,
  opts: PlayOptions & {
    direction?: ScaleDirection;
    /** Тривалість кожної ноти. За замовчуванням "4n". */
    noteDuration?: string;
    /** Додати дрон тоніки на октаву нижче? */
    drone?: boolean;
  } = {},
): void {
  const dir = opts.direction ?? "ascending-descending";
  const dur = opts.noteDuration ?? "4n";
  const gap = Tone.Time(dur).toSeconds();

  const pitches = pitchesInOctave(scale, octave);
  const names = pitches.map((p) => p.fullName);

  // Тоніка октавою вище — замикаючий звук
  const topTonic = `${scale.tonic}${octave + 1}`;

  let sequence: string[] = [];

  if (dir === "ascending" || dir === "ascending-descending") {
    sequence = [...names, topTonic];
  }

  if (dir === "descending") {
    sequence = [topTonic, ...names.slice().reverse()];
  }

  if (dir === "ascending-descending") {
    const desc = [...names].reverse();
    sequence = [...sequence, ...desc];
  }

  const events: NoteEvent[] = sequence.map((note, i) => ({
    note,
    duration: dur,
    time: i * gap,
    velocity: i === 0 || note === topTonic ? 0.95 : 0.75,
  }));

  // Дрон тоніки (октавою нижче, тихий, на весь час)
  if (opts.drone) {
    const droneNote = `${scale.tonic}${octave - 1}`;
    const totalDuration = events.length * gap + 0.5;
    events.push({
      note: droneNote,
      duration: totalDuration,
      time: 0,
      velocity: 0.25,
    });
  }

  playSequence(events, opts);
}

/**
 * Програти мелодію (масив Pitch із тривалостями).
 */
export interface MelodyNote {
  readonly pitch: Pitch;
  /** Тривалість у Tone.js нотації ("4n", "8n") або секундах. */
  readonly duration: string | number;
}

export function playMelody(
  notes: readonly MelodyNote[],
  opts: PlayOptions = {},
): void {
  let time = 0;
  const events: NoteEvent[] = notes.map((n) => {
    const event: NoteEvent = {
      note: n.pitch.fullName,
      duration: n.duration,
      time,
    };
    time += typeof n.duration === "number"
      ? n.duration
      : Tone.Time(n.duration).toSeconds();
    return event;
  });

  playSequence(events, opts);
}

import { pitch, pitchFromMidi, type Pitch } from "./pitch";

/**
 * Melody — канонічне представлення мелодії для аналізу.
 *
 * Час — у ДОЛЯХ (quarter notes) від початку, не в секундах.
 * Темп зберігається окремо (на рівні audio/playback).
 * У цю форму конвертуються MIDI / MusicXML / намальований контур / спів.
 */
export interface MelodyNote {
  readonly pitch: Pitch;
  /** Початок ноти у долях від початку мелодії. */
  readonly onset: number;
  /** Тривалість у долях. */
  readonly duration: number;
}

export interface Melody {
  readonly notes: readonly MelodyNote[];
  /** Доль у такті (напр. 4 для 4/4, 3 для 3/4). */
  readonly beatsPerBar: number;
}

/**
 * Побудувати мелодію з імен нот (з октавою: "C4", "E4").
 * За замовчуванням кожна нота — 1 доля, послідовно.
 */
export function melodyFromNoteNames(
  names: readonly string[],
  opts: { beatsPerBar?: number; durations?: readonly number[] } = {},
): Melody {
  const beatsPerBar = opts.beatsPerBar ?? 4;
  const durations = opts.durations;
  const notes: MelodyNote[] = [];
  let onset = 0;

  for (let i = 0; i < names.length; i++) {
    const dur = durations?.[i] ?? 1;
    notes.push({ pitch: pitch(names[i]!), onset, duration: dur });
    onset += dur;
  }

  return { notes, beatsPerBar };
}

/**
 * Побудувати мелодію з MIDI-номерів.
 */
export function melodyFromMidi(
  midis: readonly number[],
  opts: { beatsPerBar?: number; durations?: readonly number[] } = {},
): Melody {
  const beatsPerBar = opts.beatsPerBar ?? 4;
  const durations = opts.durations;
  const notes: MelodyNote[] = [];
  let onset = 0;

  for (let i = 0; i < midis.length; i++) {
    const dur = durations?.[i] ?? 1;
    notes.push({ pitch: pitchFromMidi(midis[i]!), onset, duration: dur });
    onset += dur;
  }

  return { notes, beatsPerBar };
}

/**
 * Подія для побудови мелодії з ЯВНИМИ onset/duration (піано-рол).
 * На відміну від melodyFromNoteNames (послідовні онсети), тут позиція і
 * довжина задаються прямо — це дозволяє паузи, синкопи, різні тривалості.
 */
export interface MelodyEvent {
  readonly pitch: Pitch;
  /** Початок у долях. */
  readonly onset: number;
  /** Тривалість у долях. */
  readonly duration: number;
}

/**
 * Побудувати мелодію з явних подій (піано-рол).
 * Сортує за onset — потрібно для контурного й інтервального аналізу,
 * що очікують ноти в часовому порядку.
 */
export function melodyFromEvents(
  events: readonly MelodyEvent[],
  beatsPerBar: number = 4,
): Melody {
  const notes = [...events]
    .sort((a, b) => a.onset - b.onset)
    .map((e) => ({ pitch: e.pitch, onset: e.onset, duration: e.duration }));
  return { notes, beatsPerBar };
}

/** MIDI-послідовність мелодії. */
export function melodyMidiSequence(m: Melody): number[] {
  return m.notes.map((n) => n.pitch.midi);
}

/**
 * Мелодичні інтервали між послідовними нотами (зі знаком, у семітонах).
 * Довжина = notes.length - 1.
 */
export function melodicIntervals(m: Melody): number[] {
  const result: number[] = [];
  for (let i = 1; i < m.notes.length; i++) {
    result.push(m.notes[i]!.pitch.midi - m.notes[i - 1]!.pitch.midi);
  }
  return result;
}

/** Діапазон мелодії (min/max MIDI, розмах у семітонах). */
export function melodyRange(m: Melody): { min: number; max: number; semitones: number } {
  if (m.notes.length === 0) return { min: 0, max: 0, semitones: 0 };
  let min = Infinity;
  let max = -Infinity;
  for (const n of m.notes) {
    if (n.pitch.midi < min) min = n.pitch.midi;
    if (n.pitch.midi > max) max = n.pitch.midi;
  }
  return { min, max, semitones: max - min };
}

/** Загальна тривалість мелодії у долях (до кінця останньої ноти). */
export function melodyTotalBeats(m: Melody): number {
  if (m.notes.length === 0) return 0;
  return m.notes.reduce((max, n) => Math.max(max, n.onset + n.duration), 0);
}

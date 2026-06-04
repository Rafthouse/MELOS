import { Note, Midi } from "tonal";
import { mod12 } from "./util";

/**
 * Pitch — іменована висота з октавою.
 *
 * Критично: розрізняємо D# і Eb (enharmonic spelling) —
 * без цього неможливі правильні інтервали й голосоведіння.
 * Tonal.js дає це з коробки; ми обгортаємо у свій тип.
 */
export interface Pitch {
  /** Ім'я ноти зі знаком: "C", "D#", "Eb", "F##" тощо (без октави). */
  readonly name: string;
  /** Октава (4 = середня). */
  readonly octave: number;
  /** MIDI-номер (C4 = 60). */
  readonly midi: number;
  /** Pitch-class 0–11 (C=0, C#/Db=1, … B=11). */
  readonly chroma: number;
  /** Повне ім'я з октавою: "C4", "Eb5". */
  readonly fullName: string;
}

/**
 * Створити Pitch зі стрічки ("C4", "Eb5", "F#3").
 * Кидає помилку, якщо стрічка невалідна.
 */
export function pitch(src: string): Pitch {
  const n = Note.get(src);
  if (n.empty || n.midi == null || n.chroma == null || n.oct == null) {
    throw new Error(`Невалідна нота: "${src}"`);
  }
  return {
    name: n.pc,
    octave: n.oct,
    midi: n.midi,
    chroma: n.chroma,
    fullName: n.name,
  };
}

/**
 * Створити Pitch з MIDI-номера.
 * Spelling за замовчуванням — діезний (C# а не Db).
 * Для правильного spelling у контексті ладу — використовувати Scale.pitchAtDegree().
 */
export function pitchFromMidi(midi: number): Pitch {
  const name = Midi.midiToNoteName(midi);
  return pitch(name);
}

/**
 * Pitch-class (0–11) з імені ноти без октави ("C", "Eb", "F#").
 */
export function chroma(noteName: string): number {
  const n = Note.get(noteName);
  if (n.empty || n.chroma == null) {
    throw new Error(`Невалідне ім'я ноти: "${noteName}"`);
  }
  return n.chroma;
}

/**
 * Транспонувати Pitch на задану кількість семітонів.
 * Spelling зберігається наскільки можливо (Tonal.js transpose).
 */
export function transposePitch(p: Pitch, semitones: number): Pitch {
  const intervalName = semitonesToInterval(semitones);
  const result = Note.transpose(p.fullName, intervalName);
  return pitch(result);
}

/** Усі 12 імен pitch-class (діезний spelling). */
export const PITCH_CLASSES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
] as const;

/** Бемольні імена pitch-class. */
export const PITCH_CLASSES_FLAT = [
  "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B",
] as const;

/**
 * Перетворити абсолютну кількість семітонів (зі знаком) на ім'я інтервалу Tonal.
 * Внутрішній хелпер.
 */
function semitonesToInterval(semitones: number): string {
  const abs = Math.abs(semitones);
  const pc = mod12(abs);
  const octaves = Math.floor(abs / 12);

  const baseIntervals: Record<number, string> = {
    0: "1P", 1: "2m", 2: "2M", 3: "3m", 4: "3M", 5: "4P",
    6: "4A", 7: "5P", 8: "6m", 9: "6M", 10: "7m", 11: "7M",
  };

  let name = baseIntervals[pc] ?? "1P";

  if (octaves > 0 && pc === 0) {
    const num = octaves * 7 + 1;
    name = `${num}P`;
  } else if (octaves > 0) {
    const baseNum = parseInt(name);
    const compound = baseNum + octaves * 7;
    name = `${compound}${name.slice(-1)}`;
  }

  return semitones < 0 ? `-${name}` : name;
}

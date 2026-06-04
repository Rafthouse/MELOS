import { Note } from "tonal";
import { mod12 } from "./util";
import { pitch, chroma, PITCH_CLASSES, PITCH_CLASSES_FLAT, type Pitch } from "./pitch";

/**
 * Scale — конкретний лад від конкретної тоніки.
 *
 * Створюється з ModeDefinition.formula + tonic.
 * Це основна робоча одиниця Mode Explorer:
 * «D Dorian», «A Phrygian dominant», «F# Ukrainian Dorian».
 */
export interface Scale {
  /** ID ладу (з ModeDefinition). */
  readonly modeId: string;
  /** Тоніка (pitch-class ім'я: "C", "D", "Eb"). */
  readonly tonic: string;
  /** Chroma тоніки (0–11). */
  readonly tonicChroma: number;
  /** Формула (семітони від тоніки, з ModeDefinition). */
  readonly formula: readonly number[];
  /** Абсолютні chromas усіх ступенів (0–11). */
  readonly chromas: readonly number[];
  /** Іменовані ступені з правильним spelling. */
  readonly noteNames: readonly string[];
  /** Кардинальність (кількість ступенів). */
  readonly cardinality: number;
}

// ─────────────────────── Spelling нот ───────────────────────

const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
const LETTER_CHROMA: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

/** Знак альтерації за відхиленням від натуральної ноти (-2..+2). */
function accidentalFor(diff: number): string | null {
  switch (diff) {
    case -2: return "bb";
    case -1: return "b";
    case 0: return "";
    case 1: return "#";
    case 2: return "##";
    default: return null; // потрібен потрійний знак — недіатонічно, fallback
  }
}

/**
 * Гептатонічне написання: 7 ступенів → 7 послідовних літер від тоніки,
 * кожна літера рівно один раз (правильне нотне написання).
 *
 * Напр. D Phrygian dominant [0,1,4,5,7,8,10]:
 *   D → Eb → F# → G → A → Bb → C  (а не D# → A#).
 *
 * Повертає null, якщо якийсь ступінь потребує потрійного знака
 * (тоді викликач відкочується на простий chroma-spelling).
 */
function spellHeptatonic(tonic: string, formula: readonly number[]): string[] | null {
  const tonicLetter = tonic[0]!;
  const tonicLetterIdx = LETTERS.indexOf(tonicLetter as (typeof LETTERS)[number]);
  if (tonicLetterIdx === -1) return null;

  const tc = chroma(tonic);
  const names: string[] = [];

  for (let i = 0; i < formula.length; i++) {
    const target = mod12(tc + formula[i]!);
    const letter = LETTERS[(tonicLetterIdx + i) % 7]!;
    const natChroma = LETTER_CHROMA[letter]!;
    let diff = mod12(target - natChroma);
    if (diff > 6) diff -= 12; // → діапазон -5..+6, для діатоніки -2..+2
    const acc = accidentalFor(diff);
    if (acc === null) return null;
    names.push(letter + acc);
  }
  return names;
}

/**
 * Стратегія spelling для НЕгептатонічних ладів (5, 6, 8 нот).
 * Бемолі, якщо тоніка бемольна або лад мінорний із «чорними» нотами;
 * інакше діези. Для пентатонік/whole-tone цього достатньо.
 */
const FLAT_TONICS = new Set([
  "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb",
]);

function useFlats(tonic: string, formula: readonly number[]): boolean {
  if (tonic.includes("b")) return true;
  if (FLAT_TONICS.has(tonic)) return true;

  const tc = chroma(tonic);
  const hasMinorThird = formula.some((s) => s === 3);
  const blackKeys = formula
    .map((s) => mod12(tc + s))
    .filter((c) => [1, 3, 6, 8, 10].includes(c)).length;

  if (hasMinorThird && blackKeys >= 1) return true;

  return false;
}

function chromaToName(chr: number, flats: boolean): string {
  return flats
    ? (PITCH_CLASSES_FLAT[chr] ?? "C")
    : (PITCH_CLASSES[chr] ?? "C");
}

/**
 * Написати ноти ладу.
 * 7 ступенів → правильне гептатонічне написання (кожна літера один раз).
 * Інша кардинальність → проста chroma-евристика (флет/дієз за тонікою/ладом).
 */
function spellScale(tonic: string, formula: readonly number[], chromas: readonly number[]): string[] {
  if (formula.length === 7) {
    const hepta = spellHeptatonic(tonic, formula);
    if (hepta) return hepta;
  }
  const flats = useFlats(tonic, formula);
  return chromas.map((c) => chromaToName(c, flats));
}

/**
 * Створити Scale з формули ладу і тоніки.
 *
 * @param modeId  — ID ладу (для зв'язку з ModeDefinition)
 * @param formula — масив семітонів від тоніки (з ModeDefinition.formula)
 * @param tonic   — ім'я тоніки ("C", "D", "Eb", "F#" тощо)
 */
export function createScale(
  modeId: string,
  formula: readonly number[],
  tonic: string,
): Scale {
  const tc = chroma(tonic);
  const chromas = formula.map((s) => mod12(tc + s));
  const noteNames = spellScale(tonic, formula, chromas);

  return {
    modeId,
    tonic,
    tonicChroma: tc,
    formula,
    chromas,
    noteNames,
    cardinality: formula.length,
  };
}

/**
 * Транспонувати Scale в нову тоніку (зберігаючи лад).
 * Це операція «Try in this mode» для зміни тоніки.
 */
export function transposeScale(scale: Scale, newTonic: string): Scale {
  return createScale(scale.modeId, scale.formula, newTonic);
}

/**
 * Який ступінь (1-based) посідає дана висота у цій Scale?
 * Повертає undefined, якщо висота не належить до ладу.
 */
export function degreeOf(scale: Scale, noteName: string): number | undefined {
  const c = chroma(noteName);
  const idx = scale.chromas.indexOf(c);
  return idx === -1 ? undefined : idx + 1;
}

/**
 * Чи належить дана висота до ладу?
 */
export function belongsToScale(scale: Scale, noteName: string): boolean {
  return degreeOf(scale, noteName) !== undefined;
}

/**
 * Ім'я ноти на заданому ступені (1-based).
 */
export function noteAtDegree(scale: Scale, degree: number): string | undefined {
  if (degree < 1 || degree > scale.cardinality) return undefined;
  return scale.noteNames[degree - 1];
}

/**
 * Pitch на заданому ступені у заданій октаві.
 */
export function pitchAtDegree(scale: Scale, degree: number, octave: number): Pitch | undefined {
  const name = noteAtDegree(scale, degree);
  if (!name) return undefined;
  return pitch(`${name}${octave}`);
}

/**
 * Усі Pitch-і ладу в одній октаві (від tonic в заданій октаві до октави вище).
 */
export function pitchesInOctave(scale: Scale, octave: number): Pitch[] {
  const result: Pitch[] = [];
  const tonicPitch = pitch(`${scale.tonic}${octave}`);
  let currentOctave = octave;

  for (let i = 0; i < scale.cardinality; i++) {
    const name = scale.noteNames[i]!;
    const c = scale.chromas[i]!;

    if (i > 0 && c <= scale.chromas[i - 1]!) {
      currentOctave++;
    }

    result.push(pitch(`${name}${currentOctave}`));
  }

  return result;
}

/**
 * Найближча нота ладу до заданого chroma (snap-to-scale).
 * При рівній відстані — обирає нижчу.
 */
export function nearestScaleTone(scale: Scale, chr: number): {
  degree: number;
  chroma: number;
  noteName: string;
  distance: number;
} {
  const normalized = mod12(chr);
  let bestDegree = 0;
  let bestDist = 12;

  for (let i = 0; i < scale.cardinality; i++) {
    const sc = scale.chromas[i]!;
    const dist = Math.min(mod12(normalized - sc), mod12(sc - normalized));
    if (dist < bestDist) {
      bestDist = dist;
      bestDegree = i;
    }
  }

  return {
    degree: bestDegree + 1,
    chroma: scale.chromas[bestDegree]!,
    noteName: scale.noteNames[bestDegree]!,
    distance: bestDist,
  };
}

/**
 * «Try in this mode» — переодягнути послідовність ступенів з одного ладу в інший.
 *
 * Кожну ноту вхідної мелодії:
 * 1. Знаходимо, який ступінь вона посідає у sourceScale (або найближчий).
 * 2. Беремо той самий ступінь у targetScale.
 *
 * Повертає масив імен нот (без октави) у цільовому ладу.
 */
export function recastInMode(
  noteNames: readonly string[],
  sourceScale: Scale,
  targetScale: Scale,
): string[] {
  return noteNames.map((n) => {
    const deg = degreeOf(sourceScale, n);
    if (deg !== undefined) {
      return noteAtDegree(targetScale, deg) ?? nearestScaleTone(targetScale, chroma(n)).noteName;
    }
    return nearestScaleTone(targetScale, chroma(n)).noteName;
  });
}

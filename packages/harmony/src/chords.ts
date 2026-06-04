import type { Scale } from "@melos/core-theory";

export type ChordFunction = "T" | "S" | "D" | "other";

export interface ChordSpec {
  /** Римська цифровка: I, ii, V7, ♭VII… */
  roman: string;
  /** Ступінь ладу (1-based), на якому збудовано акорд. */
  degree: number;
  /** Pitch-class-и акорду (0–11). */
  pcs: number[];
  /** Програвні MIDI-висоти (тісне розташування, октава ~3). */
  midis: number[];
  function: ChordFunction;
  /** Якість: major/minor/dim/aug + опційний 7. */
  quality: string;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];
// Функційна мапа для мажороподібних ладів (наближення за ступенем).
const FUNCTION_BY_DEGREE: ChordFunction[] = ["T", "S", "T", "S", "D", "T", "D"];

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

/** Якість тризвуччя за інтервалами від кореня. */
function triadQuality(third: number, fifth: number): { q: string; upper: boolean; suffix: string } {
  if (third === 4 && fifth === 7) return { q: "major", upper: true, suffix: "" };
  if (third === 3 && fifth === 7) return { q: "minor", upper: false, suffix: "" };
  if (third === 3 && fifth === 6) return { q: "dim", upper: false, suffix: "°" };
  if (third === 4 && fifth === 8) return { q: "aug", upper: true, suffix: "+" };
  // нестандартне (напр. sus) — трактуємо як major-подібне
  return { q: "other", upper: true, suffix: "" };
}

/**
 * Діатонічні тризвуччя ладу (по одному на кожен ступінь).
 * Працює для гептатонічних ладів; для інших кардинальностей — стільки, скільки є.
 */
export function diatonicTriads(scale: Scale): ChordSpec[] {
  const card = scale.cardinality;
  const triads: ChordSpec[] = [];

  for (let i = 0; i < card; i++) {
    const rootPc = scale.chromas[i]!;
    const thirdPc = scale.chromas[(i + 2) % card]!;
    const fifthPc = scale.chromas[(i + 4) % card]!;
    const third = mod12(thirdPc - rootPc);
    const fifth = mod12(fifthPc - rootPc);
    const { q, upper, suffix } = triadQuality(third, fifth);

    const base = ROMAN[i % 7] ?? "?";
    const roman = (upper ? base : base.toLowerCase()) + suffix;

    // Програвні midis: тісне висхідне розташування від октави 3.
    const pcs = [rootPc, thirdPc, fifthPc];
    const midis: number[] = [];
    let prev = -1;
    for (const pc of pcs) {
      let m = 48 + pc; // C3 = 48
      while (m <= prev) m += 12;
      prev = m;
      midis.push(m);
    }

    triads.push({
      roman,
      degree: i + 1,
      pcs,
      midis,
      function: card === 7 ? (FUNCTION_BY_DEGREE[i] ?? "other") : "other",
      quality: q,
    });
  }
  return triads;
}

/** Додати септиму (наступний діатонічний тон) до акорду — для джазу. */
export function addSeventh(scale: Scale, chord: ChordSpec): ChordSpec {
  const card = scale.cardinality;
  const i = chord.degree - 1;
  const seventhPc = scale.chromas[(i + 6) % card]!;
  const rootPc = chord.pcs[0]!;
  let m = chord.midis[chord.midis.length - 1]! + 1;
  const target = 48 + seventhPc;
  while (mod12(m) !== seventhPc) m++;
  void rootPc; void target;
  return {
    ...chord,
    roman: chord.roman + "7",
    pcs: [...chord.pcs, seventhPc],
    midis: [...chord.midis, m],
    quality: chord.quality + "7",
  };
}

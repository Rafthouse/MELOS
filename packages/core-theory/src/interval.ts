import type { Pitch } from "./pitch";
import { mod12 } from "./util";

/**
 * Якість інтервалу.
 * d = diminished, m = minor, P = perfect, M = major, A = augmented.
 */
export type IntervalQuality = "d" | "m" | "P" | "M" | "A";

/**
 * Напрямок: ascending (вгору) або descending (вниз).
 * Unison = ascending за конвенцією.
 */
export type Direction = "ascending" | "descending";

/**
 * Affect-тег інтервалу — Level 1 ТЗ.
 * Кожен інтервал несе емоційний/характерний підпис.
 */
export interface IntervalAffect {
  readonly uk: string;
  readonly en: string;
}

/**
 * Interval — повна характеристика відстані між двома висотами.
 */
export interface Interval {
  /** Семітони (завжди ≥ 0). */
  readonly semitones: number;
  /** Якість. */
  readonly quality: IntervalQuality;
  /** Ступінь (число): 1=прима, 2=секунда, …, 8=октава. */
  readonly number: number;
  /** Скорочене ім'я: "m2", "P5", "M7" тощо. */
  readonly name: string;
  /** Напрямок. */
  readonly direction: Direction;
  /** Affect-тег з Level 1. */
  readonly affect: IntervalAffect;
}

/**
 * Таблиця affect-тегів для інтервалів 0–12 семітонів (Level 1 ТЗ).
 *
 * Індекс = кількість семітонів. Ці описи — педагогічні, не абсолютні;
 * контекст (лад, ритм, регістр) змінює сприйняття.
 */
const AFFECT: readonly IntervalAffect[] = [
  /* 0  P1 */ { uk: "тотожність, злиття", en: "identity, fusion" },
  /* 1  m2 */ { uk: "напруга, провідний тон, тертя", en: "tension, leading tone, friction" },
  /* 2  M2 */ { uk: "пейзажна стабільність, крок", en: "landscape stability, a step" },
  /* 3  m3 */ { uk: "мінорна забарвленість, інтимність", en: "minor colouring, intimacy" },
  /* 4  M3 */ { uk: "мажорна світлість", en: "major brightness" },
  /* 5  P4 */ { uk: "фанфарність, заклик", en: "fanfare, a call" },
  /* 6  A4 */ { uk: "нестабільність, відкритість до руху", en: "instability, openness to motion" },
  /* 7  P5 */ { uk: "порожнеча, відкритість простору, «дзвін»", en: "emptiness, open space, a 'bell'" },
  /* 8  m6 */ { uk: "туга, ностальгія", en: "longing, nostalgia" },
  /* 9  M6 */ { uk: "солодкавість, романтика", en: "sweetness, romance" },
  /* 10 m7 */ { uk: "рух до тоніки, тяжіння", en: "motion toward the tonic, gravity" },
  /* 11 M7 */ { uk: "провідний тон, найсильніше тяжіння", en: "leading tone, the strongest pull" },
  /* 12 P8 */ { uk: "повернення, завершеність", en: "return, completeness" },
];

/**
 * Якість і ступінь за кількістю семітонів (0–12).
 * Для тритону обираємо A4 (не d5) — конвенція.
 */
const INTERVAL_TABLE: readonly { quality: IntervalQuality; number: number }[] = [
  /* 0  */ { quality: "P", number: 1 },
  /* 1  */ { quality: "m", number: 2 },
  /* 2  */ { quality: "M", number: 2 },
  /* 3  */ { quality: "m", number: 3 },
  /* 4  */ { quality: "M", number: 3 },
  /* 5  */ { quality: "P", number: 4 },
  /* 6  */ { quality: "A", number: 4 },
  /* 7  */ { quality: "P", number: 5 },
  /* 8  */ { quality: "m", number: 6 },
  /* 9  */ { quality: "M", number: 6 },
  /* 10 */ { quality: "m", number: 7 },
  /* 11 */ { quality: "M", number: 7 },
  /* 12 */ { quality: "P", number: 8 },
];

function getAffect(semitones: number): IntervalAffect {
  const clamped = Math.min(Math.abs(semitones), 12);
  return AFFECT[clamped] ?? AFFECT[0]!;
}

function getInfo(semitones: number): { quality: IntervalQuality; number: number } {
  const clamped = Math.min(Math.abs(semitones), 12);
  return INTERVAL_TABLE[clamped] ?? INTERVAL_TABLE[0]!;
}

/**
 * Обчислити інтервал між двома Pitch-ами.
 */
export function interval(from: Pitch, to: Pitch): Interval {
  const raw = to.midi - from.midi;
  const abs = Math.abs(raw);
  const direction: Direction = raw >= 0 ? "ascending" : "descending";
  const info = getInfo(abs);
  const affect = getAffect(abs);

  return {
    semitones: abs,
    quality: info.quality,
    number: info.number,
    name: `${info.quality}${info.number}`,
    direction,
    affect,
  };
}

/**
 * Інтервал за кількістю семітонів (без контексту Pitch; direction = ascending).
 */
export function intervalFromSemitones(semitones: number): Interval {
  const abs = Math.abs(semitones);
  const direction: Direction = semitones >= 0 ? "ascending" : "descending";
  const info = getInfo(abs);
  const affect = getAffect(abs);

  return {
    semitones: abs,
    quality: info.quality,
    number: info.number,
    name: `${info.quality}${info.number}`,
    direction,
    affect,
  };
}

/**
 * Чи є інтервал кроком (step: m2/M2)?
 * Правило gap-fill (Level 1): після стрибка > P4 наступний рух — крок у протилежному напрямку.
 */
export function isStep(iv: Interval): boolean {
  return iv.semitones <= 2 && iv.semitones >= 1;
}

/**
 * Чи є інтервал стрибком (leap: більше M2)?
 */
export function isLeap(iv: Interval): boolean {
  return iv.semitones > 2;
}

/**
 * Чи стрибок перевищує чисту кварту (поріг gap-fill правила)?
 */
export function isWideLeap(iv: Interval): boolean {
  return iv.semitones > 5;
}

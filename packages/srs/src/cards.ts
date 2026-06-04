/**
 * Доменні типи карток Ear Training.
 *
 * Кожна картка = конкретна вправа (розпізнавання інтервалу, лад на слух тощо).
 * FSRS-стан (stability, difficulty, due) зберігається окремо в scheduler.
 * Тут — лише «що саме тренуємо».
 *
 * Прив'язка до курикулуму (ТЗ M9): картки прив'язані до modeId/рівня,
 * щоб тренувати саме те, з чим користувач працює в Mode Explorer.
 */

/**
 * Тип вправи.
 *
 * v0.1: interval-recognition, mode-recognition
 * Пізніше: rhythm-recognition, cadence-recognition, pitch-singing
 */
export type ExerciseKind =
  | "interval-recognition"
  | "mode-recognition"
  | "pitch-singing"
  | "cadence-recognition"
  | "rhythm-recognition";

/** Напрямок інтервалу у вправі. */
export type IntervalDirection = "ascending" | "descending" | "harmonic";

/**
 * Визначення картки — НЕЗМІННЕ опис того, ЩО тренуємо.
 * Один і той самий CardDef може мати різні FSRS-стани у різних «сесіях».
 */
export interface CardDef {
  /** Унікальний ID картки (детермінований з параметрів). */
  readonly id: string;
  /** Тип вправи. */
  readonly kind: ExerciseKind;
  /** Рівень курикулуму (0–10), до якого належить. */
  readonly level: number;
  /** Прив'язка до ладу (якщо є). */
  readonly modeId?: string;
}

// ─────────────────────── Конкретні типи карток ───────────────────────

/**
 * Картка розпізнавання інтервалу.
 * «Почути два звуки — назвати інтервал.»
 */
export interface IntervalCard extends CardDef {
  readonly kind: "interval-recognition";
  /** Семітони інтервалу (1–12). */
  readonly semitones: number;
  /** Напрямок. */
  readonly direction: IntervalDirection;
}

/**
 * Картка розпізнавання ладу.
 * «Почути гаму — назвати лад.»
 */
export interface ModeCard extends CardDef {
  readonly kind: "mode-recognition";
  /** ID ладу з @melos/data. */
  readonly modeId: string;
}

/**
 * Картка інтонування (pitch singing).
 * «Почути тоніку, проспівати заданий інтервал вгору/вниз.»
 */
export interface PitchSingingCard extends CardDef {
  readonly kind: "pitch-singing";
  /** Семітони інтервалу, який треба проспівати. */
  readonly semitones: number;
  readonly direction: "ascending" | "descending";
}

/** Об'єднаний тип конкретних карток. */
export type AnyCard = IntervalCard | ModeCard | PitchSingingCard;

// ─────────────────────── Фабрики ───────────────────────

/** Детермінований ID для інтервальної картки. */
function intervalCardId(semitones: number, direction: IntervalDirection): string {
  return `interval:${semitones}:${direction}`;
}

/** Детермінований ID для модальної картки. */
function modeCardId(modeId: string): string {
  return `mode:${modeId}`;
}

/** Детермінований ID для pitch-singing картки. */
function pitchSingingCardId(semitones: number, direction: "ascending" | "descending"): string {
  return `sing:${semitones}:${direction}`;
}

/**
 * Генерувати всі інтервальні картки (m2…P8, у трьох напрямках).
 * Level 0–1 курикулуму.
 */
export function generateIntervalCards(): IntervalCard[] {
  const cards: IntervalCard[] = [];
  const directions: IntervalDirection[] = ["ascending", "descending", "harmonic"];

  for (let semi = 1; semi <= 12; semi++) {
    for (const dir of directions) {
      cards.push({
        id: intervalCardId(semi, dir),
        kind: "interval-recognition",
        level: semi <= 7 ? 0 : 1,
        semitones: semi,
        direction: dir,
      });
    }
  }
  return cards;
}

/**
 * Генерувати картки розпізнавання ладів для заданих modeId.
 * Прив'язка до курикулуму: створюються лише для ладів, які користувач
 * відкрив у Mode Explorer.
 */
export function generateModeCards(modeIds: readonly string[]): ModeCard[] {
  return modeIds.map((modeId) => ({
    id: modeCardId(modeId),
    kind: "mode-recognition" as const,
    level: 6,
    modeId,
  }));
}

/**
 * Генерувати картки інтонування (pitch singing) для інтервалів 1–12.
 * Level 0 курикулуму.
 */
export function generatePitchSingingCards(): PitchSingingCard[] {
  const cards: PitchSingingCard[] = [];
  const directions: Array<"ascending" | "descending"> = ["ascending", "descending"];

  for (let semi = 1; semi <= 12; semi++) {
    for (const dir of directions) {
      cards.push({
        id: pitchSingingCardId(semi, dir),
        kind: "pitch-singing",
        level: 0,
        semitones: semi,
        direction: dir,
      });
    }
  }
  return cards;
}

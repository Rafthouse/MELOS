import type { ModeFamily } from "@melos/data";

/** Двомовні назви сімейств ладів для групування в списку. */
export const FAMILY_LABELS: Record<ModeFamily, string> = {
  church: "Церковні лади",
  "melodic-minor-modes": "Мінор та похідні",
  symmetric: "Симетричні",
  messiaen: "Лади Месіана",
  ukrainian: "Українські",
  balkan: "Балканські",
  raga: "Раги",
  maqam: "Макамо",
  japanese: "Японські",
  pentatonic: "Пентатоніки",
  blues: "Блюзові",
  bebop: "Bebop",
  synthetic: "Синтетичні",
};

/** Порядок показу сімейств у списку. */
export const FAMILY_ORDER: ModeFamily[] = [
  "church",
  "pentatonic",
  "blues",
  "melodic-minor-modes",
  "ukrainian",
  "symmetric",
  "balkan",
  "maqam",
  "raga",
  "japanese",
  "messiaen",
  "bebop",
  "synthetic",
];

/** Дванадцять тонік для вибору (діезний spelling за замовчуванням). */
export const TONICS = [
  "C", "C#", "D", "Eb", "E", "F",
  "F#", "G", "Ab", "A", "Bb", "B",
] as const;

/**
 * Українські назви інтервалів за кількістю семітонів (1–12).
 * Стиль ТЗ Level 1 (м.2, в.2, ч.4, тритон, ч.5…).
 */
export const UA_INTERVAL_NAMES: Record<number, string> = {
  1: "м.2",
  2: "в.2",
  3: "м.3",
  4: "в.3",
  5: "ч.4",
  6: "тритон",
  7: "ч.5",
  8: "м.6",
  9: "в.6",
  10: "м.7",
  11: "в.7",
  12: "ч.8",
};

/** Повні українські назви інтервалів. */
export const UA_INTERVAL_FULL: Record<number, string> = {
  1: "мала секунда",
  2: "велика секунда",
  3: "мала терція",
  4: "велика терція",
  5: "чиста кварта",
  6: "тритон",
  7: "чиста квінта",
  8: "мала секста",
  9: "велика секста",
  10: "мала септима",
  11: "велика септима",
  12: "чиста октава",
};

/** Назви типів каденцій. */
export const CADENCE_LABELS: Record<string, string> = {
  PAC: "Досконала автентична (V–I)",
  IAC: "Недосконала автентична",
  HC: "Половинна (на V)",
  deceptive: "Обманна (V–vi)",
  plagal: "Плагальна (IV–I)",
  phrygian: "Фрігійська",
  modal: "Модальна",
  none: "—",
};

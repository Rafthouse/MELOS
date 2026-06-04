import { melodyTotalBeats, type Melody, type Scale } from "@melos/core-theory";
import {
  transposeDiatonic,
  invertDiatonic,
  retrograde,
  retrogradeInversion,
  scaleRhythm,
  fragment,
  expandIntervals,
  sequence,
  liquidate,
} from "./transform";

export interface Localized {
  readonly uk: string;
  readonly en: string;
}

/**
 * Розвинений варіант мотиву з підписаною технікою (ТЗ M4).
 * Кожен пояснюється і має джерело — принцип ТЗ §7.
 */
export interface MotifVariant {
  readonly technique: string;
  readonly label: Localized;
  readonly explanation: Localized;
  readonly citationIds: readonly string[];
  readonly melody: Melody;
}

/**
 * Згенерувати куровану добірку розвинених варіантів мотиву.
 * Повертає [] для мотиву менше 2 нот.
 */
export function generateVariants(motif: Melody, scale: Scale): MotifVariant[] {
  if (motif.notes.length < 2) return [];
  const n = motif.notes.length;
  const half = Math.max(2, Math.ceil(n / 2));
  const variants: MotifVariant[] = [];

  variants.push({
    technique: "sequence-up",
    label: { uk: "Секвенція вгору (тональна)", en: "Sequence up (tonal)" },
    explanation: {
      uk: "Мотив повторюється, щоразу зміщений на ступінь ладу вгору. Тональна секвенція — найпоширеніший спосіб розгортання мотиву (Schoenberg).",
      en: "The motif repeats, each time shifted up one scale step. A tonal sequence — the most common way to spin a motif out (Schoenberg).",
    },
    citationIds: ["schoenberg-fundamentals"],
    melody: sequence(motif, scale, 1, 3),
  });

  variants.push({
    technique: "sequence-down",
    label: { uk: "Секвенція вниз (тональна)", en: "Sequence down (tonal)" },
    explanation: {
      uk: "Та сама фігура, що спускається на ступінь нижче з кожним повтором — спадна секвенція створює відчуття розрядки.",
      en: "The same figure descending one step per repeat — a descending sequence releases tension.",
    },
    citationIds: ["schoenberg-fundamentals"],
    melody: sequence(motif, scale, -1, 3),
  });

  variants.push({
    technique: "inversion",
    label: { uk: "Інверсія (дзеркальна)", en: "Inversion (melodic mirror)" },
    explanation: {
      uk: "Кожен інтервал дзеркалиться навколо першої ноти: рух угору стає рухом униз. Зберігає ритм, змінює напрямок контуру.",
      en: "Every interval is mirrored around the first note: upward motion becomes downward. Keeps the rhythm, flips the contour.",
    },
    citationIds: ["schoenberg-fundamentals", "fux-1725"],
    melody: invertDiatonic(motif, scale),
  });

  variants.push({
    technique: "retrograde",
    label: { uk: "Ракохід (реверс у часі)", en: "Retrograde (reversed in time)" },
    explanation: {
      uk: "Мотив звучить від кінця до початку — реверсуються і висоти, і ритм. Класичний контрапунктичний прийом.",
      en: "The motif sounds back to front — both pitch and rhythm reverse. A classic contrapuntal device.",
    },
    citationIds: ["fux-1725", "schoenberg-fundamentals"],
    melody: retrograde(motif),
  });

  variants.push({
    technique: "retrograde-inversion",
    label: { uk: "Ракохідна інверсія", en: "Retrograde inversion" },
    explanation: {
      uk: "Інверсія, програна задом наперед — поєднання двох перетворень. Сильно змінює мотив, але зберігає його «генетику».",
      en: "An inversion played backwards — two transformations combined. Strongly alters the motif while keeping its ‘genetics’.",
    },
    citationIds: ["fux-1725", "schoenberg-fundamentals"],
    melody: retrogradeInversion(motif),
  });

  variants.push({
    technique: "augmentation",
    label: { uk: "Аугментація (×2)", en: "Augmentation (×2)" },
    explanation: {
      uk: "Усі тривалості подвоєно — мотив звучить удвічі повільніше й вагоміше. Часто маркує кульмінацію чи коду.",
      en: "All durations doubled — the motif sounds twice as slow and weighty. Often marks a climax or coda.",
    },
    citationIds: ["schoenberg-fundamentals"],
    melody: scaleRhythm(motif, 2),
  });

  variants.push({
    technique: "diminution",
    label: { uk: "Дімінуція (÷2)", en: "Diminution (÷2)" },
    explanation: {
      uk: "Усі тривалості вдвічі коротші — мотив пришвидшується, набуває ажитації. Засіб ущільнення розвитку.",
      en: "All durations halved — the motif speeds up, gaining agitation. A means of intensifying the development.",
    },
    citationIds: ["schoenberg-fundamentals"],
    melody: scaleRhythm(motif, 0.5),
  });

  variants.push({
    technique: "fragmentation",
    label: { uk: "Фрагментація", en: "Fragmentation" },
    explanation: {
      uk: `Виокремлено суб-мотив (перші ${half} ноти) і повторено — фрагмент стає самостійним будівельним блоком.`,
      en: `A sub-motif (first ${half} notes) is isolated and repeated — the fragment becomes an independent building block.`,
    },
    citationIds: ["schoenberg-fundamentals"],
    melody: sequence(fragment(motif, 0, half), scale, 0, 2),
  });

  variants.push({
    technique: "interval-expansion",
    label: { uk: "Інтервальне розширення (×2)", en: "Interval expansion (×2)" },
    explanation: {
      uk: "Кожен крок розширено вдвічі — контур стає драматичнішим, стрибки ширшими, зберігаючи напрямок.",
      en: "Each step is doubled in size — the contour becomes more dramatic, the leaps wider, while keeping direction.",
    },
    citationIds: ["schoenberg-fundamentals"],
    melody: expandIntervals(motif, 2),
  });

  variants.push({
    technique: "liquidation",
    label: { uk: "Ліквідація", en: "Liquidation" },
    explanation: {
      uk: "Характеристичні інтервали поступово згасають до нейтральності — мотив «розчиняється» до кінця фрази (Schoenberg).",
      en: "The characteristic intervals gradually fade to neutrality — the motif ‘dissolves’ toward the end of the phrase (Schoenberg).",
    },
    citationIds: ["schoenberg-fundamentals"],
    melody: liquidate(motif),
  });

  // Транспозиція на квінту — як «відповідь» (фуга).
  variants.push({
    technique: "transpose-5th",
    label: { uk: "Транспозиція на квінту («відповідь»)", en: "Transposition by a 5th (the ‘answer’)" },
    explanation: {
      uk: "Мотив звучить на ступінь домінанти — як «відповідь» у фузі на «вождь». Зберігає контур, переносить у нову тональну зону.",
      en: "The motif sounds at the dominant degree — like a fugue ‘answer’ to the ‘subject’. Keeps the contour, shifts the tonal area.",
    },
    citationIds: ["fux-1725", "schoenberg-fundamentals"],
    melody: transposeDiatonic(motif, scale, 4),
  });

  // Відфільтрувати порожні/тривіальні (напр. дімінуція дуже короткого мотиву).
  return variants.filter((v) => v.melody.notes.length > 0 && melodyTotalBeats(v.melody) > 0);
}

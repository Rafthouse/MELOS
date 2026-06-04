import type { Melody, Scale } from "@melos/core-theory";
import { ornament, chromaticApproach, tremolo, decimate, wholeTone, withDrone } from "./ops";

export interface Localized {
  uk: string;
  en: string;
}

export interface StyleVariation {
  id: string;
  label: Localized;
  /** Стилістичні маркери (що визначає стиль). */
  markers: Localized;
  /** Що змінено в мелодії. */
  changes: Localized;
  melody: Melody;
}

/**
 * Згенерувати стильові варіації мелодії (ТЗ M7).
 */
export function generateVariations(melody: Melody, scale: Scale): StyleVariation[] {
  if (melody.notes.length < 2) return [];

  return [
    {
      id: "baroque",
      label: { uk: "Бароко", en: "Baroque" },
      markers: { uk: "мелізматика, безперервний рух, заповнення стрибків", en: "melismatic figuration, continuous motion, filled leaps" },
      changes: { uk: "Стрибки на терцію заповнено прохідними тонами ладу — мелодія тече плавніше.", en: "Third leaps filled with diatonic passing tones — the line flows more smoothly." },
      melody: ornament(melody, scale),
    },
    {
      id: "bebop",
      label: { uk: "Bebop", en: "Bebop" },
      markers: { uk: "хроматичні підходи до цільових тонів, віртуозність", en: "chromatic approach notes, virtuosity" },
      changes: { uk: "Перед кожною нотою додано короткий хроматичний підхід на півтон знизу.", en: "A short chromatic approach a semitone below is added before each note." },
      melody: chromaticApproach(melody),
    },
    {
      id: "black-metal",
      label: { uk: "Black metal", en: "Black metal" },
      markers: { uk: "тремоло, невпинний драйв, темний колорит", en: "tremolo picking, relentless drive, dark colour" },
      changes: { uk: "Кожну ноту перетворено на тремоло — швидке повторення.", en: "Each note becomes a tremolo — fast repetition." },
      melody: tremolo(melody, 4),
    },
    {
      id: "dub",
      label: { uk: "Dub techno", en: "Dub techno" },
      markers: { uk: "ритмічна децимація, простір, мінімалізм", en: "rhythmic decimation, space, minimalism" },
      changes: { uk: "Прибрано половину нот; ті, що лишились, розтягнуто — більше повітря.", en: "Half the notes removed; survivors are stretched — more air." },
      melody: decimate(melody),
    },
    {
      id: "impressionist",
      label: { uk: "Імпресіонізм", en: "Impressionism" },
      markers: { uk: "цілотонна гама, розмитий лад, мерехтіння", en: "whole-tone scale, blurred tonality, shimmer" },
      changes: { uk: "Висоти перефарбовано в цілотонну колекцію — зникає тяжіння тоніки.", en: "Pitches recoloured into a whole-tone collection — the tonic pull dissolves." },
      melody: wholeTone(melody),
    },
    {
      id: "modal-folk",
      label: { uk: "Modal folk / drone", en: "Modal folk / drone" },
      markers: { uk: "дрон тоніки, модальність, архаїка", en: "tonic drone, modality, archaism" },
      changes: { uk: "Додано витриманий бас-дрон на тоніці під усю мелодію.", en: "A sustained tonic drone is added beneath the whole melody." },
      melody: withDrone(melody, scale),
    },
  ];
}

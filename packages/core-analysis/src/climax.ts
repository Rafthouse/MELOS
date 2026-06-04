import type { Melody } from "@melos/core-theory";
import { melodyTotalBeats } from "@melos/core-theory";
import { makeFinding, type Finding } from "./finding";

/** Золотий перетин — Барток використовував його для розміщення кульмінації. */
export const GOLDEN_RATIO = 0.618;

/**
 * Аналіз позиції кульмінації (найвищої ноти).
 * Оптимум — близько 0.618 від довжини фрази (золотий перетин, Барток).
 * Якщо кульмінація далеко від нього — Finding-підказка.
 */
export function analyzeClimax(melody: Melody): Finding | null {
  const notes = melody.notes;
  if (notes.length < 3) return null;

  const total = melodyTotalBeats(melody);
  if (total <= 0) return null;

  // Найвища нота (перша з максимальних).
  let maxMidi = -Infinity;
  let climaxIdx = 0;
  for (let i = 0; i < notes.length; i++) {
    if (notes[i]!.pitch.midi > maxMidi) {
      maxMidi = notes[i]!.pitch.midi;
      climaxIdx = i;
    }
  }

  const pos = notes[climaxIdx]!.onset / total;
  const distance = Math.abs(pos - GOLDEN_RATIO);
  const posPct = Math.round(pos * 100);

  if (distance <= 0.12) {
    return makeFinding({
      kind: "climax-position",
      severity: "info",
      message: {
        uk: `Кульмінація на ${posPct}% довжини — близько до золотого перетину (0.618). Гарне розміщення.`,
        en: `Climax at ${posPct}% of the length — close to the golden section (0.618). Good placement.`,
      },
      params: { positionPercent: posPct },
      citationIds: ["bartok-golden-section"],
    });
  }

  return makeFinding({
    kind: "climax-position",
    severity: "suggestion",
    message: {
      uk: `Кульмінаційна нота припадає на ${posPct}% довжини фрази — спробуйте посунути ближче до 0.62 (золотий перетин).`,
      en: `The climax falls at ${posPct}% of the phrase — try moving it closer to 0.62 (the golden section).`,
    },
    location: { startIndex: climaxIdx },
    params: { positionPercent: posPct },
    citationIds: ["bartok-golden-section"],
  });
}

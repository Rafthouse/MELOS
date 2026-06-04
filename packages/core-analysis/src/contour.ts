import type { Melody } from "@melos/core-theory";
import { melodyMidiSequence } from "@melos/core-theory";
import { makeFinding, type Finding, type Localized } from "./finding";

/**
 * Типи контуру (Morris/Friedmann c-space; Savage et al. 2015).
 * Arch — кросс-культурна універсалія і базова форма більшості earworm-ів.
 */
export type ContourType =
  | "ascending"
  | "descending"
  | "arch"
  | "inverted-arch"
  | "plateau"
  | "undulating";

const CONTOUR_LABELS: Record<ContourType, Localized> = {
  ascending: { uk: "висхідний", en: "ascending" },
  descending: { uk: "спадний", en: "descending" },
  arch: { uk: "арковий (підйом-спуск)", en: "arch (rise-fall)" },
  "inverted-arch": { uk: "обернена арка (спуск-підйом)", en: "inverted arch (fall-rise)" },
  plateau: { uk: "плато (майже без руху)", en: "plateau (little motion)" },
  undulating: { uk: "хвилястий", en: "undulating" },
};

/**
 * Класифікувати контур послідовності MIDI-висот.
 */
export function classifyContour(midi: readonly number[]): ContourType {
  const n = midi.length;
  if (n < 2) return "plateau";

  let min = Infinity;
  let max = -Infinity;
  let minIdx = 0;
  let maxIdx = 0;
  for (let i = 0; i < n; i++) {
    const v = midi[i]!;
    if (v < min) { min = v; minIdx = i; }
    if (v > max) { max = v; maxIdx = i; }
  }

  const range = max - min;
  if (range <= 2) return "plateau";

  const first = midi[0]!;
  const last = midi[n - 1]!;

  const interiorMax = maxIdx > 0 && maxIdx < n - 1;
  const interiorMin = minIdx > 0 && minIdx < n - 1;
  const endsBelowMax = max - first >= range * 0.4 && max - last >= range * 0.4;
  const endsAboveMin = first - min >= range * 0.4 && last - min >= range * 0.4;

  // Кількість змін напрямку (turning points).
  let turns = 0;
  let prevDir = 0;
  for (let i = 1; i < n; i++) {
    const d = Math.sign(midi[i]! - midi[i - 1]!);
    if (d !== 0) {
      if (prevDir !== 0 && d !== prevDir) turns++;
      prevDir = d;
    }
  }

  if (interiorMax && endsBelowMax && !(interiorMin && endsAboveMin) && turns <= 1) {
    return "arch";
  }
  if (interiorMin && endsAboveMin && !(interiorMax && endsBelowMax) && turns <= 1) {
    return "inverted-arch";
  }

  const net = last - first;
  if (turns <= 1) {
    if (net > 0) return "ascending";
    if (net < 0) return "descending";
  }
  return "undulating";
}

/**
 * Аналіз контуру мелодії → Finding (info).
 * Для arch додає примітку про earworm-універсальність.
 */
export function analyzeContour(melody: Melody): Finding {
  const midi = melodyMidiSequence(melody);
  const type = classifyContour(midi);
  const label = CONTOUR_LABELS[type];

  const archNote =
    type === "arch"
      ? {
          uk: " — кросс-культурна універсалія, базова форма earworm-ів",
          en: " — a cross-cultural universal, the base shape of earworms",
        }
      : { uk: "", en: "" };

  return makeFinding({
    kind: "contour",
    severity: "info",
    message: {
      uk: `Контур мелодії: ${label.uk}${archNote.uk}.`,
      en: `Melodic contour: ${label.en}${archNote.en}.`,
    },
    params: { contour: type },
    citationIds: ["savage-2015", "morris-1993"],
  });
}

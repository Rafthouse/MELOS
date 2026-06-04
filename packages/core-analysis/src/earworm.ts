import type { Melody } from "@melos/core-theory";
import {
  melodyMidiSequence,
  melodyRange,
  melodicIntervals,
  melodyTotalBeats,
} from "@melos/core-theory";
import { classifyContour } from "./contour";
import { makeFinding, type Finding } from "./finding";

/**
 * Earworm potential score (Jakubowski et al. 2017 «Dissecting an Earworm»).
 * Прокси-фічі, що корелюють з INMI у дослідженні:
 * - arch-контур (підпис багатьох earworm-ів)
 * - помірний діапазон (вокально-співний)
 * - повторювані ритмічні фігури (рекурентність)
 * - спадні в.2 (m2) у кульмінаційному регіоні
 * - помірна щільність нот (тривалості)
 *
 * Не претендує на точність дослідження — це педагогічна оцінка з посиланням
 * на джерело. Шкала 0–100; >65 = «висока прилипчивість».
 */

export interface EarwormBreakdown {
  total: number; // 0..100
  archBonus: number;
  rangeBonus: number;
  rhythmicRecurrenceBonus: number;
  descendingM2Bonus: number;
  densityBonus: number;
}

/** Рахунок повторень найчастішої ритмічної фігури (тривалостей). */
function rhythmicRecurrence(durations: number[]): number {
  if (durations.length < 4) return 0;
  const counts = new Map<number, number>();
  for (const d of durations) {
    const k = Math.round(d * 100) / 100;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const max = Math.max(...counts.values());
  return max / durations.length; // 0..1
}

/** Чи нота в «верхній третині» діапазону (кульмінаційний регіон)? */
function isInClimaxRegion(midi: number, min: number, max: number): boolean {
  if (max === min) return false;
  return (midi - min) / (max - min) >= 2 / 3;
}

export function earwormBreakdown(melody: Melody): EarwormBreakdown {
  if (melody.notes.length < 3) {
    return { total: 0, archBonus: 0, rangeBonus: 0, rhythmicRecurrenceBonus: 0, descendingM2Bonus: 0, densityBonus: 0 };
  }
  const midi = melodyMidiSequence(melody);
  const { semitones } = melodyRange(melody);
  const ivs = melodicIntervals(melody);
  const total = melodyTotalBeats(melody);

  // 1) Arch contour bonus (Jakubowski: arch = earworm-універсалія)
  const contour = classifyContour(midi);
  const archBonus = contour === "arch" ? 25 : contour === "ascending" || contour === "descending" ? 10 : 5;

  // 2) Range: оптимум 12–19 семітонів (вокально-співний)
  let rangeBonus = 0;
  if (semitones >= 12 && semitones <= 19) rangeBonus = 20;
  else if (semitones >= 7 && semitones <= 24) rangeBonus = 12;
  else rangeBonus = 4;

  // 3) Ритмічна рекурентність
  const durations = melody.notes.map((n) => n.duration);
  const rec = rhythmicRecurrence(durations);
  const rhythmicRecurrenceBonus = Math.round(rec * 20);

  // 4) Спадні m2 у кульмінаційному регіоні
  const { min, max } = melodyRange(melody);
  let descendingM2 = 0;
  for (let i = 0; i < ivs.length; i++) {
    if (ivs[i] === -1) {
      const from = midi[i]!;
      if (isInClimaxRegion(from, min, max)) descendingM2++;
    }
  }
  const descendingM2Bonus = Math.min(15, descendingM2 * 5);

  // 5) Помірна щільність (нот на долю)
  const density = melody.notes.length / Math.max(1, total);
  let densityBonus = 0;
  if (density >= 0.8 && density <= 2.5) densityBonus = 20;
  else if (density >= 0.5 && density <= 4) densityBonus = 12;
  else densityBonus = 5;

  const totalScore = Math.min(100, archBonus + rangeBonus + rhythmicRecurrenceBonus + descendingM2Bonus + densityBonus);
  return { total: totalScore, archBonus, rangeBonus, rhythmicRecurrenceBonus, descendingM2Bonus, densityBonus };
}

export function earwormScore(melody: Melody): number {
  return earwormBreakdown(melody).total;
}

/**
 * Finding з earworm-оцінкою.
 * Завжди info — це довідка, не порада.
 */
export function analyzeEarworm(melody: Melody): Finding | null {
  if (melody.notes.length < 4) return null;
  const b = earwormBreakdown(melody);
  const tier = b.total >= 65 ? "висока" : b.total >= 45 ? "помірна" : "низька";
  const tierEn = b.total >= 65 ? "high" : b.total >= 45 ? "moderate" : "low";
  return makeFinding({
    kind: "earworm",
    severity: "info",
    message: {
      uk: `Earworm-потенціал: ${b.total}/100 (${tier}). Складники: arch-контур +${b.archBonus}, діапазон +${b.rangeBonus}, ритм-рекурентність +${b.rhythmicRecurrenceBonus}, спадні m2 на кульмінації +${b.descendingM2Bonus}, щільність +${b.densityBonus}.`,
      en: `Earworm potential: ${b.total}/100 (${tierEn}). Breakdown: arch contour +${b.archBonus}, range +${b.rangeBonus}, rhythmic recurrence +${b.rhythmicRecurrenceBonus}, descending m2 in climax region +${b.descendingM2Bonus}, density +${b.densityBonus}.`,
    },
    params: { earwormScore: b.total },
    citationIds: ["jakubowski-2017"],
  });
}

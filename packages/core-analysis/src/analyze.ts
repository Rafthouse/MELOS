import type { Melody, Scale } from "@melos/core-theory";
import type { Finding } from "./finding";
import { analyzeContour } from "./contour";
import {
  analyzeGapFill,
  analyzeStepwiseRatio,
  analyzeRange,
  analyzeLeadingTone,
} from "./melodic";
import { analyzeClimax } from "./climax";
import { analyzeSyncopation } from "./rhythm";

export interface AnalyzeOptions {
  /** Тональний контекст — вмикає аналізи, що його потребують (провідний тон). */
  scale?: Scale;
  /** Підрозділів на долю для ритмічного аналізу. За замовчуванням 4. */
  subdivision?: number;
}

/**
 * Повний аналіз мелодії → масив Finding.
 *
 * Це вхідна точка для real-time critique панелі (M1 Composer's Lab).
 * Findings відсортовані: warning → suggestion → info.
 */
export function analyzeMelody(melody: Melody, opts: AnalyzeOptions = {}): Finding[] {
  const findings: Finding[] = [];

  // Завжди (без тонального контексту)
  findings.push(analyzeContour(melody));
  findings.push(...analyzeGapFill(melody));

  const stepwise = analyzeStepwiseRatio(melody);
  if (stepwise) findings.push(stepwise);

  const range = analyzeRange(melody);
  if (range) findings.push(range);

  const climax = analyzeClimax(melody);
  if (climax) findings.push(climax);

  findings.push(analyzeSyncopation(melody, opts.subdivision ?? 4));

  // Потребує тонального контексту
  if (opts.scale) {
    findings.push(...analyzeLeadingTone(melody, opts.scale));
  }

  // Сортування за пріоритетом серйозності
  const order: Record<string, number> = { warning: 0, suggestion: 1, info: 2 };
  findings.sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3));

  return findings;
}

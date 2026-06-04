export { makeFinding } from "./finding";
export type { Finding, FindingKind, Severity, Localized } from "./finding";

export { classifyContour, analyzeContour } from "./contour";
export type { ContourType } from "./contour";

export {
  analyzeGapFill,
  analyzeStepwiseRatio,
  analyzeRange,
  analyzeLeadingTone,
} from "./melodic";

export { analyzeClimax, GOLDEN_RATIO } from "./climax";

export { metricWeight, syncopationIndex, analyzeSyncopation } from "./rhythm";

export {
  detectCliches, predictabilityScore, analyzePredictability, analyzeBanality,
} from "./antibanality";

export {
  earwormScore, earwormBreakdown, analyzeEarworm,
} from "./earworm";
export type { EarwormBreakdown } from "./earworm";

export { computeDna } from "./dna";
export type {
  MelodyDna, IntervalHistogramBin, DurationHistogramBin,
} from "./dna";

export { patternToDrumDna } from "./drumDna";
export type {
  DrumDna, DrumPattern, DrumEvent, TrackStat,
} from "./drumDna";

export { analyzeMelody } from "./analyze";
export type { AnalyzeOptions } from "./analyze";

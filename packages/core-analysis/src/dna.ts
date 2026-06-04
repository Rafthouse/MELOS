import {
  melodicIntervals,
  melodyMidiSequence,
  melodyRange,
  melodyTotalBeats,
  degreeOf,
  type Melody,
  type Scale,
} from "@melos/core-theory";
import { classifyContour, type ContourType } from "./contour";
import { syncopationIndex } from "./rhythm";
import { earwormBreakdown, type EarwormBreakdown } from "./earworm";
import { predictabilityScore, detectCliches } from "./antibanality";
import { GOLDEN_RATIO } from "./climax";

/**
 * Hit DNA Analyzer (ТЗ M3): «генетичний паспорт» мелодії.
 * Чистий агрегатор готових аналізаторів у одну компактну структуру для UI.
 * Опційно — секція ритм-DNA, у яку згодом стікатимуть паттерни з GGL.
 */

export interface IntervalHistogramBin {
  /** Семітони зі знаком: -12..+12. */
  semis: number;
  count: number;
}

export interface DurationHistogramBin {
  /** Тривалість у долях (1=чверть, 0.5=восьма…). */
  beats: number;
  count: number;
}

export interface MelodyDna {
  // Загальне
  noteCount: number;
  totalBeats: number;

  // Висота / контур
  contour: ContourType;
  rangeSemitones: number;
  intervalHistogram: IntervalHistogramBin[];

  // Рух
  /** Частка кроків (0..1) у мелодичному русі. */
  stepwiseRatio: number;
  /** Кількість стрибків > ч.4 без розв'язання кроком (Narmour gap-fill). */
  gapFillUnresolved: number;

  // Кульмінація / структура
  climaxPosition: number; // 0..1
  /** Дистанція до золотого перетину 0.618 (0 = ідеально). */
  climaxGoldenDistance: number;

  // Ритм
  syncopationIndex: number;
  /** Нот на долю. */
  density: number;
  durationHistogram: DurationHistogramBin[];

  // Тональність
  /** Кількість провідних тонів (7) без розв'язання в тоніку. */
  leadingToneUnresolved: number;

  // Earworm + свіжість
  earworm: EarwormBreakdown;
  predictability: number;
  cliches: { id: string; label: string }[];
}

/** Дистанція позиції кульмінації до золотого перетину. */
function climaxInfo(melody: Melody): { position: number; goldenDistance: number } {
  if (melody.notes.length < 2) return { position: 0, goldenDistance: 0 };
  const total = melodyTotalBeats(melody);
  if (total <= 0) return { position: 0, goldenDistance: 0 };
  let maxMidi = -Infinity;
  let climaxIdx = 0;
  for (let i = 0; i < melody.notes.length; i++) {
    if (melody.notes[i]!.pitch.midi > maxMidi) {
      maxMidi = melody.notes[i]!.pitch.midi;
      climaxIdx = i;
    }
  }
  const pos = melody.notes[climaxIdx]!.onset / total;
  return { position: pos, goldenDistance: Math.abs(pos - GOLDEN_RATIO) };
}

function intervalHistogram(melody: Melody): IntervalHistogramBin[] {
  const ivs = melodicIntervals(melody);
  const counts = new Map<number, number>();
  for (const d of ivs) {
    const k = Math.max(-12, Math.min(12, d));
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const bins: IntervalHistogramBin[] = [];
  for (let s = -12; s <= 12; s++) {
    bins.push({ semis: s, count: counts.get(s) ?? 0 });
  }
  return bins;
}

function durationHistogram(melody: Melody): DurationHistogramBin[] {
  const counts = new Map<number, number>();
  for (const n of melody.notes) {
    const k = Math.round(n.duration * 100) / 100;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([beats, count]) => ({ beats, count }));
}

function stepwiseRatio(melody: Melody): number {
  const ivs = melodicIntervals(melody).filter((d) => d !== 0);
  if (ivs.length === 0) return 0;
  const steps = ivs.filter((d) => Math.abs(d) >= 1 && Math.abs(d) <= 2).length;
  return steps / ivs.length;
}

function gapFillUnresolved(melody: Melody): number {
  const ivs = melodicIntervals(melody);
  let count = 0;
  for (let i = 0; i < ivs.length; i++) {
    const leap = ivs[i]!;
    if (Math.abs(leap) <= 5) continue;
    const next = ivs[i + 1];
    if (next === undefined) continue;
    const resolved =
      Math.abs(next) >= 1 && Math.abs(next) <= 2 && Math.sign(next) === -Math.sign(leap);
    if (!resolved) count++;
  }
  return count;
}

function leadingToneUnresolved(melody: Melody, scale: Scale): number {
  if (!scale.formula.includes(11)) return 0;
  let count = 0;
  for (let i = 0; i < melody.notes.length - 1; i++) {
    const deg = degreeOf(scale, melody.notes[i]!.pitch.name);
    if (deg !== 7) continue;
    const nextDeg = degreeOf(scale, melody.notes[i + 1]!.pitch.name);
    if (nextDeg !== 1) count++;
  }
  return count;
}

/** Обчислити генетичний паспорт мелодії. */
export function computeDna(melody: Melody, scale: Scale, subdivision: number = 4): MelodyDna {
  const noteCount = melody.notes.length;
  const totalBeats = melodyTotalBeats(melody);
  const midi = melodyMidiSequence(melody);
  const { semitones } = melodyRange(melody);
  const contour = classifyContour(midi);
  const climax = climaxInfo(melody);
  const ew = earwormBreakdown(melody);
  const density = totalBeats > 0 ? noteCount / totalBeats : 0;
  const cliches = detectCliches(melody, scale).map((f) => ({
    id: String(f.params?.cliche ?? "unknown"),
    label: f.message.uk.split(".")[0]!,
  }));

  return {
    noteCount,
    totalBeats,
    contour,
    rangeSemitones: semitones,
    intervalHistogram: intervalHistogram(melody),
    stepwiseRatio: stepwiseRatio(melody),
    gapFillUnresolved: gapFillUnresolved(melody),
    climaxPosition: climax.position,
    climaxGoldenDistance: climax.goldenDistance,
    syncopationIndex: noteCount >= 2 ? syncopationIndex(melody, subdivision) : 0,
    density,
    durationHistogram: durationHistogram(melody),
    leadingToneUnresolved: leadingToneUnresolved(melody, scale),
    earworm: ew,
    predictability: predictabilityScore(melody),
    cliches,
  };
}

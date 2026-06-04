/**
 * DrumDna — генетичний паспорт ритму (M3 точка інтеграції для GGL).
 *
 * Універсальний інтерфейс: будь-який drum-pattern (GGL, наш RhythmDesigner,
 * імпорт MIDI drums) можна конвертувати у спільний DrumDna через цей шар.
 */

import { metricWeight } from "./rhythm";

/** Подія drum-pattern у форматі-агностику до джерела. */
export interface DrumEvent {
  /** ID треку (kick, snare, hat, …). */
  track: string;
  /** Крок (від 0). */
  step: number;
  /** Velocity 0..1. Для accent / ghost трактується автоматично. */
  velocity: number;
  /** Опц. флаги. */
  ghost?: boolean;
  accent?: boolean;
  /** Опц. шар: core/ornament/fill/ghost/accent. */
  layer?: string;
}

export interface DrumPattern {
  bars: number;
  stepsPerBar: number;
  beatsPerBar: number;
  tempo: number;
  events: DrumEvent[];
}

export interface TrackStat {
  track: string;
  count: number;
  /** Метрична вага: середнє над усіма ударами цього треку. */
  meanMetricWeight: number;
}

export interface DrumDna {
  totalEvents: number;
  totalSteps: number;
  bars: number;
  tempo: number;
  /** Активних доріжок (де є ≥1 удар). */
  activeTracks: number;
  density: number; // подій / крок
  /** Загальна синкопованість: сума |weight| для офбіт-ударів. */
  syncopationIndex: number;
  /** Розподіл за шарами (layer). */
  roleMix: Record<string, number>;
  /** Стат по треках. */
  tracks: TrackStat[];
  /** Ghost/Accent співвідношення. */
  ghostRatio: number;
  accentRatio: number;
}

const STRONG_WEIGHT_THRESHOLD = -2; // 0 / -1 = сильна, нижче — офбіт

export function patternToDrumDna(p: DrumPattern): DrumDna {
  const totalEvents = p.events.length;
  const totalSteps = p.bars * p.stepsPerBar;
  const subdivision = p.stepsPerBar / p.beatsPerBar;

  const trackCounts = new Map<string, number>();
  const trackWeights = new Map<string, number[]>();
  const roleMix: Record<string, number> = {};
  let syncopation = 0;
  let ghost = 0;
  let accent = 0;

  for (const e of p.events) {
    trackCounts.set(e.track, (trackCounts.get(e.track) ?? 0) + 1);
    if (!trackWeights.has(e.track)) trackWeights.set(e.track, []);
    const w = metricWeight(e.step, p.beatsPerBar, subdivision);
    trackWeights.get(e.track)!.push(w);
    if (w < STRONG_WEIGHT_THRESHOLD) syncopation += Math.abs(w);
    if (e.layer) roleMix[e.layer] = (roleMix[e.layer] ?? 0) + 1;
    if (e.ghost) ghost++;
    if (e.accent) accent++;
  }

  const tracks: TrackStat[] = [...trackCounts.entries()]
    .map(([track, count]) => {
      const weights = trackWeights.get(track)!;
      const mean = weights.reduce((s, w) => s + w, 0) / Math.max(1, weights.length);
      return { track, count, meanMetricWeight: Math.round(mean * 100) / 100 };
    })
    .sort((a, b) => b.count - a.count);

  return {
    totalEvents,
    totalSteps,
    bars: p.bars,
    tempo: p.tempo,
    activeTracks: trackCounts.size,
    density: totalSteps > 0 ? totalEvents / totalSteps : 0,
    syncopationIndex: Math.round(syncopation),
    roleMix,
    tracks,
    ghostRatio: totalEvents > 0 ? ghost / totalEvents : 0,
    accentRatio: totalEvents > 0 ? accent / totalEvents : 0,
  };
}

// analysis/groove-dna.ts — метрики груву з GGL `seed`.
// Синкопа: Longuet-Higgins & Lee (1984), lite. grooveZone: Vuust et al. (2014).

import { stepsPerBar, beatStep } from '../transport/time';
import type { GrooveDNA, Meter } from '../types';

export function metricWeight(step: number, spb: number, bStep: number): number {
  if (step % spb === 0) return 5;
  if (step % bStep === 0) return 4;
  if (step % (bStep / 2) === 0) return 2;
  return 1;
}

function lhlSyncopation(onsets: number[], spb: number, bStep: number): number {
  const set = new Set(onsets);
  let sync = 0, denom = 0;
  for (const s of onsets) {
    const w = metricWeight(s, spb, bStep);
    let q = -1;
    for (let k = 1; k < spb; k++) {
      const p = (s + k) % spb;
      if (metricWeight(p, spb, bStep) > w) { q = p; break; }
    }
    denom += 4;
    if (q >= 0 && !set.has(q)) sync += metricWeight(q, spb, bStep) - w;
  }
  return denom > 0 ? Math.min(1, (sync / denom) * 1.5) : 0;
}

export function grooveDNA(seed: Record<string, number[]>, meter: Meter): GrooveDNA {
  const spb = stepsPerBar(meter);
  const bStep = beatStep(meter);
  const kick = (seed.kick ?? []).slice().sort((a, b) => a - b);
  const snare = seed.snare ?? [];
  const rim = seed.rim ?? [];

  const beats: number[] = [];
  for (let s = 0; s < spb; s += bStep) beats.push(s);

  const kickOnBeat = kick.filter((s) => s % bStep === 0);
  const kickOffbeat = kick.filter((s) => s % bStep !== 0);
  const beatsCovered = beats.length > 0 ? beats.filter((b) => kick.includes(b)).length / beats.length : 0;
  const kickAlignment = kick.length > 0 ? kickOnBeat.length / kick.length : 0;
  const offbeatRatio = kick.length > 0 ? kickOffbeat.length / kick.length : 0;
  const density = kick.length / spb;
  const fourOnFloor = beatsCovered === 1 && offbeatRatio === 0;

  const skeleton = [...new Set([...kick, ...snare, ...rim])].sort((a, b) => a - b);
  const syncopation = lhlSyncopation(skeleton, spb, bStep);

  const backbeats = beats.filter((_, i) => i % 2 === 1);
  const ghosts = [...snare, ...rim].filter((s) => !backbeats.includes(s));
  const ghostDensity = Math.min(1, ghosts.length / spb);

  const grooveZone = Math.max(0, 1 - Math.abs(syncopation - 0.45) / 0.55);

  return {
    spb, bStep, beats, kick,
    kickAlignment, offbeatRatio, beatsCovered, density,
    syncopation, ghostDensity, fourOnFloor, grooveZone,
  };
}

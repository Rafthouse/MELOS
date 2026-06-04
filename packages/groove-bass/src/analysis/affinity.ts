// analysis/affinity.ts — ДНК-спорідненість архетипів (крос-жанрові сусіди).
// Вектор [R M S D Rg L H]; GrooveLock(5) і Syncopation(2) важать ×1.5, Range(4) ×0.5.

import type { BassArchetype } from '../types';

const WEIGHTS = [1, 1, 1.5, 1, 0.5, 1.5, 1];

/** 1 − зважена евклідова відстань по 7 осях (0..1, де 1 = ідентичні). */
export function affinity(a: BassArchetype, b: BassArchetype): number {
  let acc = 0, wsum = 0;
  for (let i = 0; i < 7; i++) {
    const w = WEIGHTS[i]!;
    const d = (a.bassDNA[i]! - b.bassDNA[i]!) / 9;
    acc += w * d * d;
    wsum += w;
  }
  return 1 - Math.sqrt(acc / wsum);
}

export interface Neighbor { archetype: BassArchetype; affinity: number; }

/** Найближчі ДНК-сусіди (за межами власної id), відсортовані. */
export function neighbors(a: BassArchetype, catalog: BassArchetype[], n = 4): Neighbor[] {
  return catalog
    .filter((x) => x.id !== a.id)
    .map((x) => ({ archetype: x, affinity: affinity(a, x) }))
    .sort((p, q) => q.affinity - p.affinity)
    .slice(0, n);
}

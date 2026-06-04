// analysis/recommend.ts — Groove → Bass mapping engine.
// Шар A (каталог): (family × meter) → кандидати. Шар B (scoring): grooveDNA × архетип → ✓/⚠.

import { grooveDNA } from './groove-dna';
import { resolveFit } from './fit';
import { CATALOG } from '../data/catalog';
import type { Groove, SongContext, Recommendation, BassArchetype, Finding, Candidate } from '../types';

function familyMatch(a: BassArchetype, grooveFamily: string): boolean {
  const g = (grooveFamily || '').toLowerCase();
  return a.grooveFamilies.some((fam) => g.includes(fam.toLowerCase()) || fam.toLowerCase().includes(g));
}

export function recommendBass(groove: Groove, songCtx: SongContext): Recommendation {
  const dna = grooveDNA(groove.seed, songCtx.meter);
  const meterId = `${songCtx.meter.num}-${songCtx.meter.den}`;
  // Чи відома родина груву каталогу взагалі? Якщо ні (напр. вільний live-GGL-патерн) —
  // не штрафуємо «поза родиною», а судимо суто за ДНК.
  const familyKnown = CATALOG.some((a) => familyMatch(a, groove.family));

  const candidates: Candidate[] = CATALOG
    .filter((a) => a.meters.includes(meterId))
    .map((a) => {
      const f = resolveFit(a.fit, dna);
      const match = familyMatch(a, groove.family);
      const neutral = match || !familyKnown;
      const score = neutral ? f.score : f.score * 0.6;
      const findings: Finding[] = neutral
        ? f.findings
        : [...f.findings, {
            kind: 'bass.outOfFamily', verdict: '⚠' as const,
            text: { uk: `Архетип не з рідної родини цього груву (${groove.family}).`, en: "Archetype is outside this groove's native family." },
          }];
      const verdict: '✓' | '⚠' = score >= 0.5 ? '✓' : '⚠';
      return { archetype: a, score, verdict, findings, familyMatch: match };
    })
    .sort((x, y) => y.score - x.score);

  return { classification: { family: groove.family, meter: meterId }, grooveDNA: dna, candidates };
}

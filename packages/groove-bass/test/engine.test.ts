import { describe, it, expect } from 'vitest';
import { stepsPerBar, songContext, barTicks, stepToTick, tickToStep } from '../src/transport/time';
import { parseChord } from '../src/harmony/chords';
import { grooveDNA } from '../src/analysis/groove-dna';
import { recommendBass } from '../src/analysis/recommend';
import { realizeBass } from '../src/analysis/realize';
import { tumbaoFamily } from '../src/data/archetypes';
import { CATALOG, byId } from '../src/data/catalog';
import { neighbors, affinity } from '../src/analysis/affinity';
import { validateArchetype } from '../src/data/schema';
import { renderBar } from '../src/view/ascii';
import { STYLES } from '../src/data/ggl-styles';
import type { ChordEvent } from '../src/types';

describe('shared transport', () => {
  it('stepsPerBar matches the GGL grid per meter', () => {
    expect(stepsPerBar({ num: 4, den: 4 })).toBe(16);
    expect(stepsPerBar({ num: 6, den: 8 })).toBe(12);
    expect(stepsPerBar({ num: 7, den: 8 })).toBe(14);
    expect(stepsPerBar({ num: 2, den: 4 })).toBe(8);
    expect(stepsPerBar({ num: 12, den: 8 })).toBe(24);
  });
  it('step↔tick round-trips on the shared timeline', () => {
    for (const s of [0, 6, 12, 15]) expect(tickToStep(stepToTick(s))).toBe(s);
  });
});

describe('harmony via Tonal.js', () => {
  it('parses the chord track', () => {
    expect(parseChord('Am').rootPc).toBe(9);
    expect(parseChord('E7').rootPc).toBe(4);
    expect(parseChord('E7').fifthPc).toBe(11);
    expect(parseChord('G/B').bassPc).toBe(11);
    expect(parseChord('Cmaj7').chordTones.length).toBe(4);
  });
});

describe('groove DNA + mapping engine', () => {
  it('detects four-on-floor vs clave kick', () => {
    expect(grooveDNA({ kick: [0, 4, 8, 12] }, { num: 4, den: 4 }).fourOnFloor).toBe(true);
    expect(grooveDNA({ kick: [0, 6, 8, 14] }, { num: 4, den: 4 }).fourOnFloor).toBe(false);
  });
  it('tumbao ✓ on clave groove, ⚠ on four-on-floor (same family label → reacts to seed)', () => {
    const ctx = songContext({ meter: { num: 4, den: 4 } });
    const ok = recommendBass(STYLES.afrocuban_son!, ctx).candidates.find((c) => c.archetype.id === 'tumbao')!;
    const bad = recommendBass(STYLES.afrocuban_fourfloor!, ctx).candidates.find((c) => c.archetype.id === 'tumbao')!;
    expect(ok.verdict).toBe('✓');
    expect(bad.verdict).toBe('⚠');
    expect(ok.score).toBeGreaterThan(bad.score);
  });
});

describe('realize reads the chord track', () => {
  it('tumbao beat-4 anticipates the NEXT chord root', () => {
    const meter = { num: 4, den: 4 }, ppq = 480, bt = barTicks(meter, ppq);
    const chords: ChordEvent[] = ['Am', 'Dm', 'E7', 'Am'].map((symbol, i) => ({ tick: i * bt, durTicks: bt, symbol }));
    const ctx = songContext({ meter, ppq, chords, key: { tonic: 'A', mode: 'minor' } });
    const bar0 = realizeBass(STYLES.afrocuban_son!, tumbaoFamily[0]!, ctx, 0); // Am → (next Dm)
    const bar2 = realizeBass(STYLES.afrocuban_son!, tumbaoFamily[0]!, ctx, 2); // E7 → (next Am)
    expect(bar0.notes.find((n) => n.degree === 'rootNext')!.name).toBe('D');
    expect(bar2.notes.find((n) => n.degree === 'rootNext')!.name).toBe('A');
    expect(bar0.grooveLock).toBeGreaterThanOrEqual(0);
    expect(bar0.grooveLock).toBeLessThanOrEqual(1);
    const roll = renderBar(STYLES.afrocuban_son!, bar0, ctx, 0);
    expect(roll).toContain('D2'); // анте Dm видно в ASCII піано-ролі
  });
});

describe('catalog breadth (R4)', () => {
  it('spans many families and meters', () => {
    expect(CATALOG.length).toBeGreaterThanOrEqual(30);
    const meters = new Set(CATALOG.flatMap((a) => a.meters));
    for (const m of ['4-4', '2-4', '3-4', '6-8', '7-8']) expect(meters.has(m)).toBe(true);
  });

  it('odd meter 7/8 → aksak archetypes recommended', () => {
    const ctx = songContext({ meter: { num: 7, den: 8 } });
    const rec = recommendBass(STYLES.rachenitsa!, ctx);
    expect(rec.candidates.length).toBeGreaterThan(0);
    expect(rec.candidates[0]!.archetype.id.startsWith('aksak')).toBe(true);
    expect(rec.candidates[0]!.verdict).toBe('✓');
  });

  it('four-on-floor techno → floor archetype ✓ above tumbao ⚠', () => {
    const ctx = songContext({ meter: { num: 4, den: 4 } });
    const rec = recommendBass(STYLES.techno!, ctx);
    const tumbao = rec.candidates.find((c) => c.archetype.id === 'tumbao')!;
    const top = rec.candidates[0]!;
    expect(['techno.rootpulse', 'disco.octaves', 'eurodance.drive', 'house.offbeat']).toContain(top.archetype.id);
    expect(top.verdict).toBe('✓');
    expect(tumbao.verdict).toBe('⚠');
  });
});

describe('DNA affinity (R4)', () => {
  it('cross-genre neighbours rank by DNA, not genre label', () => {
    const tumbao = byId('tumbao')!;
    const dembow = byId('dembow.reggaeton')!;
    const techno = byId('techno.rootpulse')!;
    // tumbao is DNA-closer to dembow (anticipation) than to techno (lock-floor)
    expect(affinity(tumbao, dembow)).toBeGreaterThan(affinity(tumbao, techno));
    const nb = neighbors(tumbao, CATALOG, 4);
    expect(nb.length).toBe(4);
    expect(nb[0]!.affinity).toBeGreaterThanOrEqual(nb[3]!.affinity); // sorted desc
    expect(nb[0]!.affinity).toBeLessThanOrEqual(1);
  });
});

describe('MELOS invariants', () => {
  it('EVERY archetype in the catalog validates with ≥1 citation', () => {
    for (const a of CATALOG) {
      const data = validateArchetype(a);
      expect(data.sources.length).toBeGreaterThanOrEqual(1);
    }
  });
});

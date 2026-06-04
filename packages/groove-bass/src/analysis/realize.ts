// analysis/realize.ts — архетип + грув + АКОРДОВИЙ ТРЕК + SongContext → BassPattern (render-ready).

import { stepsPerBar, beatStep, stepToTick, barTicks } from '../transport/time';
import { chordAt, chordAtNextBar, parseChord } from '../harmony/chords';
import type { ParsedChord } from '../harmony/chords';
import type { BassArchetype, BassNote, BassPattern, Degree, Groove, SongContext } from '../types';

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const pcName = (pc: number): string => NAMES[((pc % 12) + 12) % 12]!;
export const midiName = (m: number): string => NAMES[((m % 12) + 12) % 12]! + (Math.floor(m / 12) - 1);

function pcToMidi(pc: number, range: [number, number]): number {
  const [lo, hi] = range;
  const center = (lo + hi) / 2;
  let best: number | null = null;
  let bestD = Infinity;
  for (let m = ((pc % 12) + 12) % 12; m <= 127; m += 12) {
    if (m < lo) continue;
    if (m > hi) break;
    const d = Math.abs(m - center);
    if (d < bestD) { bestD = d; best = m; }
  }
  if (best === null) {
    best = ((pc % 12) + 12) % 12;
    while (best < lo) best += 12;
  }
  return best;
}

function degreeToPc(degree: Degree, chord: ParsedChord, nextChord: ParsedChord): number {
  switch (degree) {
    case 'root': return chord.rootPc;
    case 'fifth': return chord.fifthPc;
    case 'third': return chord.thirdPc;
    case 'octave': return chord.rootPc;
    case 'rootNext': return nextChord.rootPc;
    case 'approachNext': return ((nextChord.rootPc - 1) + 12) % 12;
    default: return chord.rootPc;
  }
}

export function realizeBass(groove: Groove, archetype: BassArchetype, songCtx: SongContext, barIndex = 0): BassPattern {
  const spb = stepsPerBar(songCtx.meter);
  const bStep = beatStep(songCtx.meter);
  const bt = barTicks(songCtx.meter, songCtx.ppq);
  const fallback = parseChord(songCtx.key.tonic || 'C');

  const notes: BassNote[] = archetype.events({ spb, bStep }).map((ev) => {
    const tick = barIndex * bt + stepToTick(ev.step, songCtx.ppq);
    const chord = chordAt(songCtx.chords, tick) ?? fallback;
    const nextChord = chordAtNextBar(songCtx.chords, tick, bt) ?? chord;
    const pc = degreeToPc(ev.degree, chord, nextChord);
    let midi = pcToMidi(pc, archetype.pitch.range);
    if (ev.degree === 'octave') midi = Math.min(archetype.pitch.range[1], midi + 12);
    const why =
      ev.degree === 'rootNext' ? 'anticipate-next-root' :
      ev.degree === 'approachNext' ? 'chromatic-approach' :
      ev.degree === 'fifth' ? 'fifth-of-chord' : ev.degree;
    return {
      step: ev.step, tick, midi, pc, name: pcName(pc), degree: ev.degree,
      accent: !!ev.accent, ghost: !!ev.ghost, why, chordSym: chord.symbol,
    };
  });

  const bassSteps = new Set(notes.map((n) => n.step));
  const kickSteps = new Set(groove.seed.kick ?? []);
  const inter = [...bassSteps].filter((s) => kickSteps.has(s)).length;
  const uni = new Set([...bassSteps, ...kickSteps]).size;
  const grooveLock = uni > 0 ? inter / uni : 0;

  return { archetypeId: archetype.id, meter: songCtx.meter, spb, barIndex, notes, grooveLock };
}

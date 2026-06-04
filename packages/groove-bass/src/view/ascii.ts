// view/ascii.ts — ASCII піано-рол (kick-підкладка + bass + акорд). Тимчасова вітрина до R3 (VexFlow).

import { beatStep, barTicks } from '../transport/time';
import { chordAt, chordAtNextBar } from '../harmony/chords';
import { midiName } from '../analysis/realize';
import type { BassPattern, Groove, SongContext } from '../types';

const pad = (x: string | number, w = 4): string => String(x).padStart(w, ' ');

export function renderBar(groove: Groove, pattern: BassPattern, songCtx: SongContext, barIndex = 0): string {
  const spb = pattern.spb;
  const bStep = beatStep(songCtx.meter);
  const bt = barTicks(songCtx.meter, songCtx.ppq);
  const cur = chordAt(songCtx.chords, barIndex * bt);
  const nxt = chordAtNextBar(songCtx.chords, barIndex * bt, bt);
  const curSym = cur?.symbol ?? songCtx.key.tonic;
  const nxtSym = nxt?.symbol ?? curSym;

  const kick = new Set(groove.seed.kick ?? []);
  const byStep = new Map(pattern.notes.map((n) => [n.step, n] as const));

  let head = 'step ', kr = 'kick ', br = 'bass ';
  for (let s = 0; s < spb; s++) {
    head += pad(s % bStep === 0 ? s / bStep + 1 : '·');
    kr += pad(kick.has(s) ? '#' : '·');
    const n = byStep.get(s);
    br += pad(n ? (n.accent ? midiName(n.midi) : midiName(n.midi).toLowerCase()) : '·');
  }
  return `bar ${barIndex + 1}  [${curSym} → ${nxtSym}]\n${head}\n${kr}\n${br}`;
}

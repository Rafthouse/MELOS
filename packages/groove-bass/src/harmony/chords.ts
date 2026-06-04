// harmony/chords.ts — розбір акордового треку через Tonal.js (замість саморобного парсера R0).
// Вісь B (висота) читає акорд, активний на тіку онсета.

import { Chord, Note } from 'tonal';
import type { ChordEvent } from '../types';

export interface ParsedChord {
  symbol: string;
  rootPc: number;
  thirdPc: number;
  fifthPc: number;
  bassPc: number;
  chordTones: number[];
}

const chroma = (name: string): number => {
  const c = Note.chroma(name);
  return typeof c === 'number' && !Number.isNaN(c) ? c : 0;
};

export function parseChord(symbol: string): ParsedChord {
  const c = Chord.get(symbol);
  const tonic = c.tonic && c.tonic.length > 0 ? c.tonic : 'C';
  const rootPc = chroma(tonic);

  const fifthIv = c.intervals.find((i) => i.startsWith('5')) ?? '5P';
  const thirdIv = c.intervals.find((i) => i.startsWith('3') || i.startsWith('2') || i.startsWith('4')) ?? '3M';
  const fifthPc = chroma(Note.transpose(tonic, fifthIv));
  const thirdPc = chroma(Note.transpose(tonic, thirdIv));

  const bassName: string = c.bass;
  const bassPc = bassName && bassName.length > 0 ? chroma(bassName) : rootPc;
  const chordTones = c.notes.length > 0 ? c.notes.map(chroma) : [rootPc, thirdPc, fifthPc];

  return { symbol, rootPc, thirdPc, fifthPc, bassPc, chordTones };
}

/** Акорд, активний на даному тіку (або останній перед ним). */
export function chordAt(chords: ChordEvent[], tick: number): ParsedChord | null {
  if (chords.length === 0) return null;
  let active: ChordEvent | undefined = chords.find((c) => tick >= c.tick && tick < c.tick + c.durTicks);
  if (!active) {
    const before = chords.filter((c) => c.tick <= tick).sort((a, b) => b.tick - a.tick);
    active = before[0] ?? chords[0];
  }
  return active ? parseChord(active.symbol) : null;
}

/** Акорд на початку наступного такту (для анте/anticipación). */
export function chordAtNextBar(chords: ChordEvent[], tick: number, bt: number): ParsedChord | null {
  const nextBarTick = (Math.floor(tick / bt) + 1) * bt;
  return chordAt(chords, nextBarTick);
}

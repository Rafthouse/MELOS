// types.ts — доменні типи Groove-Bass Lab.

export interface Meter { num: number; den: number; }
export interface Key { tonic: string; mode: string; }
export interface I18n { uk: string; en: string; }

/** Акорд на спільній tick-таймлінії (SongContext.chords). */
export interface ChordEvent { tick: number; durTicks: number; symbol: string; }

/** Спільний транспорт MELOS — єдине джерело істини про час+гармонію. */
export interface SongContext {
  tempo: number;
  meter: Meter;
  ppq: number;
  key: Key;
  chords: ChordEvent[];
  lengthBars: number;
}

export type Degree = 'root' | 'fifth' | 'third' | 'octave' | 'rootNext' | 'approachNext';
export type GrooveLock = 'lockKick' | 'interlock' | 'anticipate' | 'pedal' | 'counterpulse';

export interface EventCtx { spb: number; bStep: number; }
export interface BassEvent { step: number; degree: Degree; accent?: boolean; ghost?: boolean; }

/** ДНК-вектор: [Rootedness, Motion, Syncopation, Density, Range, GrooveLock, HarmonicWeight] 0–9. */
export type BassDNA = [number, number, number, number, number, number, number];

export interface Finding { kind: string; verdict: '✓' | '⚠'; text: I18n; }
export interface FitResult { score: number; verdict: '✓' | '⚠'; findings: Finding[]; }

/** Як скорити придатність архетипа до груву — ДАНІ (логіка живе в analysis/fit). */
export type FitKind = 'anticipation' | 'fourFloor' | 'pocket' | 'sparseRoot' | 'interlock' | 'walking' | 'oompah';
export type FitSpec = { kind: FitKind } | { fixed: number; note: I18n };

export interface GrooveDNA {
  spb: number; bStep: number; beats: number[]; kick: number[];
  kickAlignment: number; offbeatRatio: number; beatsCovered: number; density: number;
  syncopation: number; ghostDensity: number; fourOnFloor: boolean; grooveZone: number;
}

export interface BassArchetype {
  id: string;
  names: I18n;
  grooveFamilies: string[];
  meters: string[];
  grooveLock: GrooveLock;
  pitch: { strategy: string; range: [number, number]; };
  bassDNA: BassDNA;
  events: (ctx: EventCtx) => BassEvent[];
  fit: FitSpec;
  principles: { title: I18n; text: I18n }[];
  sources: string[];
}

export interface Groove {
  name: string;
  family: string;
  meter: string;
  seed: Record<string, number[]>;
  tempo?: [number, number];
  swing?: number;
}

export interface BassNote {
  step: number; tick: number; midi: number; pc: number; name: string;
  degree: Degree; accent: boolean; ghost: boolean; why: string; chordSym: string;
}

export interface BassPattern {
  archetypeId: string; meter: Meter; spb: number; barIndex: number;
  notes: BassNote[]; grooveLock: number;
}

export interface Candidate {
  archetype: BassArchetype; score: number; verdict: '✓' | '⚠';
  findings: Finding[]; familyMatch: boolean;
}
export interface Recommendation {
  classification: { family: string; meter: string };
  grooveDNA: GrooveDNA;
  candidates: Candidate[];
}

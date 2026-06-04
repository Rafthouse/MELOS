// analysis/fit.ts — переюзабельні fit-примітиви (grooveDNA → FitResult).
// Кожна родина обирає свій примітив: різні баси хочуть РІЗНОГО груву (анте ≠ four-on-floor ≠ простір).

import type { GrooveDNA, FitResult, Finding, FitKind, FitSpec } from '../types';

const clamp = (x: number): number => Math.max(0, Math.min(1, x));
const F = (kind: string, verdict: '✓' | '⚠', uk: string, en: string): Finding => ({ kind, verdict, text: { uk, en } });
const res = (score: number, findings: Finding[]): FitResult => {
  const s = clamp(score);
  return { score: s, verdict: s >= 0.5 ? '✓' : '⚠', findings };
};

/** Анте-родини (tumbao, latin-pop): люблять clave/офбіти, ненавидять four-on-floor. */
export function fitAnticipation(dna: GrooveDNA): FitResult {
  const f: Finding[] = [];
  let s = 0.5 + 0.4 * dna.syncopation;
  if (dna.fourOnFloor) { s -= 0.45; f.push(F('bass.noRoomToAnticipate', '⚠', 'Кік «four-on-floor» — немає простору для анте.', 'Four-on-floor leaves no room to anticipate.')); }
  else if (dna.offbeatRatio > 0) { s += 0.2; f.push(F('bass.claveRoom', '✓', 'Офбіти кіка — анте лягає природно.', 'Off-beat kicks give the anticipation room.')); }
  if (dna.beatsCovered < 1) f.push(F('bass.openBeats', '✓', 'Вільні долі — бас доповнює, не дублює.', 'Open beats: bass complements.'));
  return res(s, f);
}

/** Four-on-floor (house, techno, disco, eurodance): люблять рівний кік на кожну долю. */
export function fitFourFloor(dna: GrooveDNA): FitResult {
  const f: Finding[] = [];
  let s = 0.4;
  if (dna.fourOnFloor) { s += 0.45; f.push(F('bass.locksFloor', '✓', 'Кік на кожну долю — бас замикається на підлогу.', 'Four-on-floor: bass locks the floor.')); }
  else if (dna.beatsCovered >= 0.75) { s += 0.18; f.push(F('bass.floorish', '✓', 'Кік майже рівний — бас тримає підлогу.', 'Near four-on-floor.')); }
  else { s -= 0.2; f.push(F('bass.noFloor', '⚠', 'Немає рівної підлоги кіка.', 'No steady kick floor.')); }
  return res(s, f);
}

/** Фанк-кишеня: синкопа + офбіт-кік; не любить занадто рівний. */
export function fitPocket(dna: GrooveDNA): FitResult {
  const f: Finding[] = [];
  let s = 0.42 + 0.45 * dna.syncopation;
  if (dna.offbeatRatio > 0) { s += 0.1; f.push(F('bass.syncRoom', '✓', 'Синкопований кік — є з чим зчіплятись у кишені.', 'Syncopated kick to lock with.')); }
  if (dna.fourOnFloor) { s -= 0.2; f.push(F('bass.tooStraight', '⚠', 'Рівний four-on-floor — фанк-кишеня губиться.', 'Too straight for a funk pocket.')); }
  return res(s, f);
}

/** Sparse root (reggae/dub, sub): рідкий кік, простір, вага. */
export function fitSparseRoot(dna: GrooveDNA): FitResult {
  const f: Finding[] = [];
  let s = 0.5;
  if (dna.density <= 0.3) { s += 0.25; f.push(F('bass.space', '✓', 'Рідкий кік — бас отримує простір і вагу.', 'Sparse kick gives the bass space.')); }
  else { s -= 0.22; f.push(F('bass.tooBusy', '⚠', 'Щільний кік не лишає дабового простору.', 'Too busy for dub space.')); }
  if (dna.fourOnFloor) s -= 0.18;
  return res(s, f);
}

/** Interlock (afrobeat): дірки в кіку, помірна щільність. */
export function fitInterlock(dna: GrooveDNA): FitResult {
  const f: Finding[] = [];
  let s = 0.45 + 0.3 * dna.syncopation;
  if (dna.offbeatRatio > 0 || dna.beatsCovered < 1) { s += 0.15; f.push(F('bass.gaps', '✓', 'Є дірки в кіку — бас їх заповнює (interlock).', 'Gaps for the bass to fill.')); }
  if (dna.fourOnFloor) { s -= 0.25; f.push(F('bass.noGaps', '⚠', 'Немає дірок — interlock нема де грати.', 'No gaps for interlock.')); }
  return res(s, f);
}

/** Walking (jazz/gospel/second line): рівний рух чвертями; не любить надмір синкопи. */
export function fitWalking(dna: GrooveDNA): FitResult {
  const f: Finding[] = [F('bass.walks', '✓', 'Walking тримає рух чвертями незалежно від кіка.', 'Walking keeps quarter-note motion.')];
  let s = 0.58 - 0.2 * dna.syncopation;
  if (dna.fourOnFloor) s -= 0.1;
  return res(s, f);
}

/** Oom-pah (march/polka): корінь-квінта на сильних долях. */
export function fitOompah(dna: GrooveDNA): FitResult {
  const f: Finding[] = [];
  let s = 0.5;
  if (dna.beatsCovered >= 0.75) { s += 0.2; f.push(F('bass.onbeat', '✓', 'Бас-квінта на сильних долях (oom-pah).', 'Root–fifth on the strong beats.')); }
  return res(s, f);
}

/** Реєстр динамічних fit-примітивів (логіка скорингу живе тут, в analysis). */
export const FIT_REGISTRY: Record<FitKind, (dna: GrooveDNA) => FitResult> = {
  anticipation: fitAnticipation,
  fourFloor: fitFourFloor,
  pocket: fitPocket,
  sparseRoot: fitSparseRoot,
  interlock: fitInterlock,
  walking: fitWalking,
  oompah: fitOompah,
};

/** Розв'язати fit-специфікацію (дані) у результат. */
export function resolveFit(spec: FitSpec, dna: GrooveDNA): FitResult {
  if ('kind' in spec) return FIT_REGISTRY[spec.kind](dna);
  const score = clamp(spec.fixed);
  return { score, verdict: score >= 0.5 ? '✓' : '⚠', findings: [{ kind: 'bass.meterFit', verdict: '✓', text: spec.note }] };
}

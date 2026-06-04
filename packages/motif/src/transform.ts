import {
  pitchFromMidi,
  melodyTotalBeats,
  type Melody,
  type MelodyNote,
  type Scale,
} from "@melos/core-theory";

/**
 * Трансформації мотиву (Schoenberg «Fundamentals of Musical Composition»).
 * Усі — чисті функції Melody → Melody.
 *
 * Висоти результатів спелляться діезно (pitchFromMidi); для аналізу й аудіо
 * важлива висота (midi), не написання.
 */

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Усі MIDI-висоти ладу в широкому діапазоні, відсортовані. */
function scaleTones(scale: Scale, lo = 24, hi = 96): number[] {
  const set = new Set(scale.chromas);
  const out: number[] = [];
  for (let m = lo; m <= hi; m++) {
    if (set.has(((m % 12) + 12) % 12)) out.push(m);
  }
  return out;
}

/** Індекс найближчого тону ладу до заданої висоти. */
function nearestIndex(tones: readonly number[], midi: number): number {
  let best = 0;
  let bd = Infinity;
  for (let i = 0; i < tones.length; i++) {
    const d = Math.abs(tones[i]! - midi);
    if (d < bd) { bd = d; best = i; }
  }
  return best;
}

function mapPitches(m: Melody, fn: (midi: number, i: number) => number): Melody {
  const notes: MelodyNote[] = m.notes.map((n, i) => ({
    pitch: pitchFromMidi(fn(n.pitch.midi, i)),
    onset: n.onset,
    duration: n.duration,
  }));
  return { notes, beatsPerBar: m.beatsPerBar };
}

// ─────────────────────── Висотні трансформації ───────────────────────

/** Хроматична транспозиція на N семітонів. */
export function transposeChromatic(m: Melody, semitones: number): Melody {
  return mapPitches(m, (midi) => midi + semitones);
}

/** Діатонічна транспозиція на N ступенів ладу (тональна секвенція). */
export function transposeDiatonic(m: Melody, scale: Scale, degrees: number): Melody {
  const tones = scaleTones(scale);
  return mapPitches(m, (midi) => {
    const idx = nearestIndex(tones, midi);
    return tones[clamp(idx + degrees, 0, tones.length - 1)]!;
  });
}

/** Хроматична інверсія навколо осі (за замовчуванням — перша нота). */
export function invert(m: Melody, axisMidi?: number): Melody {
  if (m.notes.length === 0) return m;
  const axis = axisMidi ?? m.notes[0]!.pitch.midi;
  return mapPitches(m, (midi) => 2 * axis - midi);
}

/** Діатонічна інверсія навколо осі (дзеркало по ступенях ладу). */
export function invertDiatonic(m: Melody, scale: Scale, axisMidi?: number): Melody {
  if (m.notes.length === 0) return m;
  const tones = scaleTones(scale);
  const axis = axisMidi ?? m.notes[0]!.pitch.midi;
  const axisIdx = nearestIndex(tones, axis);
  return mapPitches(m, (midi) => {
    const idx = nearestIndex(tones, midi);
    return tones[clamp(2 * axisIdx - idx, 0, tones.length - 1)]!;
  });
}

/** Інтервальне розширення/звуження (множник на кожен крок). */
export function expandIntervals(m: Melody, factor: number): Melody {
  if (m.notes.length === 0) return m;
  const out: MelodyNote[] = [];
  let newMidi = m.notes[0]!.pitch.midi;
  out.push({ ...m.notes[0]! });
  for (let i = 1; i < m.notes.length; i++) {
    const delta = m.notes[i]!.pitch.midi - m.notes[i - 1]!.pitch.midi;
    newMidi += Math.round(delta * factor);
    out.push({
      pitch: pitchFromMidi(newMidi),
      onset: m.notes[i]!.onset,
      duration: m.notes[i]!.duration,
    });
  }
  return { notes: out, beatsPerBar: m.beatsPerBar };
}

// ─────────────────────── Часові трансформації ───────────────────────

/** Ракохід: реверс у часі (і висот, і ритму). */
export function retrograde(m: Melody): Melody {
  const rev = [...m.notes].reverse();
  let onset = 0;
  const notes: MelodyNote[] = rev.map((n) => {
    const nn: MelodyNote = { pitch: n.pitch, onset, duration: n.duration };
    onset += n.duration;
    return nn;
  });
  return { notes, beatsPerBar: m.beatsPerBar };
}

/** Аугментація/дімінуція: множник на всі тривалості й онсети. */
export function scaleRhythm(m: Melody, factor: number): Melody {
  const notes: MelodyNote[] = m.notes.map((n) => ({
    pitch: n.pitch,
    onset: n.onset * factor,
    duration: n.duration * factor,
  }));
  return { notes, beatsPerBar: m.beatsPerBar };
}

/** Фрагментація: виокремити суб-мотив [start, start+count), обнулити онсети. */
export function fragment(m: Melody, start: number, count: number): Melody {
  const sub = m.notes.slice(start, start + count);
  if (sub.length === 0) return { notes: [], beatsPerBar: m.beatsPerBar };
  const t0 = sub[0]!.onset;
  const notes: MelodyNote[] = sub.map((n) => ({
    pitch: n.pitch,
    onset: n.onset - t0,
    duration: n.duration,
  }));
  return { notes, beatsPerBar: m.beatsPerBar };
}

// ─────────────────────── Складені трансформації ───────────────────────

/**
 * Секвенція: мотив + його копії, зсунуті на `step` ступенів ладу, у часі поспіль.
 * @param count — скільки сегментів усього (включно з оригіналом).
 */
export function sequence(m: Melody, scale: Scale, step: number, count: number): Melody {
  const segLen = melodyTotalBeats(m);
  const notes: MelodyNote[] = [];
  for (let s = 0; s < count; s++) {
    const shifted = transposeDiatonic(m, scale, step * s);
    for (const n of shifted.notes) {
      notes.push({ pitch: n.pitch, onset: n.onset + s * segLen, duration: n.duration });
    }
  }
  return { notes, beatsPerBar: m.beatsPerBar };
}

/** Ракохідна інверсія. */
export function retrogradeInversion(m: Melody, axisMidi?: number): Melody {
  return retrograde(invert(m, axisMidi));
}

/**
 * Ліквідація (Schoenberg): поступовий «розпад» мотиву до нейтральності —
 * характеристичні інтервали стискаються до нуля до кінця мотиву.
 */
export function liquidate(m: Melody): Melody {
  if (m.notes.length < 2) return m;
  const first = m.notes[0]!.pitch.midi;
  const n = m.notes.length;
  return mapPitches(m, (midi, i) => {
    const f = 1 - i / (n - 1); // 1 → 0
    return first + Math.round((midi - first) * f);
  });
}

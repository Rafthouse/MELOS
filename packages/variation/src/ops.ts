import {
  pitchFromMidi,
  melodyFromEvents,
  type Melody,
  type MelodyEvent,
  type Scale,
} from "@melos/core-theory";

/**
 * Операції стильової варіації — чисті функції Melody → Melody.
 */

function scaleTones(scale: Scale, lo = 24, hi = 96): number[] {
  const set = new Set(scale.chromas);
  const out: number[] = [];
  for (let m = lo; m <= hi; m++) if (set.has(((m % 12) + 12) % 12)) out.push(m);
  return out;
}

/** Тон ладу строго між двома висотами (найближчий до середини). */
function toneBetween(tones: number[], a: number, b: number): number | null {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const mid = (a + b) / 2;
  let best: number | null = null;
  let bd = Infinity;
  for (const t of tones) {
    if (t <= lo || t >= hi) continue;
    const d = Math.abs(t - mid);
    if (d < bd) { bd = d; best = t; }
  }
  return best;
}

/** Бароко: заповнення стрибків (терцій) прохідними тонами ладу. */
export function ornament(m: Melody, scale: Scale): Melody {
  const tones = scaleTones(scale);
  const ev: MelodyEvent[] = [];
  const ns = m.notes;
  for (let i = 0; i < ns.length; i++) {
    const cur = ns[i]!;
    const next = ns[i + 1];
    const gap = next ? next.pitch.midi - cur.pitch.midi : 0;
    const passing = next && Math.abs(gap) >= 3 && Math.abs(gap) <= 5 && cur.duration >= 0.5
      ? toneBetween(tones, cur.pitch.midi, next.pitch.midi)
      : null;
    if (passing != null) {
      const half = cur.duration / 2;
      ev.push({ pitch: cur.pitch, onset: cur.onset, duration: half });
      ev.push({ pitch: pitchFromMidi(passing), onset: cur.onset + half, duration: half });
    } else {
      ev.push({ pitch: cur.pitch, onset: cur.onset, duration: cur.duration });
    }
  }
  return melodyFromEvents(ev, m.beatsPerBar);
}

/** Bebop: короткий хроматичний підхід (на півтон знизу) перед кожною нотою. */
export function chromaticApproach(m: Melody): Melody {
  const ev: MelodyEvent[] = [];
  for (const n of m.notes) {
    const appDur = Math.min(n.duration * 0.3, 0.25);
    if (appDur >= 0.1 && n.duration - appDur > 0.05) {
      ev.push({ pitch: pitchFromMidi(n.pitch.midi - 1), onset: n.onset, duration: appDur });
      ev.push({ pitch: n.pitch, onset: n.onset + appDur, duration: n.duration - appDur });
    } else {
      ev.push({ pitch: n.pitch, onset: n.onset, duration: n.duration });
    }
  }
  return melodyFromEvents(ev, m.beatsPerBar);
}

/** Black metal: тремоло — кожну ноту повторено `repeats` разів. */
export function tremolo(m: Melody, repeats = 4): Melody {
  const ev: MelodyEvent[] = [];
  for (const n of m.notes) {
    const d = n.duration / repeats;
    if (d < 0.06) { ev.push({ pitch: n.pitch, onset: n.onset, duration: n.duration }); continue; }
    for (let k = 0; k < repeats; k++) {
      ev.push({ pitch: n.pitch, onset: n.onset + k * d, duration: d });
    }
  }
  return melodyFromEvents(ev, m.beatsPerBar);
}

/** Dub: децимація — лишаємо кожну другу ноту, подовжуючи її до наступної. */
export function decimate(m: Melody): Melody {
  const ns = [...m.notes].sort((a, b) => a.onset - b.onset);
  const ev: MelodyEvent[] = [];
  for (let i = 0; i < ns.length; i += 2) {
    const cur = ns[i]!;
    const next = ns[i + 2];
    const end = next ? next.onset : cur.onset + cur.duration;
    ev.push({ pitch: cur.pitch, onset: cur.onset, duration: Math.max(cur.duration, end - cur.onset) });
  }
  return melodyFromEvents(ev, m.beatsPerBar);
}

/** Імпресіонізм: перефарбувати у цілотонну колекцію (за парністю першої ноти). */
export function wholeTone(m: Melody): Melody {
  if (m.notes.length === 0) return m;
  const parity = m.notes[0]!.pitch.midi % 2;
  const ev: MelodyEvent[] = m.notes.map((n) => {
    let midi = n.pitch.midi;
    if (midi % 2 !== parity) midi += 1;
    return { pitch: pitchFromMidi(midi), onset: n.onset, duration: n.duration };
  });
  return melodyFromEvents(ev, m.beatsPerBar);
}

/** Modal folk: додати дрон тоніки (низький, на всю довжину). */
export function withDrone(m: Melody, scale: Scale): Melody {
  if (m.notes.length === 0) return m;
  const total = m.notes.reduce((mx, n) => Math.max(mx, n.onset + n.duration), 0);
  const droneMidi = 36 + scale.tonicChroma; // ~C2
  const ev: MelodyEvent[] = m.notes.map((n) => ({ pitch: n.pitch, onset: n.onset, duration: n.duration }));
  ev.push({ pitch: pitchFromMidi(droneMidi), onset: 0, duration: total });
  return melodyFromEvents(ev, m.beatsPerBar);
}

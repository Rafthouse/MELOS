import * as Tone from "tone";
import { Soundfont, CacheStorage } from "smplr";
import { initAudio } from "@melos/audio";
import type { Melody } from "@melos/core-theory";

/** Персистентний кеш семплів (Cache API) — саундфонти не вантажаться щоразу з CDN. */
const storage = new CacheStorage();

/**
 * Плеєр мелодій на реальних GM-саундфонтах (smplr), спільний AudioContext із Tone.
 * Власний клок (ctx.currentTime) для playhead і метроном через Web Audio.
 * Tone-синти лишаються для Mode Explorer/Ear Training окремо.
 */

export type InstrumentName = "piano" | "rhodes" | "guitar" | "flute";

export const INSTRUMENTS: { id: InstrumentName; label: string }[] = [
  { id: "piano", label: "Піаніно" },
  { id: "rhodes", label: "Rhodes" },
  { id: "guitar", label: "Акуст. гітара" },
  { id: "flute", label: "Флейта" },
];

const GM: Record<InstrumentName, string> = {
  piano: "acoustic_grand_piano",
  rhodes: "electric_piano_1",
  guitar: "acoustic_guitar_steel",
  flute: "flute",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<InstrumentName, any>();
let rawCtx: AudioContext | null = null;
let state: { start: number; dur: number } | null = null;
let clickNodes: OscillatorNode[] = [];
let loadingName: InstrumentName | null = null;

function getCtx(): AudioContext {
  if (!rawCtx) rawCtx = Tone.getContext().rawContext as unknown as AudioContext;
  return rawCtx;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getInstrument(name: InstrumentName): Promise<any> {
  if (!cache.has(name)) {
    cache.set(name, new Soundfont(getCtx(), { instrument: GM[name], storage }));
  }
  const inst = cache.get(name);
  await inst.ready;
  return inst;
}

/** Чи завантажується саундфонт зараз (для UI-індикатора). */
export function isLoadingInstrument(): InstrumentName | null {
  return loadingName;
}

/** Попередньо завантажити інструмент (щоб перше програвання не лагало). */
export async function preloadInstrument(name: InstrumentName): Promise<void> {
  loadingName = name;
  try {
    await initAudio();
    await getInstrument(name);
  } finally {
    loadingName = null;
  }
}

interface PlayOptions {
  bpm: number;
  instrument: InstrumentName;
  metronome: boolean;
  beatsPerBar: number;
}

function scheduleClick(c: AudioContext, time: number, accent: boolean): void {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.frequency.value = accent ? 1760 : 1100;
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(accent ? 0.22 : 0.12, time + 0.001);
  g.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
  osc.connect(g).connect(c.destination);
  osc.start(time);
  osc.stop(time + 0.06);
  clickNodes.push(osc);
}

/** Програти мелодію обраним інструментом, опційно з метрономом. */
export async function playMelody(melody: Melody, opts: PlayOptions): Promise<void> {
  stopAll();
  if (melody.notes.length === 0) return;
  await initAudio();
  const c = getCtx();
  if (c.state !== "running") await c.resume();

  loadingName = opts.instrument;
  let inst;
  try {
    inst = await getInstrument(opts.instrument);
  } finally {
    loadingName = null;
  }

  const spb = 60 / opts.bpm;
  const t0 = c.currentTime + 0.18;
  let dur = 0;
  for (const n of melody.notes) {
    inst.start({
      note: n.pitch.fullName,
      time: t0 + n.onset * spb,
      duration: n.duration * spb,
      velocity: 95,
    });
    dur = Math.max(dur, n.onset * spb + n.duration * spb);
  }

  if (opts.metronome) {
    const beats = Math.ceil(dur / spb);
    for (let b = 0; b <= beats; b++) {
      scheduleClick(c, t0 + b * spb, b % opts.beatsPerBar === 0);
    }
  }

  state = { start: t0, dur };
}

/** Програти послідовність акордів (по одному на такт). */
export async function playChords(
  chords: { midis: number[] }[],
  bpm: number,
  instrument: InstrumentName,
  beatsPerBar: number = 4,
): Promise<void> {
  stopAll();
  if (chords.length === 0) return;
  await initAudio();
  const c = getCtx();
  if (c.state !== "running") await c.resume();
  const inst = await getInstrument(instrument);
  const spb = 60 / bpm;
  const barSec = spb * beatsPerBar;
  const t0 = c.currentTime + 0.18;
  chords.forEach((ch, i) => {
    for (const m of ch.midis) {
      inst.start({ note: m, time: t0 + i * barSec, duration: barSec * 0.92, velocity: 78 });
    }
  });
  state = { start: t0, dur: chords.length * barSec };
}

/** Синтезований удар перкусії (woodblock-подібний) на спільному контексті. */
function synthClick(c: AudioContext, time: number, accent: boolean): void {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(accent ? 1400 : 900, time);
  osc.frequency.exponentialRampToValueAtTime(accent ? 700 : 500, time + 0.04);
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(accent ? 0.5 : 0.3, time + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);
  osc.connect(g).connect(c.destination);
  osc.start(time);
  osc.stop(time + 0.1);
  clickNodes.push(osc);
}

/**
 * Програти ритмічний патерн (drum grid). steps: 0=пауза,1=удар,2=акцент.
 * Свінг зміщує непарні 16-ті пізніше (0..0.6 від тривалості кроку).
 */
export async function playRhythm(
  steps: number[],
  bpm: number,
  sub: number,
  beatsPerBar: number,
  swing: number = 0,
  loops: number = 2,
): Promise<void> {
  stopAll();
  if (steps.every((s) => s === 0)) return;
  await initAudio();
  const c = getCtx();
  if (c.state !== "running") await c.resume();
  const spb = 60 / bpm;
  const stepSec = spb / sub;
  const barSteps = beatsPerBar * sub;
  const t0 = c.currentTime + 0.18;
  for (let loop = 0; loop < loops; loop++) {
    for (let i = 0; i < steps.length; i++) {
      const v = steps[i]!;
      if (v === 0) continue;
      const swingOffset = i % 2 === 1 ? swing * stepSec : 0;
      const time = t0 + (loop * barSteps + i) * stepSec + swingOffset;
      synthClick(c, time, v === 2);
    }
  }
  state = { start: t0, dur: loops * barSteps * stepSec };
}

/** Поточна позиція відтворення в секундах від початку (для playhead). */
export function getPlayheadSeconds(): number {
  if (!state) return 0;
  return getCtx().currentTime - state.start;
}

export function isPlaying(): boolean {
  if (!state) return false;
  return getCtx().currentTime < state.start + state.dur + 0.15;
}

export function stopAll(): void {
  for (const inst of cache.values()) {
    try { inst.stop(); } catch { /* ignore */ }
  }
  for (const o of clickNodes) {
    try { o.stop(); } catch { /* ignore */ }
  }
  clickNodes = [];
  state = null;
}

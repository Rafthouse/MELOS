import * as Tone from "tone";

/**
 * Інструменти MELOS.
 *
 * v0.1 — синтезатори (без семплів, офлайн-дружні).
 * Кожен створюється ліниво і перевикористовується.
 * Пізніше (v0.3+) — Sampler із семплами піано/струнних.
 */

/** Тип інструменту. */
export type InstrumentId = "piano" | "soft" | "bell" | "bass";

let pianoSynth: Tone.PolySynth | null = null;
let softSynth: Tone.PolySynth | null = null;
let bellSynth: Tone.PolySynth | null = null;
let bassSynth: Tone.MonoSynth | null = null;

/**
 * Піаноподібний синт — основний для Mode Explorer і Ear Training.
 * Чистий, нейтральний тембр, що не нав'язує стиль.
 */
function getPiano(): Tone.PolySynth {
  if (!pianoSynth) {
    pianoSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle8" },
      envelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.2,
        release: 0.8,
      },
      volume: -8,
    }).toDestination();
  }
  return pianoSynth;
}

/**
 * М'який pad-синт — для тривалих акордів, гармонізацій.
 */
function getSoft(): Tone.PolySynth {
  if (!softSynth) {
    softSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.15,
        decay: 0.4,
        sustain: 0.6,
        release: 1.2,
      },
      volume: -10,
    }).toDestination();
  }
  return softSynth;
}

/**
 * Дзвін-синт — для акцентування характеристичних ступенів.
 */
function getBell(): Tone.PolySynth {
  if (!bellSynth) {
    bellSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.005,
        decay: 0.6,
        sustain: 0.0,
        release: 1.5,
      },
      volume: -6,
    }).toDestination();
  }
  return bellSynth;
}

/**
 * Бас-синт — для дрону тоніки під грою гами.
 */
function getBass(): Tone.MonoSynth {
  if (!bassSynth) {
    bassSynth = new Tone.MonoSynth({
      oscillator: { type: "sawtooth4" },
      envelope: {
        attack: 0.05,
        decay: 0.3,
        sustain: 0.7,
        release: 1.0,
      },
      filterEnvelope: {
        attack: 0.06,
        decay: 0.2,
        sustain: 0.5,
        release: 0.8,
        baseFrequency: 200,
        octaves: 2,
      },
      volume: -14,
    }).toDestination();
  }
  return bassSynth;
}

/** Отримати інструмент за ID. */
export function getInstrument(id: InstrumentId): Tone.PolySynth | Tone.MonoSynth {
  switch (id) {
    case "piano": return getPiano();
    case "soft": return getSoft();
    case "bell": return getBell();
    case "bass": return getBass();
  }
}

/** Звільнити всі інструменти (при закритті застосунку). */
export function disposeAll(): void {
  pianoSynth?.dispose(); pianoSynth = null;
  softSynth?.dispose(); softSynth = null;
  bellSynth?.dispose(); bellSynth = null;
  bassSynth?.dispose(); bassSynth = null;
}

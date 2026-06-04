export { initAudio, getEngineState, getTempo, setTempo, getTransportSeconds, panic } from "./engine";
export type { EngineState } from "./engine";

export { getInstrument, disposeAll } from "./instruments";
export type { InstrumentId } from "./instruments";

export {
  playSequence, playNote, playInterval, playChord,
  playScale, playMelody,
  stopPlayback, isPlaying,
} from "./player";
export type {
  NoteEvent, PlayOptions, ScaleDirection, MelodyNote,
} from "./player";

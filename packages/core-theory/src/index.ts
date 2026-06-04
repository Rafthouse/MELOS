export { mod12, semitoneDistance } from "./util";

export { pitch, pitchFromMidi, chroma, transposePitch, PITCH_CLASSES, PITCH_CLASSES_FLAT } from "./pitch";
export type { Pitch } from "./pitch";

export {
  interval, intervalFromSemitones,
  isStep, isLeap, isWideLeap,
} from "./interval";
export type { Interval, IntervalQuality, IntervalAffect, Direction } from "./interval";

export {
  createScale, transposeScale,
  degreeOf, belongsToScale,
  noteAtDegree, pitchAtDegree, pitchesInOctave,
  nearestScaleTone, recastInMode,
} from "./scale";
export type { Scale } from "./scale";

export {
  melodyFromNoteNames, melodyFromMidi, melodyFromEvents,
  melodyMidiSequence, melodicIntervals,
  melodyRange, melodyTotalBeats,
} from "./melody";
export type { Melody, MelodyNote, MelodyEvent } from "./melody";

import { describe, it, expect } from "vitest";
import {
  melodyFromNoteNames,
  melodyFromMidi,
  melodyFromEvents,
  melodyMidiSequence,
  melodicIntervals,
  melodyRange,
  melodyTotalBeats,
  pitch,
} from "../src/index";

describe("Melody", () => {
  it("melodyFromNoteNames будує послідовні onset-и", () => {
    const m = melodyFromNoteNames(["C4", "E4", "G4"]);
    expect(m.notes.map((n) => n.onset)).toEqual([0, 1, 2]);
    expect(m.notes.map((n) => n.duration)).toEqual([1, 1, 1]);
    expect(m.beatsPerBar).toBe(4);
  });

  it("власні тривалості зсувають onset-и", () => {
    const m = melodyFromNoteNames(["C4", "E4", "G4"], { durations: [0.5, 0.5, 1] });
    expect(m.notes.map((n) => n.onset)).toEqual([0, 0.5, 1]);
  });

  it("melodyFromMidi", () => {
    const m = melodyFromMidi([60, 64, 67]);
    expect(melodyMidiSequence(m)).toEqual([60, 64, 67]);
  });

  it("melodicIntervals — знакові різниці", () => {
    const m = melodyFromMidi([60, 64, 62, 67]);
    expect(melodicIntervals(m)).toEqual([4, -2, 5]);
  });

  it("melodyRange", () => {
    const m = melodyFromMidi([60, 72, 55]);
    expect(melodyRange(m)).toEqual({ min: 55, max: 72, semitones: 17 });
  });

  it("melodyTotalBeats", () => {
    const m = melodyFromNoteNames(["C4", "E4"], { durations: [2, 1.5] });
    expect(melodyTotalBeats(m)).toBe(3.5);
  });

  it("melodyFromEvents сортує за onset", () => {
    const m = melodyFromEvents([
      { pitch: pitch("G4"), onset: 2, duration: 1 },
      { pitch: pitch("C4"), onset: 0, duration: 0.5 },
      { pitch: pitch("E4"), onset: 1, duration: 0.5 },
    ]);
    expect(melodyMidiSequence(m)).toEqual([60, 64, 67]); // C, E, G за часом
    expect(m.notes.map((n) => n.onset)).toEqual([0, 1, 2]);
  });

  it("melodyFromEvents зберігає паузи (onset не послідовний)", () => {
    const m = melodyFromEvents([
      { pitch: pitch("C4"), onset: 0, duration: 0.5 },
      { pitch: pitch("E4"), onset: 1.5, duration: 0.5 }, // пауза між 0.5 і 1.5
    ]);
    expect(melodyTotalBeats(m)).toBe(2);
  });
});

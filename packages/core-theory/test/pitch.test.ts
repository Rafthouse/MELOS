import { describe, it, expect } from "vitest";
import { pitch, pitchFromMidi, chroma, transposePitch } from "../src/index";

describe("pitch()", () => {
  it("C4 = MIDI 60, chroma 0", () => {
    const p = pitch("C4");
    expect(p.midi).toBe(60);
    expect(p.chroma).toBe(0);
    expect(p.octave).toBe(4);
    expect(p.name).toBe("C");
    expect(p.fullName).toBe("C4");
  });

  it("розрізняє D# і Eb (enharmonic spelling)", () => {
    const ds = pitch("D#4");
    const eb = pitch("Eb4");
    expect(ds.midi).toBe(eb.midi); // однаковий MIDI
    expect(ds.name).toBe("D#");
    expect(eb.name).toBe("Eb");    // але різні імена
  });

  it("кидає на невалідний вхід", () => {
    expect(() => pitch("Z9")).toThrow();
    expect(() => pitch("")).toThrow();
  });
});

describe("pitchFromMidi()", () => {
  it("MIDI 69 = A4", () => {
    const p = pitchFromMidi(69);
    expect(p.name).toBe("A");
    expect(p.octave).toBe(4);
  });
});

describe("chroma()", () => {
  it("C=0, E=4, Bb=10", () => {
    expect(chroma("C")).toBe(0);
    expect(chroma("E")).toBe(4);
    expect(chroma("Bb")).toBe(10);
  });
});

describe("transposePitch()", () => {
  it("C4 + 7 семітонів = G4", () => {
    const p = transposePitch(pitch("C4"), 7);
    expect(p.midi).toBe(67);
  });

  it("C4 − 2 семітони = Bb3", () => {
    const p = transposePitch(pitch("C4"), -2);
    expect(p.midi).toBe(58);
  });
});

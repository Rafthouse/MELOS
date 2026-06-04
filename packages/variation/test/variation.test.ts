import { describe, it, expect } from "vitest";
import { melodyFromMidi, createScale, melodyMidiSequence } from "@melos/core-theory";
import { ornament, chromaticApproach, tremolo, decimate, wholeTone, withDrone, generateVariations } from "../src/index";

const cMajor = createScale("ionian", [0, 2, 4, 5, 7, 9, 11], "C");

describe("ops", () => {
  it("ornament заповнює терцію прохідним тоном (C→E → C D E)", () => {
    const m = melodyFromMidi([60, 64], { durations: [1, 1] });
    const o = ornament(m, cMajor);
    expect(melodyMidiSequence(o)).toEqual([60, 62, 64]); // D=62 між C і E
  });

  it("chromaticApproach додає півтон знизу перед нотою", () => {
    const m = melodyFromMidi([60], { durations: [1] });
    const seq = melodyMidiSequence(chromaticApproach(m));
    expect(seq).toEqual([59, 60]);
  });

  it("tremolo множить ноти", () => {
    const m = melodyFromMidi([60], { durations: [1] });
    expect(tremolo(m, 4).notes).toHaveLength(4);
  });

  it("decimate прибирає половину нот", () => {
    const m = melodyFromMidi([60, 62, 64, 65], { durations: [1, 1, 1, 1] });
    expect(decimate(m).notes).toHaveLength(2);
  });

  it("wholeTone приводить до однієї парності midi", () => {
    const m = melodyFromMidi([60, 65, 67], { durations: [1, 1, 1] }); // 60 even, 65 odd, 67 odd
    const seq = melodyMidiSequence(wholeTone(m));
    expect(seq.every((x) => x % 2 === 0)).toBe(true);
  });

  it("withDrone додає одну ноту-дрон", () => {
    const m = melodyFromMidi([60, 64], { durations: [1, 1] });
    const d = withDrone(m, cMajor);
    expect(d.notes).toHaveLength(3);
    // дрон = тоніка C у низькій октаві (36)
    expect(d.notes.some((n) => n.pitch.midi === 36)).toBe(true);
  });
});

describe("generateVariations", () => {
  const m = melodyFromMidi([60, 64, 67, 72], { durations: [1, 1, 1, 1] });

  it("дає 6 стилів із markers+changes", () => {
    const vs = generateVariations(m, cMajor);
    expect(vs.map((v) => v.id)).toEqual(["baroque", "bebop", "black-metal", "dub", "impressionist", "modal-folk"]);
    for (const v of vs) {
      expect(v.markers.uk).toBeTruthy();
      expect(v.changes.uk).toBeTruthy();
      expect(v.melody.notes.length).toBeGreaterThan(0);
    }
  });

  it("короткий вхід → []", () => {
    expect(generateVariations(melodyFromMidi([60]), cMajor)).toEqual([]);
  });
});

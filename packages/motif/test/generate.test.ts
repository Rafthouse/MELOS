import { describe, it, expect } from "vitest";
import { melodyFromMidi, createScale } from "@melos/core-theory";
import { generateVariants } from "../src/index";

const cMajor = createScale("ionian", [0, 2, 4, 5, 7, 9, 11], "C");
const motif = melodyFromMidi([60, 64, 62, 67], { durations: [1, 0.5, 0.5, 1] });

describe("generateVariants", () => {
  it("дає 10+ варіантів для валідного мотиву", () => {
    const vs = generateVariants(motif, cMajor);
    expect(vs.length).toBeGreaterThanOrEqual(10);
  });

  it("кожен варіант має техніку, пояснення і цитати", () => {
    for (const v of generateVariants(motif, cMajor)) {
      expect(v.technique).toBeTruthy();
      expect(v.label.uk).toBeTruthy();
      expect(v.explanation.uk).toBeTruthy();
      expect(v.citationIds.length).toBeGreaterThan(0);
      expect(v.melody.notes.length).toBeGreaterThan(0);
    }
  });

  it("включає ключові техніки ТЗ Level 2", () => {
    const techs = generateVariants(motif, cMajor).map((v) => v.technique);
    for (const t of ["sequence-up", "inversion", "retrograde", "augmentation", "fragmentation", "liquidation"]) {
      expect(techs).toContain(t);
    }
  });

  it("порожній/одно-нотний мотив → []", () => {
    expect(generateVariants(melodyFromMidi([60]), cMajor)).toEqual([]);
    expect(generateVariants(melodyFromMidi([]), cMajor)).toEqual([]);
  });
});

import { describe, it, expect } from "vitest";
import { melodyFromNoteNames, melodyFromMidi, createScale } from "@melos/core-theory";
import { detectCliches, predictabilityScore, analyzePredictability, analyzeBanality } from "../src/index";

const cMajor = createScale("ionian", [0, 2, 4, 5, 7, 9, 11], "C");

describe("detectCliches", () => {
  it("ловить низхідну 5-4-3-2-1", () => {
    const m = melodyFromNoteNames(["G4", "F4", "E4", "D4", "C4"]);
    const cliches = detectCliches(m, cMajor);
    expect(cliches.some((c) => c.params?.cliche === "descending-cadence")).toBe(true);
  });

  it("ловить тонічне арпеджіо до-мі-соль", () => {
    const m = melodyFromNoteNames(["C4", "E4", "G4"]);
    expect(detectCliches(m, cMajor).some((c) => c.params?.cliche === "tonic-arpeggio")).toBe(true);
  });

  it("ловить кінцівку мі-до", () => {
    const m = melodyFromNoteNames(["G4", "A4", "E4", "C4"]);
    expect(detectCliches(m, cMajor).some((c) => c.params?.cliche === "mi-do-ending")).toBe(true);
  });

  it("ловить надмірне повторення (5 однакових)", () => {
    const m = melodyFromMidi([60, 60, 60, 60, 60]);
    expect(detectCliches(m, cMajor).some((c) => c.params?.cliche === "excessive-repetition")).toBe(true);
  });

  it("свіжа мелодія — без кліше", () => {
    const m = melodyFromNoteNames(["C4", "G4", "A4", "F4", "D4"]);
    expect(detectCliches(m, cMajor).length).toBe(0);
  });
});

describe("predictability", () => {
  it("суцільні кроки — висока передбачуваність → suggestion", () => {
    const m = melodyFromMidi([60, 62, 64, 65, 67, 69]);
    expect(predictabilityScore(m)).toBeGreaterThan(0.17);
    expect(analyzePredictability(m)?.severity).toBe("suggestion");
  });

  it("великі стрибки — низька передбачуваність", () => {
    const m = melodyFromMidi([60, 70, 59, 71, 58]);
    expect(predictabilityScore(m)).toBeLessThan(0.06);
  });

  it("збалансована — info", () => {
    const m = melodyFromMidi([60, 64, 62, 67, 65]);
    const f = analyzePredictability(m);
    expect(f?.kind).toBe("predictability");
  });
});

describe("analyzeBanality", () => {
  it("усі Finding мають citationIds (інваріант)", () => {
    const m = melodyFromNoteNames(["G4", "F4", "E4", "D4", "C4"]);
    for (const f of analyzeBanality(m, cMajor)) {
      expect(f.citationIds.length).toBeGreaterThan(0);
    }
  });
});

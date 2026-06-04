import { describe, it, expect } from "vitest";
import { melodyFromMidi, melodyFromNoteNames, createScale } from "@melos/core-theory";
import { computeDna } from "../src/index";

const cMajor = createScale("ionian", [0, 2, 4, 5, 7, 9, 11], "C");

describe("computeDna", () => {
  it("повна структура для arch-мелодії", () => {
    const m = melodyFromMidi([60, 64, 67, 72, 67, 64, 60], { durations: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] });
    const dna = computeDna(m, cMajor);
    expect(dna.noteCount).toBe(7);
    expect(dna.contour).toBe("arch");
    expect(dna.rangeSemitones).toBe(12);
    expect(dna.intervalHistogram).toHaveLength(25); // -12..+12
    expect(dna.durationHistogram).toHaveLength(1); // одна тривалість 0.5
    expect(dna.durationHistogram[0]!.beats).toBe(0.5);
    expect(dna.durationHistogram[0]!.count).toBe(7);
    expect(dna.earworm.total).toBeGreaterThan(70);
    expect(dna.predictability).toBeGreaterThan(0);
  });

  it("кліше 5-4-3-2-1 попадає в dna.cliches", () => {
    const m = melodyFromNoteNames(["G4", "F4", "E4", "D4", "C4"]);
    const dna = computeDna(m, cMajor);
    expect(dna.cliches.some((c) => c.id === "descending-cadence")).toBe(true);
    expect(dna.stepwiseRatio).toBe(1);
  });

  it("провідний тон без розв'язання → leadingToneUnresolved=1", () => {
    const m = melodyFromNoteNames(["B4", "A4"]); // 7→6 (не 7→1)
    const dna = computeDna(m, cMajor);
    expect(dna.leadingToneUnresolved).toBe(1);
  });

  it("стрибок ч.5 без компенсації → gapFillUnresolved=1", () => {
    const m = melodyFromMidi([60, 67, 69]); // +7 +2 — не крок назад
    const dna = computeDna(m, cMajor);
    expect(dna.gapFillUnresolved).toBe(1);
  });

  it("climaxGoldenDistance близько 0 для кульмінації на 0.62", () => {
    const m = melodyFromMidi([60, 62, 64, 62, 64, 72, 65, 62]);
    const dna = computeDna(m, cMajor);
    expect(dna.climaxGoldenDistance).toBeLessThan(0.05);
  });

  it("порожня мелодія — нулі без падінь", () => {
    const m = melodyFromMidi([]);
    const dna = computeDna(m, cMajor);
    expect(dna.noteCount).toBe(0);
    expect(dna.totalBeats).toBe(0);
    expect(dna.density).toBe(0);
    expect(dna.earworm.total).toBe(0);
  });
});

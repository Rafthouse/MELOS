import { describe, it, expect } from "vitest";
import { melodyFromMidi } from "@melos/core-theory";
import { earwormScore, earwormBreakdown, analyzeEarworm } from "../src/index";

describe("earwormScore", () => {
  it("arch + помірний діапазон + повторювані ритми → високий бал", () => {
    // arch: 60 64 67 72 67 64 60 (підйом до C5 і назад), однакові тривалості
    const m = melodyFromMidi([60, 64, 67, 72, 67, 64, 60], { durations: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] });
    const b = earwormBreakdown(m);
    expect(b.archBonus).toBe(25);
    expect(b.total).toBeGreaterThanOrEqual(60);
  });

  it("плато з малим розмахом → низький бал", () => {
    const m = melodyFromMidi([60, 60, 60, 60, 60], { durations: [1, 1, 1, 1, 1] });
    expect(earwormScore(m)).toBeLessThan(60);
  });

  it("надмірно хаотична (великі стрибки, без повторів) → нижче", () => {
    const m = melodyFromMidi([60, 84, 48, 72, 36, 96], { durations: [0.25, 1, 0.125, 2, 0.5, 1] });
    expect(earwormScore(m)).toBeLessThan(60);
  });

  it("одно-нотна або порожня → 0", () => {
    expect(earwormScore(melodyFromMidi([60]))).toBe(0);
    expect(earwormScore(melodyFromMidi([]))).toBe(0);
  });
});

describe("analyzeEarworm", () => {
  it("повертає Finding info з jakubowski-2017", () => {
    const m = melodyFromMidi([60, 64, 67, 72, 67, 64, 60], { durations: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] });
    const f = analyzeEarworm(m)!;
    expect(f.kind).toBe("earworm");
    expect(f.severity).toBe("info");
    expect(f.citationIds).toContain("jakubowski-2017");
  });

  it("надто коротка → null", () => {
    expect(analyzeEarworm(melodyFromMidi([60, 62]))).toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import { melodyFromMidi } from "@melos/core-theory";
import {
  analyzeClimax,
  GOLDEN_RATIO,
  syncopationIndex,
  analyzeSyncopation,
  metricWeight,
} from "../src/index";

describe("analyzeClimax (золотий перетин)", () => {
  it("GOLDEN_RATIO = 0.618", () => {
    expect(GOLDEN_RATIO).toBeCloseTo(0.618, 3);
  });

  it("кульмінація біля 0.62 — info «гарне розміщення»", () => {
    // 8 нот, найвища на onset 5 (5/8 = 0.625)
    const m = melodyFromMidi([60, 62, 64, 62, 64, 72, 65, 62]);
    const f = analyzeClimax(m);
    expect(f?.kind).toBe("climax-position");
    expect(f?.severity).toBe("info");
  });

  it("кульмінація на початку — підказка посунути", () => {
    const m = melodyFromMidi([72, 60, 62, 64, 65, 64]);
    const f = analyzeClimax(m);
    expect(f?.severity).toBe("suggestion");
    expect(f?.params?.positionPercent).toBe(0);
  });

  it("надто коротка мелодія — null", () => {
    expect(analyzeClimax(melodyFromMidi([60, 64]))).toBeNull();
  });
});

describe("metricWeight", () => {
  it("downbeat найсильніший (0)", () => {
    expect(metricWeight(0, 4, 4)).toBe(0);
  });
  it("3-я доля сильніша за 2-у і 4-у", () => {
    expect(metricWeight(8, 4, 4)).toBe(-1); // beat 3
    expect(metricWeight(4, 4, 4)).toBe(-2); // beat 2
    expect(metricWeight(12, 4, 4)).toBe(-2); // beat 4
  });
  it("шістнадцяті найслабші", () => {
    expect(metricWeight(1, 4, 4)).toBe(-4);
  });
});

describe("syncopationIndex (Longuet-Higgins & Lee)", () => {
  it("рівні чверті по долях — індекс 0", () => {
    const m = melodyFromMidi([60, 62, 64, 65]); // durations 1,1,1,1
    expect(syncopationIndex(m)).toBe(0);
  });

  it("tresillo (3-3-2) — синкопа > 0", () => {
    const m = melodyFromMidi([60, 62, 64], { durations: [0.75, 0.75, 0.5] });
    expect(syncopationIndex(m)).toBeGreaterThan(0);
  });
});

describe("analyzeSyncopation (Vuust groove)", () => {
  it("рівний рух — підказка додати синкопу", () => {
    const m = melodyFromMidi([60, 62, 64, 65]);
    const f = analyzeSyncopation(m);
    expect(f.kind).toBe("syncopation");
    expect(f.params?.syncopationIndex).toBe(0);
    expect(f.message.uk).toContain("Goldilocks");
  });
});

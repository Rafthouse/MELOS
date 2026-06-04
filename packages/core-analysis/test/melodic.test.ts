import { describe, it, expect } from "vitest";
import { melodyFromMidi, melodyFromNoteNames, createScale } from "@melos/core-theory";
import {
  analyzeGapFill,
  analyzeStepwiseRatio,
  analyzeRange,
  analyzeLeadingTone,
} from "../src/index";

describe("analyzeGapFill (Narmour)", () => {
  it("стрибок ч.5 без компенсації — Finding", () => {
    const m = melodyFromMidi([60, 67, 60]); // +7, -7 (стрибок, не крок)
    const findings = analyzeGapFill(m);
    expect(findings.length).toBe(1);
    expect(findings[0]!.kind).toBe("gap-fill-unresolved");
    expect(findings[0]!.params?.leapSemitones).toBe(7);
  });

  it("стрибок, компенсований кроком у протилежний бік — без Finding", () => {
    const m = melodyFromMidi([60, 67, 66]); // +7, -1 (крок вниз)
    expect(analyzeGapFill(m).length).toBe(0);
  });

  it("лише кроки — без Finding", () => {
    const m = melodyFromMidi([60, 62, 64, 65]);
    expect(analyzeGapFill(m).length).toBe(0);
  });
});

describe("analyzeStepwiseRatio", () => {
  it("повністю кроковий рух — підказка про стрибок", () => {
    const m = melodyFromMidi([60, 62, 64, 65, 67, 69]);
    const f = analyzeStepwiseRatio(m);
    expect(f?.kind).toBe("stepwise-ratio");
    expect(f?.params?.stepwisePercent).toBe(100);
  });

  it("повністю стрибковий — підказка про gap-fill", () => {
    const m = melodyFromMidi([60, 64, 60, 64, 60]);
    const f = analyzeStepwiseRatio(m);
    expect(f?.params?.stepwisePercent).toBe(0);
  });

  it("збалансований — без Finding", () => {
    const m = melodyFromMidi([60, 62, 65, 64, 62]); // кроки + один стрибок
    expect(analyzeStepwiseRatio(m)).toBeNull();
  });
});

describe("analyzeRange", () => {
  it("понад дві октави — warning", () => {
    const m = melodyFromMidi([48, 84]); // 36 пт
    const f = analyzeRange(m);
    expect(f?.severity).toBe("warning");
    expect(f?.params?.rangeSemitones).toBe(36);
  });

  it("нормальний діапазон — без Finding", () => {
    const m = melodyFromMidi([60, 64, 67, 72]); // 12 пт
    expect(analyzeRange(m)).toBeNull();
  });
});

describe("analyzeLeadingTone (7→1)", () => {
  const cMajor = createScale("ionian", [0, 2, 4, 5, 7, 9, 11], "C");

  it("провідний тон без розв'язання — Finding", () => {
    const m = melodyFromNoteNames(["B4", "A4"]); // B=7 → A=6 (не тоніка)
    const findings = analyzeLeadingTone(m, cMajor);
    expect(findings.length).toBe(1);
    expect(findings[0]!.kind).toBe("leading-tone-unresolved");
  });

  it("провідний тон розв'язується в тоніку — без Finding", () => {
    const m = melodyFromNoteNames(["B4", "C5"]); // B=7 → C=1
    expect(analyzeLeadingTone(m, cMajor).length).toBe(0);
  });

  it("лад без провідного тону (Mixolydian) — аналіз пропускається", () => {
    const cMixo = createScale("mixolydian", [0, 2, 4, 5, 7, 9, 10], "C");
    const m = melodyFromNoteNames(["B4", "A4"]); // B не в C Mixolydian узагалі
    expect(analyzeLeadingTone(m, cMixo).length).toBe(0);
  });
});

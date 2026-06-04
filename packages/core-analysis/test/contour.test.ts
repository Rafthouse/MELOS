import { describe, it, expect } from "vitest";
import { melodyFromMidi } from "@melos/core-theory";
import { classifyContour, analyzeContour } from "../src/index";

describe("classifyContour", () => {
  it("висхідний", () => {
    expect(classifyContour([60, 62, 64, 65, 67])).toBe("ascending");
  });
  it("спадний", () => {
    expect(classifyContour([67, 65, 64, 62, 60])).toBe("descending");
  });
  it("арка (підйом-спуск)", () => {
    expect(classifyContour([60, 64, 67, 64, 60])).toBe("arch");
  });
  it("обернена арка", () => {
    expect(classifyContour([67, 63, 60, 63, 67])).toBe("inverted-arch");
  });
  it("плато (малий розмах)", () => {
    expect(classifyContour([60, 61, 60, 61, 60])).toBe("plateau");
  });
  it("хвилястий (багато змін напрямку)", () => {
    expect(classifyContour([60, 67, 61, 66, 62, 65])).toBe("undulating");
  });
});

describe("analyzeContour", () => {
  it("повертає Finding info з контуром у params", () => {
    const m = melodyFromMidi([60, 64, 67, 64, 60]);
    const f = analyzeContour(m);
    expect(f.kind).toBe("contour");
    expect(f.severity).toBe("info");
    expect(f.params?.contour).toBe("arch");
    expect(f.citationIds.length).toBeGreaterThan(0);
  });

  it("для арки згадує earworm-універсальність", () => {
    const m = melodyFromMidi([60, 64, 67, 64, 60]);
    expect(analyzeContour(m).message.uk).toContain("earworm");
  });
});

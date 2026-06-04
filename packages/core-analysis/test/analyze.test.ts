import { describe, it, expect } from "vitest";
import { melodyFromNoteNames, createScale } from "@melos/core-theory";
import { analyzeMelody, makeFinding } from "../src/index";

describe("analyzeMelody (агрегатор)", () => {
  const melody = melodyFromNoteNames(["C4", "E4", "G4", "C5", "B4", "G4", "E4", "C4"]);

  it("повертає кілька Finding", () => {
    const findings = analyzeMelody(melody);
    expect(findings.length).toBeGreaterThan(0);
  });

  it("ІНВАРІАНТ: кожен Finding має непорожні citationIds (ТЗ §7)", () => {
    const findings = analyzeMelody(melody, {
      scale: createScale("ionian", [0, 2, 4, 5, 7, 9, 11], "C"),
    });
    for (const f of findings) {
      expect(f.citationIds.length).toBeGreaterThan(0);
    }
  });

  it("відсортовано за серйозністю (warning → suggestion → info)", () => {
    const wide = melodyFromNoteNames(["C2", "C6", "C4", "E4", "G4"]); // дасть range warning
    const findings = analyzeMelody(wide);
    const order: Record<string, number> = { warning: 0, suggestion: 1, info: 2 };
    for (let i = 1; i < findings.length; i++) {
      expect(order[findings[i]!.severity]!).toBeGreaterThanOrEqual(
        order[findings[i - 1]!.severity]!,
      );
    }
  });

  it("аналіз провідного тону вмикається лише з scale", () => {
    const withoutScale = analyzeMelody(melody);
    const withScale = analyzeMelody(melody, {
      scale: createScale("ionian", [0, 2, 4, 5, 7, 9, 11], "C"),
    });
    const hasLT = (fs: ReturnType<typeof analyzeMelody>) =>
      fs.some((f) => f.kind === "leading-tone-unresolved");
    // мелодія має B4→G4 (7→5), тож із scale має бути leading-tone Finding
    expect(hasLT(withScale)).toBe(true);
    expect(hasLT(withoutScale)).toBe(false);
  });
});

describe("makeFinding — інваріант цитат", () => {
  it("кидає, якщо citationIds порожній", () => {
    expect(() =>
      makeFinding({
        kind: "contour",
        severity: "info",
        message: { uk: "x", en: "x" },
        citationIds: [],
      }),
    ).toThrow();
  });

  it("проходить із цитатою", () => {
    expect(() =>
      makeFinding({
        kind: "contour",
        severity: "info",
        message: { uk: "x", en: "x" },
        citationIds: ["savage-2015"],
      }),
    ).not.toThrow();
  });
});

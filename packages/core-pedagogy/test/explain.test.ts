import { describe, it, expect } from "vitest";
import { melodyFromNoteNames, melodyFromMidi, createScale } from "@melos/core-theory";
import { analyzeMelody, makeFinding } from "@melos/core-analysis";
import { explainFinding, explainAll, collectUnresolved } from "../src/index";

/**
 * Батарея мелодій, що покриває УСІ аналізатори core-analysis,
 * тож зібрані citationIds охоплюють усі джерела, які видає аналіз.
 */
const cMajor = createScale("ionian", [0, 2, 4, 5, 7, 9, 11], "C");

const battery = [
  // contour, stepwise, climax, syncopation, leading-tone (7→6)
  analyzeMelody(melodyFromNoteNames(["C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"]), {
    scale: cMajor,
  }),
  // gap-fill: стрибок +12 не компенсовано
  analyzeMelody(melodyFromMidi([60, 72, 74])),
  // range: понад дві октави
  analyzeMelody(melodyFromMidi([48, 84, 60, 64])),
  // arch contour
  analyzeMelody(melodyFromMidi([60, 64, 67, 64, 60])),
].flat();

describe("резолв цитат", () => {
  it("explainFinding резолвить відомі джерела", () => {
    const f = analyzeMelody(melodyFromMidi([60, 64, 67, 64, 60]))[0]!;
    const ex = explainFinding(f);
    expect(ex.citations.length).toBeGreaterThan(0);
    expect(ex.unresolved).toHaveLength(0);
    expect(ex.citations[0]!.authors.length).toBeGreaterThan(0);
  });

  it("explainAll зберігає всі findings", () => {
    const findings = analyzeMelody(
      melodyFromNoteNames(["C4", "E4", "G4", "C5", "G4"]),
    );
    expect(explainAll(findings)).toHaveLength(findings.length);
  });

  it("ІНВАРІАНТ: жоден citationId з аналізу НЕ висить (усі є в M10)", () => {
    const unresolved = collectUnresolved(battery);
    expect(unresolved).toEqual([]);
  });

  it("вигадана цитата потрапляє в unresolved", () => {
    const bogus = makeFinding({
      kind: "contour",
      severity: "info",
      message: { uk: "x", en: "x" },
      citationIds: ["neіснуюче-джерело-9999"],
    });
    const ex = explainFinding(bogus);
    expect(ex.unresolved).toEqual(["neіснуюче-джерело-9999"]);
    expect(ex.citations).toHaveLength(0);
  });
});

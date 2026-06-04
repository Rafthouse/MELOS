import { describe, it, expect } from "vitest";
import {
  MODES, getMode, modesByFamily, cardinality,
  BIBLIOGRAPHY, getCitation, formatCitation, toBibTeX,
  RHYTHMIC_CELLS, getRhythmicCell,
} from "../src/index";

describe("корпус ладів", () => {
  it("завантажується і валідується (parse-on-load не кинув)", () => {
    expect(MODES.length).toBeGreaterThanOrEqual(27);
  });

  it("нові сімейства Level 6 присутні", () => {
    const families = new Set(MODES.map((m) => m.family));
    for (const f of ["symmetric", "balkan", "japanese", "bebop", "synthetic"]) {
      expect(families.has(f as never)).toBe(true);
    }
  });

  it("8-нотні лади валідні (octatonic, bebop)", () => {
    const oct = MODES.find((m) => m.id === "octatonic-hw")!;
    expect(oct.formula).toHaveLength(8);
    const bebop = MODES.find((m) => m.id === "bebop-dominant")!;
    expect(bebop.formula).toHaveLength(8);
  });

  it("усі id унікальні", () => {
    const ids = MODES.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("кожна formula починається з 0 і строго зростає в межах октави", () => {
    for (const m of MODES) {
      expect(m.formula[0]).toBe(0);
      for (let i = 1; i < m.formula.length; i++) {
        expect(m.formula[i]).toBeGreaterThan(m.formula[i - 1]!);
        expect(m.formula[i]).toBeLessThan(12);
      }
    }
  });

  it("характеристичні ступені — у межах кардинальності", () => {
    for (const m of MODES) {
      for (const cd of m.characteristicDegrees) {
        expect(cd.degree).toBeLessThanOrEqual(cardinality(m));
        expect(cd.degree).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

describe("конкретні лади (теоретична правильність)", () => {
  it("Dorian = [0,2,3,5,7,9,10], характеристичний ♮6", () => {
    const d = getMode("dorian")!;
    expect(d.formula).toEqual([0, 2, 3, 5, 7, 9, 10]);
    expect(d.characteristicDegrees.map((c) => c.degree)).toContain(6);
  });

  it("Гуцульський/Phrygian dominant = [0,1,4,5,7,8,10]", () => {
    const h = getMode("phrygian-dominant")!;
    expect(h.formula).toEqual([0, 1, 4, 5, 7, 8, 10]);
    expect(h.family).toBe("ukrainian");
  });

  it("Український дорійський = Dorian #4 = [0,2,3,6,7,9,10]", () => {
    const u = getMode("ukrainian-dorian")!;
    expect(u.formula).toEqual([0, 2, 3, 6, 7, 9, 10]);
  });

  it("Whole-tone — 6 ступенів, без каденцій", () => {
    const w = getMode("whole-tone")!;
    expect(cardinality(w)).toBe(6);
    expect(w.typicalCadences.every((c) => c.kind === "none")).toBe(true);
  });
});

describe("лукапи", () => {
  it("modesByFamily('church') повертає 7 церковних ладів", () => {
    expect(modesByFamily("church")).toHaveLength(7);
  });

  it("getMode неіснуючого — undefined", () => {
    expect(getMode("klingon")).toBeUndefined();
  });
});

describe("бібліографія (M10)", () => {
  it("завантажується і валідується", () => {
    expect(BIBLIOGRAPHY.length).toBeGreaterThanOrEqual(15);
  });

  it("getCitation резолвить відоме джерело", () => {
    const huron = getCitation("huron-2006")!;
    expect(huron.authors).toContain("David Huron");
    expect(huron.year).toBe(2006);
  });

  it("має українські джерела", () => {
    expect(BIBLIOGRAPHY.some((e) => e.ukrainianSource)).toBe(true);
  });

  it("formatCitation дає короткий рядок", () => {
    const s = formatCitation(getCitation("savage-2015")!);
    expect(s).toContain("2015");
    expect(s).toContain("Savage");
  });

  it("toBibTeX дає валідний запис", () => {
    const bib = toBibTeX(getCitation("huron-2006")!);
    expect(bib).toContain("@book{huron-2006,");
    expect(bib).toContain("author = {David Huron}");
  });
});

describe("ритмічні cells (M5)", () => {
  it("завантажуються; довжина steps = beatsPerBar*sub", () => {
    expect(RHYTHMIC_CELLS.length).toBeGreaterThanOrEqual(8);
    for (const c of RHYTHMIC_CELLS) {
      expect(c.steps.length).toBe(c.beatsPerBar * c.sub);
    }
  });

  it("son-clave має 5 акцентів (значення 2)", () => {
    const clave = getRhythmicCell("son-clave")!;
    expect(clave.steps.filter((s) => s === 2)).toHaveLength(5);
  });

  it("four-on-floor — удари на кожну долю", () => {
    const f = getRhythmicCell("four-on-floor")!;
    expect([0, 4, 8, 12].every((i) => f.steps[i]! > 0)).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import { melodyFromNoteNames, createScale } from "@melos/core-theory";
import { getCitation } from "@melos/data";
import { diatonicTriads, harmonize } from "../src/index";

const cMajor = createScale("ionian", [0, 2, 4, 5, 7, 9, 11], "C");

describe("diatonicTriads", () => {
  it("C-dur: 7 тризвуч, I мажорне, ii мінорне, vii° зменшене", () => {
    const t = diatonicTriads(cMajor);
    expect(t).toHaveLength(7);
    expect(t[0]!.roman).toBe("I");
    expect(t[1]!.roman).toBe("ii");
    expect(t[4]!.roman).toBe("V");
    expect(t[6]!.roman).toBe("vii°");
  });

  it("I = C-E-G (pcs 0,4,7)", () => {
    const I = diatonicTriads(cMajor)[0]!;
    expect(I.pcs).toEqual([0, 4, 7]);
    expect(I.function).toBe("T");
  });

  it("V = G-B-D, функція D", () => {
    const V = diatonicTriads(cMajor)[4]!;
    expect(V.pcs).toEqual([7, 11, 2]);
    expect(V.function).toBe("D");
  });
});

describe("harmonize", () => {
  const melody = melodyFromNoteNames(["C4", "E4", "G4", "C5", "B4", "G4", "E4", "C4"], {
    durations: [1, 1, 1, 1, 1, 1, 1, 1],
  });

  it("дає 4 стилі", () => {
    const hs = harmonize(melody, cMajor, 4);
    expect(hs.map((h) => h.id)).toEqual(["functional", "pop-axis", "modal", "jazz"]);
  });

  it("функційна завершується тонікою (I)", () => {
    const f = harmonize(melody, cMajor, 4).find((h) => h.id === "functional")!;
    expect(f.chords[f.chords.length - 1]!.degree).toBe(1);
  });

  it("pop-вісь дає I–V–vi–IV (циклічно за тактами)", () => {
    const pop = harmonize(melody, cMajor, 4).find((h) => h.id === "pop-axis")!;
    const axis = [1, 5, 6, 4];
    expect(pop.chords.map((c) => c.degree)).toEqual(
      pop.chords.map((_, i) => axis[i % 4]),
    );
  });

  it("модальна не містить домінанти (V)", () => {
    const m = harmonize(melody, cMajor, 4).find((h) => h.id === "modal")!;
    expect(m.chords.every((c) => c.degree !== 5)).toBe(true);
  });

  it("джаз додає септими (roman із 7)", () => {
    const j = harmonize(melody, cMajor, 4).find((h) => h.id === "jazz")!;
    expect(j.chords.every((c) => c.roman.includes("7"))).toBe(true);
  });

  it("ІНВАРІАНТ: усі citationIds резолвляться в бібліографії", () => {
    for (const h of harmonize(melody, cMajor, 4)) {
      for (const id of h.citationIds) {
        expect(getCitation(id), `висить цитата ${id}`).toBeDefined();
      }
    }
  });

  it("порожня мелодія → []", () => {
    expect(harmonize(melodyFromNoteNames([]), cMajor)).toEqual([]);
  });
});

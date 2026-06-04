import { describe, it, expect } from "vitest";
import {
  melodyFromMidi,
  melodyMidiSequence,
  melodyTotalBeats,
  createScale,
} from "@melos/core-theory";
import {
  transposeChromatic,
  invert,
  retrograde,
  scaleRhythm,
  fragment,
  expandIntervals,
  transposeDiatonic,
  invertDiatonic,
  sequence,
  retrogradeInversion,
} from "../src/index";

const cMajor = createScale("ionian", [0, 2, 4, 5, 7, 9, 11], "C");
// мотив C4 E4 D4 G4
const motif = melodyFromMidi([60, 64, 62, 67], { durations: [1, 0.5, 0.5, 1] });

describe("висотні трансформації", () => {
  it("transposeChromatic +2", () => {
    const t = transposeChromatic(motif, 2);
    expect(melodyMidiSequence(t)).toEqual([62, 66, 64, 69]);
  });

  it("invert — дзеркало навколо першої ноти", () => {
    // вісь 60: 60→60, 64→56, 62→58, 67→53
    const t = invert(motif);
    expect(melodyMidiSequence(t)).toEqual([60, 56, 58, 53]);
  });

  it("transposeDiatonic +1 ступінь у C-dur", () => {
    // C→D, E→F, D→E, G→A
    const t = transposeDiatonic(motif, cMajor, 1);
    expect(melodyMidiSequence(t)).toEqual([62, 65, 64, 69]);
  });

  it("invertDiatonic дзеркалить по ступенях ладу", () => {
    const t = invertDiatonic(motif, cMajor);
    // вісь C(60): C→C, E(вгору 2 ст.)→A(вниз 2 ст.)=57, D(1)→B(вниз1)=59, G(4)→F(вниз4)=53
    expect(melodyMidiSequence(t)).toEqual([60, 57, 59, 53]);
  });

  it("expandIntervals ×2 подвоює кроки", () => {
    // C60; +4→ +8 =68; -2→ -4 =64; +5→ +10 =74
    const t = expandIntervals(motif, 2);
    expect(melodyMidiSequence(t)).toEqual([60, 68, 64, 74]);
  });
});

describe("часові трансформації", () => {
  it("retrograde реверсує висоти і ритм", () => {
    const t = retrograde(motif);
    expect(melodyMidiSequence(t)).toEqual([67, 62, 64, 60]);
    // ритм реверсовано: 1, 0.5, 0.5, 1 → онсети 0,1,1.5,2
    expect(t.notes.map((n) => n.duration)).toEqual([1, 0.5, 0.5, 1]);
    expect(t.notes.map((n) => n.onset)).toEqual([0, 1, 1.5, 2]);
  });

  it("scaleRhythm ×2 (аугментація) подвоює час", () => {
    const t = scaleRhythm(motif, 2);
    expect(melodyTotalBeats(t)).toBe(melodyTotalBeats(motif) * 2);
    expect(t.notes[0]!.duration).toBe(2);
  });

  it("fragment виокремлює суб-мотив і обнуляє онсет", () => {
    const t = fragment(motif, 1, 2); // E4 D4
    expect(melodyMidiSequence(t)).toEqual([64, 62]);
    expect(t.notes[0]!.onset).toBe(0);
  });
});

describe("складені трансформації", () => {
  it("sequence будує 3 сегменти поспіль у часі", () => {
    const t = sequence(motif, cMajor, 1, 3);
    expect(t.notes.length).toBe(motif.notes.length * 3);
    const total = melodyTotalBeats(motif);
    // 2-й сегмент починається після 1-го
    expect(t.notes[motif.notes.length]!.onset).toBe(total);
  });

  it("retrogradeInversion = retrograde(invert)", () => {
    const t = retrogradeInversion(motif);
    // invert: [60,56,58,53] → retrograde: [53,58,56,60]
    expect(melodyMidiSequence(t)).toEqual([53, 58, 56, 60]);
  });
});

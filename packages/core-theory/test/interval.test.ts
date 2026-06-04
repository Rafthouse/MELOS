import { describe, it, expect } from "vitest";
import {
  pitch, interval, intervalFromSemitones,
  isStep, isLeap, isWideLeap,
} from "../src/index";

describe("interval()", () => {
  it("C4→E4 = M3, 4 семітони, ascending", () => {
    const iv = interval(pitch("C4"), pitch("E4"));
    expect(iv.semitones).toBe(4);
    expect(iv.quality).toBe("M");
    expect(iv.number).toBe(3);
    expect(iv.name).toBe("M3");
    expect(iv.direction).toBe("ascending");
  });

  it("E4→C4 = M3, descending", () => {
    const iv = interval(pitch("E4"), pitch("C4"));
    expect(iv.semitones).toBe(4);
    expect(iv.direction).toBe("descending");
  });

  it("C4→C4 = P1, unison", () => {
    const iv = interval(pitch("C4"), pitch("C4"));
    expect(iv.semitones).toBe(0);
    expect(iv.name).toBe("P1");
  });

  it("C4→C5 = P8, octave", () => {
    const iv = interval(pitch("C4"), pitch("C5"));
    expect(iv.semitones).toBe(12);
    expect(iv.name).toBe("P8");
  });

  it("C4→F#4 = A4 (tritone), 6 семітонів", () => {
    const iv = interval(pitch("C4"), pitch("F#4"));
    expect(iv.semitones).toBe(6);
    expect(iv.name).toBe("A4");
  });
});

describe("affect tags (Level 1)", () => {
  it("m2 — напруга, провідний тон", () => {
    const iv = intervalFromSemitones(1);
    expect(iv.affect.uk).toContain("напруга");
    expect(iv.affect.en).toContain("tension");
  });

  it("P5 — порожнеча, «дзвін»", () => {
    const iv = intervalFromSemitones(7);
    expect(iv.affect.uk).toContain("порожнеча");
  });

  it("P4 — фанфарність", () => {
    const iv = intervalFromSemitones(5);
    expect(iv.affect.uk).toContain("фанфарність");
  });

  it("m6 — туга, ностальгія", () => {
    const iv = intervalFromSemitones(8);
    expect(iv.affect.uk).toContain("туга");
  });
});

describe("step/leap classification", () => {
  it("m2 — step", () => {
    expect(isStep(intervalFromSemitones(1))).toBe(true);
    expect(isLeap(intervalFromSemitones(1))).toBe(false);
  });

  it("M3 — leap, але не wide", () => {
    expect(isLeap(intervalFromSemitones(4))).toBe(true);
    expect(isWideLeap(intervalFromSemitones(4))).toBe(false);
  });

  it("P5 — leap, але не wide (= 5 semi, поріг > 5)", () => {
    expect(isLeap(intervalFromSemitones(7))).toBe(true);
    expect(isWideLeap(intervalFromSemitones(7))).toBe(true);
  });

  it("m6 — wide leap (gap-fill threshold)", () => {
    expect(isWideLeap(intervalFromSemitones(8))).toBe(true);
  });
});

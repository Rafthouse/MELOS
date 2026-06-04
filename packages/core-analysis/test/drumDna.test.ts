import { describe, it, expect } from "vitest";
import { patternToDrumDna, type DrumPattern } from "../src/index";

const fourOnFloor: DrumPattern = {
  bars: 1, stepsPerBar: 16, beatsPerBar: 4, tempo: 120,
  events: [
    { track: "kick", step: 0, velocity: 1, layer: "core", accent: true },
    { track: "kick", step: 4, velocity: 0.9, layer: "core" },
    { track: "kick", step: 8, velocity: 0.9, layer: "core" },
    { track: "kick", step: 12, velocity: 0.9, layer: "core" },
  ],
};

const tresillo: DrumPattern = {
  bars: 1, stepsPerBar: 16, beatsPerBar: 4, tempo: 120,
  events: [
    { track: "perc", step: 0, velocity: 1, layer: "accent" },
    { track: "perc", step: 6, velocity: 1, layer: "accent" },
    { track: "perc", step: 12, velocity: 1, layer: "accent" },
  ],
};

describe("patternToDrumDna", () => {
  it("four-on-floor: 0 синкопованість (усі удари на сильних долях)", () => {
    const dna = patternToDrumDna(fourOnFloor);
    expect(dna.totalEvents).toBe(4);
    expect(dna.activeTracks).toBe(1);
    expect(dna.syncopationIndex).toBe(0);
    expect(dna.density).toBeCloseTo(4 / 16, 2);
  });

  it("tresillo: ненульова синкопованість (удари на офбіт-позиціях)", () => {
    const dna = patternToDrumDna(tresillo);
    expect(dna.syncopationIndex).toBeGreaterThan(0);
  });

  it("roleMix підраховує шари", () => {
    const dna = patternToDrumDna(fourOnFloor);
    expect(dna.roleMix.core).toBe(4);
  });

  it("tracks відсортовано за кількістю спадно", () => {
    const p: DrumPattern = {
      bars: 1, stepsPerBar: 16, beatsPerBar: 4, tempo: 120,
      events: [
        { track: "hat", step: 0, velocity: 1 },
        { track: "hat", step: 2, velocity: 1 },
        { track: "hat", step: 4, velocity: 1 },
        { track: "kick", step: 0, velocity: 1 },
      ],
    };
    const dna = patternToDrumDna(p);
    expect(dna.tracks[0]!.track).toBe("hat");
    expect(dna.tracks[0]!.count).toBe(3);
    expect(dna.tracks[1]!.track).toBe("kick");
  });

  it("ghost/accent ratios", () => {
    const p: DrumPattern = {
      bars: 1, stepsPerBar: 16, beatsPerBar: 4, tempo: 120,
      events: [
        { track: "snare", step: 0, velocity: 1, accent: true },
        { track: "snare", step: 4, velocity: 1 },
        { track: "snare", step: 8, velocity: 0.5, ghost: true },
        { track: "snare", step: 12, velocity: 0.5, ghost: true },
      ],
    };
    const dna = patternToDrumDna(p);
    expect(dna.accentRatio).toBeCloseTo(0.25);
    expect(dna.ghostRatio).toBeCloseTo(0.5);
  });

  it("пустий pattern → нулі", () => {
    const dna = patternToDrumDna({ bars: 1, stepsPerBar: 16, beatsPerBar: 4, tempo: 120, events: [] });
    expect(dna.totalEvents).toBe(0);
    expect(dna.activeTracks).toBe(0);
    expect(dna.density).toBe(0);
  });
});

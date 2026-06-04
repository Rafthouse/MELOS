import { describe, it, expect } from "vitest";
import {
  createScale, transposeScale,
  degreeOf, belongsToScale,
  noteAtDegree, pitchesInOctave,
  nearestScaleTone, recastInMode,
} from "../src/index";

// Формули з @melos/data (копіюємо, щоб core-theory не залежав від data)
const DORIAN = [0, 2, 3, 5, 7, 9, 10];
const IONIAN = [0, 2, 4, 5, 7, 9, 11];
const MIXOLYDIAN = [0, 2, 4, 5, 7, 9, 10];
const PHRYGIAN_DOM = [0, 1, 4, 5, 7, 8, 10];
const MINOR_PENT = [0, 3, 5, 7, 10];
const WHOLE_TONE = [0, 2, 4, 6, 8, 10];

describe("createScale()", () => {
  it("D Dorian — правильні ноти", () => {
    const s = createScale("dorian", DORIAN, "D");
    expect(s.noteNames).toEqual(["D", "E", "F", "G", "A", "B", "C"]);
    expect(s.cardinality).toBe(7);
  });

  it("Eb Ionian — бемольний spelling", () => {
    const s = createScale("ionian", IONIAN, "Eb");
    expect(s.noteNames).toEqual(["Eb", "F", "G", "Ab", "Bb", "C", "D"]);
  });

  it("A minor pentatonic — 5 ступенів", () => {
    const s = createScale("minor-pent", MINOR_PENT, "A");
    expect(s.noteNames).toEqual(["A", "C", "D", "E", "G"]);
    expect(s.cardinality).toBe(5);
  });

  it("C whole-tone — 6 ступенів", () => {
    const s = createScale("whole-tone", WHOLE_TONE, "C");
    expect(s.noteNames).toEqual(["C", "D", "E", "F#", "G#", "A#"]);
    expect(s.cardinality).toBe(6);
  });

  it("D Phrygian dominant = D Eb F# G A Bb C (а не D# A#)", () => {
    // Це був головний дефект v0.1: тепер правильне написання.
    const s = createScale("phrygian-dominant", PHRYGIAN_DOM, "D");
    expect(s.noteNames).toEqual(["D", "Eb", "F#", "G", "A", "Bb", "C"]);
  });

  it("D Ukrainian Dorian = D E F G# A B C (підвищена #4)", () => {
    const UKR_DORIAN = [0, 2, 3, 6, 7, 9, 10];
    const s = createScale("ukrainian-dorian", UKR_DORIAN, "D");
    expect(s.noteNames).toEqual(["D", "E", "F", "G#", "A", "B", "C"]);
  });

  it("F# harmonic minor — коректне написання без потрійних знаків", () => {
    const HARM_MINOR = [0, 2, 3, 5, 7, 8, 11];
    const s = createScale("harmonic-minor", HARM_MINOR, "F#");
    // F# G# A B C# D E# (E# — провідний тон гарм. мінору)
    expect(s.noteNames).toEqual(["F#", "G#", "A", "B", "C#", "D", "E#"]);
  });
});

describe("spelling нових ладів Level 6 (гептатонічний алгоритм)", () => {
  it("Altered (C) = C Db Eb Fb Gb Ab Bb (включно з Fb!)", () => {
    const s = createScale("altered", [0, 1, 3, 4, 6, 8, 10], "C");
    expect(s.noteNames).toEqual(["C", "Db", "Eb", "Fb", "Gb", "Ab", "Bb"]);
  });

  it("Double harmonic (C) = C Db E F G Ab B (дві збільшені секунди)", () => {
    const s = createScale("double-harmonic", [0, 1, 4, 5, 7, 8, 11], "C");
    expect(s.noteNames).toEqual(["C", "Db", "E", "F", "G", "Ab", "B"]);
  });

  it("Lydian augmented (C) = C D E F# G# A B", () => {
    const s = createScale("lydian-augmented", [0, 2, 4, 6, 8, 9, 11], "C");
    expect(s.noteNames).toEqual(["C", "D", "E", "F#", "G#", "A", "B"]);
  });

  it("Locrian ♮2 (C) = C D Eb F Gb Ab Bb", () => {
    const s = createScale("locrian-natural-2", [0, 2, 3, 5, 6, 8, 10], "C");
    expect(s.noteNames).toEqual(["C", "D", "Eb", "F", "Gb", "Ab", "Bb"]);
  });

  it("8-нотні (octatonic, bebop) не падають і дають 8 імен", () => {
    const oct = createScale("octatonic-hw", [0, 1, 3, 4, 6, 7, 9, 10], "C");
    expect(oct.noteNames).toHaveLength(8);
    const bebop = createScale("bebop-dominant", [0, 2, 4, 5, 7, 9, 10, 11], "C");
    expect(bebop.noteNames).toHaveLength(8);
  });

  it("Hirajoshi (D) — 5 нот", () => {
    const s = createScale("hirajoshi", [0, 2, 3, 7, 8], "D");
    expect(s.noteNames).toHaveLength(5);
  });
});

describe("degreeOf() і belongsToScale()", () => {
  const dDorian = createScale("dorian", DORIAN, "D");

  it("D = 1-й ступінь", () => {
    expect(degreeOf(dDorian, "D")).toBe(1);
  });

  it("B = 6-й ступінь (характеристичний ♮6 дорійського)", () => {
    expect(degreeOf(dDorian, "B")).toBe(6);
  });

  it("C# не належить до D Dorian", () => {
    expect(degreeOf(dDorian, "C#")).toBeUndefined();
    expect(belongsToScale(dDorian, "C#")).toBe(false);
  });

  it("C належить (♭7)", () => {
    expect(belongsToScale(dDorian, "C")).toBe(true);
  });
});

describe("noteAtDegree()", () => {
  const aPhryDom = createScale("phrygian-dominant", PHRYGIAN_DOM, "A");

  it("1-й ступінь = A", () => {
    expect(noteAtDegree(aPhryDom, 1)).toBe("A");
  });

  it("2-й ступінь = Bb (♭2), правильне гептатонічне написання", () => {
    // A Phrygian dominant = A Bb C# D E F G (кожна літера один раз)
    expect(noteAtDegree(aPhryDom, 2)).toBe("Bb");
  });

  it("повне написання A Phrygian dominant = A Bb C# D E F G", () => {
    expect(aPhryDom.noteNames).toEqual(["A", "Bb", "C#", "D", "E", "F", "G"]);
  });

  it("за межами — undefined", () => {
    expect(noteAtDegree(aPhryDom, 0)).toBeUndefined();
    expect(noteAtDegree(aPhryDom, 8)).toBeUndefined();
  });
});

describe("pitchesInOctave()", () => {
  it("C Ionian oct 4 → C4..B4", () => {
    const s = createScale("ionian", IONIAN, "C");
    const ps = pitchesInOctave(s, 4);
    expect(ps.map((p) => p.fullName)).toEqual([
      "C4", "D4", "E4", "F4", "G4", "A4", "B4",
    ]);
  });

  it("A Dorian oct 3 — правильні MIDI", () => {
    const s = createScale("dorian", DORIAN, "A");
    const ps = pitchesInOctave(s, 3);
    expect(ps[0]!.midi).toBe(57); // A3
    expect(ps[6]!.midi).toBe(67); // G4 (♭7 перейшов в наступну октаву)
  });
});

describe("nearestScaleTone()", () => {
  const cMajor = createScale("ionian", IONIAN, "C");

  it("C# → snap до C або D (відстань 1)", () => {
    const result = nearestScaleTone(cMajor, 1); // C#=1
    expect(result.distance).toBe(1);
    expect(["C", "D"]).toContain(result.noteName);
  });

  it("F# → snap до F або G (відстань 1)", () => {
    const result = nearestScaleTone(cMajor, 6); // F#=6
    expect(result.distance).toBe(1);
  });

  it("E (chroma 4) — точно в ладу, відстань 0", () => {
    const result = nearestScaleTone(cMajor, 4);
    expect(result.distance).toBe(0);
    expect(result.noteName).toBe("E");
  });
});

describe("transposeScale()", () => {
  it("D Dorian → G Dorian", () => {
    const d = createScale("dorian", DORIAN, "D");
    const g = transposeScale(d, "G");
    expect(g.tonic).toBe("G");
    expect(g.noteNames).toEqual(["G", "A", "Bb", "C", "D", "E", "F"]);
  });
});

describe("recastInMode() — «Try in this mode»", () => {
  it("мелодія з C Ionian → D Dorian: ступені зберігаються", () => {
    const source = createScale("ionian", IONIAN, "C");
    const target = createScale("dorian", DORIAN, "D");
    const melody = ["C", "E", "G", "A", "G", "E", "C"];
    // C=1, E=3, G=5, A=6 в C Ionian
    // → D=1, F=3, A=5, B=6 в D Dorian
    const result = recastInMode(melody, source, target);
    expect(result).toEqual(["D", "F", "A", "B", "A", "F", "D"]);
  });

  it("нота не в ладу → snap до найближчого ступеня", () => {
    const source = createScale("ionian", IONIAN, "C");
    const target = createScale("dorian", DORIAN, "D");
    // F# (chroma 6) не в C Ionian → snap → nearest → F або G
    const result = recastInMode(["F#"], source, target);
    // F#=6 → nearestScaleTone(C Ionian, 6) → F(5) degree=4 → target degree 4 = G
    expect(result.length).toBe(1);
  });

  it("мелодія з E Mixolydian → E Phrygian dominant: відчутна зміна кольору", () => {
    const source = createScale("mixolydian", MIXOLYDIAN, "E");
    const target = createScale("phrygian-dom", PHRYGIAN_DOM, "E");
    const melody = ["E", "F#", "G#", "A", "B"];
    // 1,2,3,4,5 в обох — але різні інтервали
    const result = recastInMode(melody, source, target);
    // E=1→E, F#=2→F(♭2), G#=3→G#(♮3), A=4→A, B=5→B
    expect(result[0]).toBe("E");
    expect(result[1]).toBe("F"); // ♭2 замість ♮2 — ось він, гуцульський колір!
  });
});

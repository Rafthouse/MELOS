import { melodyTotalBeats, type Melody, type MelodyNote, type Scale } from "@melos/core-theory";
import { diatonicTriads, addSeventh, type ChordSpec } from "./chords";

export interface Localized {
  uk: string;
  en: string;
}

export interface Harmonization {
  id: string;
  label: Localized;
  description: Localized;
  /** По одному акорду на такт. */
  chords: ChordSpec[];
  explanation: Localized;
  citationIds: string[];
}

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

/** Розбити мелодію на такти (масиви нот за onset). */
function bars(melody: Melody, beatsPerBar: number): MelodyNote[][] {
  const total = melodyTotalBeats(melody);
  const count = Math.max(1, Math.ceil(total / beatsPerBar - 1e-9));
  const out: MelodyNote[][] = Array.from({ length: count }, () => []);
  for (const n of melody.notes) {
    const bi = Math.min(count - 1, Math.floor(n.onset / beatsPerBar + 1e-9));
    out[bi]!.push(n);
  }
  for (const b of out) b.sort((a, z) => a.onset - z.onset);
  return out;
}

/** Оцінити, як акорд підтримує ноти такту. */
function scoreChord(chord: ChordSpec, barNotes: MelodyNote[]): number {
  let s = 0;
  for (const n of barNotes) {
    const pc = mod12(n.pitch.midi);
    s += chord.pcs.includes(pc) ? n.duration : -0.4 * n.duration;
  }
  const first = barNotes[0];
  if (first && chord.pcs.includes(mod12(first.pitch.midi))) s += 0.5;
  return s;
}

function bestChord(chords: ChordSpec[], barNotes: MelodyNote[], allow?: (c: ChordSpec) => boolean): ChordSpec {
  const pool = allow ? chords.filter(allow) : chords;
  const cands = pool.length > 0 ? pool : chords;
  let best = cands[0]!;
  let bs = -Infinity;
  for (const c of cands) {
    const s = scoreChord(c, barNotes);
    if (s > bs) { bs = s; best = c; }
  }
  return best;
}

/**
 * Гармонізувати мелодію в кількох контрастних стилях (ТЗ M8).
 */
export function harmonize(melody: Melody, scale: Scale, beatsPerBar: number = 4): Harmonization[] {
  if (melody.notes.length === 0 || scale.cardinality < 7) return [];
  const triads = diatonicTriads(scale);
  const barNotes = bars(melody, beatsPerBar);
  const tonic = triads[0]!;
  const dominant = triads[4]!; // V
  const subdominant = triads[3]!; // IV

  const results: Harmonization[] = [];

  // ── Функційна ──
  const functional = barNotes.map((bn) => bestChord(triads, bn));
  if (functional.length >= 2) {
    functional[functional.length - 1] = tonic; // каданс на тоніку
    const pen = functional.length - 2;
    if (scoreChord(dominant, barNotes[pen]!) >= scoreChord(functional[pen]!, barNotes[pen]!) - 0.6) {
      functional[pen] = dominant; // підготувати каданс домінантою
    }
  }
  results.push({
    id: "functional",
    label: { uk: "Базова функційна", en: "Basic functional" },
    description: { uk: "T–S–D логіка, каданс V–I", en: "T–S–D logic, V–I cadence" },
    chords: functional,
    explanation: {
      uk: "Кожен такт гармонізовано тризвуччям ладу, що найкраще підтримує його ноти; фраза завершується кадансом домінанта→тоніка (V–I).",
      en: "Each bar is harmonized by the diatonic triad that best supports its notes; the phrase closes with a dominant→tonic cadence (V–I).",
    },
    citationIds: ["aldwell-schachter"],
  });

  // ── Pop (вісь I–V–vi–IV) ──
  const axisDegrees = [1, 5, 6, 4];
  const pop = barNotes.map((_, i) => triads[axisDegrees[i % 4]! - 1]!);
  results.push({
    id: "pop-axis",
    label: { uk: "Pop (вісь I–V–vi–IV)", en: "Pop (axis I–V–vi–IV)" },
    description: { uk: "Найпоширеніша поп-петля", en: "The ubiquitous pop loop" },
    chords: pop,
    explanation: {
      uk: "«Вісь» I–V–vi–IV циклічно під фразу: мажорна стабільність + мінорна меланхолія. Ноти поза акордом стають прохідними/опертими.",
      en: "The I–V–vi–IV ‘axis’ cycled under the phrase: major stability + minor melancholy. Off-chord melody notes act as passing/appoggiatura tones.",
    },
    citationIds: ["tagg-2014"],
  });

  // ── Модальна (без домінанти) ──
  const modal = barNotes.map((bn) =>
    bestChord(triads, bn, (c) => c.degree !== 5 && c.function !== "D"),
  );
  results.push({
    id: "modal",
    label: { uk: "Модальна (без V)", en: "Modal (no dominant)" },
    description: { uk: "Характеристичні акорди ладу", en: "Characteristic chords of the mode" },
    chords: modal,
    explanation: {
      uk: "Уникаємо домінанти (V) і провідного тону — гармонія тримається на тоніці й характеристичному акорді ладу (напр. мажорна IV у дорійському), зберігаючи модальний колір.",
      en: "Avoiding the dominant (V) and leading tone — harmony rests on the tonic and the mode’s characteristic chord (e.g. the major IV in Dorian), preserving the modal colour.",
    },
    citationIds: ["tagg-2014"],
  });

  // ── Джаз (септакорди, ii–V–I) ──
  const jazzBase = barNotes.map((bn) => bestChord(triads, bn));
  if (jazzBase.length >= 2) {
    jazzBase[jazzBase.length - 1] = tonic;
    jazzBase[jazzBase.length - 2] = dominant;
    if (jazzBase.length >= 3) jazzBase[jazzBase.length - 3] = subdominant.degree === 2 ? subdominant : triads[1]!; // ii
  }
  const jazz = jazzBase.map((c) => addSeventh(scale, c));
  results.push({
    id: "jazz",
    label: { uk: "Джаз (септакорди, ii–V–I)", en: "Jazz (sevenths, ii–V–I)" },
    description: { uk: "Регармонізація з септимами", en: "Reharmonization with sevenths" },
    chords: jazz,
    explanation: {
      uk: "Тризвуччя розширено до септакордів; завершення оформлено зворотом ii–V–I — циркульний рух квінтами, основа джазової каденції.",
      en: "Triads are extended to seventh chords; the ending is shaped as a ii–V–I — the circle-of-fifths motion at the heart of the jazz cadence.",
    },
    citationIds: ["tymoczko-2011", "aldwell-schachter"],
  });

  return results;
}

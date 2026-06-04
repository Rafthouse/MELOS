import type { Melody, Scale } from "@melos/core-theory";
import { melodicIntervals, melodyMidiSequence, degreeOf } from "@melos/core-theory";
import { makeFinding, type Finding } from "./finding";

/**
 * Anti-banality engine (ТЗ §4): розпізнавання кліше + predictability + Berlyne.
 * Кожен висновок — Finding із freshness-альтернативами (⭐/⭐⭐/⭐⭐⭐).
 */

/** Послідовність ступенів ладу (1-based; 0 = поза ладом). */
function degreeSeq(melody: Melody, scale: Scale): number[] {
  return melody.notes.map((n) => degreeOf(scale, n.pitch.name) ?? 0);
}

/** Чи містить arr підпослідовність pat поспіль? */
function hasRun(arr: number[], pat: number[]): boolean {
  for (let i = 0; i + pat.length <= arr.length; i++) {
    let ok = true;
    for (let j = 0; j < pat.length; j++) if (arr[i + j] !== pat[j]) { ok = false; break; }
    if (ok) return true;
  }
  return false;
}

interface ClicheDef {
  id: string;
  test: (deg: number[], midi: number[]) => boolean;
  message: { uk: string; en: string };
  citationIds: string[];
}

const CLICHES: ClicheDef[] = [
  {
    id: "descending-cadence",
    test: (d) => hasRun(d, [5, 4, 3, 2, 1]),
    message: {
      uk: "Низхідна 5–4–3–2–1 — найзаїждженіша кадансова лінія. ⭐ зупиніть рух на 2, лишивши 1 гармонії; ⭐⭐ замініть 4→3 стрибком 4→6; ⭐⭐⭐ переосмисліть як висхідну до 7.",
      en: "Descending 5–4–3–2–1 — the most clichéd cadential line. ⭐ stop on 2, leave 1 to the harmony; ⭐⭐ replace 4→3 with a 4→6 leap; ⭐⭐⭐ reimagine as an ascent to 7.",
    },
    citationIds: ["meyer-1956"],
  },
  {
    id: "ascending-scale",
    test: (d) => hasRun(d, [1, 2, 3, 4, 5]),
    message: {
      uk: "Пряма гама 1–2–3–4–5 — передбачуваний підйом. ⭐ пропустіть 4 (1-2-3-5); ⭐⭐ додайте сусідній тон; ⭐⭐⭐ перетворіть на арку зі спуском.",
      en: "A plain 1–2–3–4–5 scale — a predictable ascent. ⭐ skip 4 (1-2-3-5); ⭐⭐ add a neighbour tone; ⭐⭐⭐ turn it into an arch with a descent.",
    },
    citationIds: ["meyer-1956"],
  },
  {
    id: "tonic-arpeggio",
    test: (d) => hasRun(d, [1, 3, 5]) || hasRun(d, [5, 3, 1]),
    message: {
      uk: "Тонічне арпеджіо до-мі-соль — «дитяча» фігура. ⭐ замініть один акордовий тон сусіднім; ⭐⭐ додайте прохідні; ⭐⭐⭐ використайте іншу акордову якість.",
      en: "The do-mi-sol tonic arpeggio — a ‘nursery’ figure. ⭐ replace one chord tone with a neighbour; ⭐⭐ add passing tones; ⭐⭐⭐ use a different chord quality.",
    },
    citationIds: ["meyer-1956"],
  },
  {
    id: "mi-do-ending",
    test: (d) => d.length >= 2 && d[d.length - 2] === 3 && d[d.length - 1] === 1,
    message: {
      uk: "Кінцівка мі-до (3→1) — кліше поп-кульмінацій. ⭐ закінчіть на 3 (відкрито); ⭐⭐ підійдіть до 1 знизу (7→1); ⭐⭐⭐ обманіть очікування (закінчіть на 6).",
      en: "A mi-do (3→1) ending — a pop-climax cliché. ⭐ end on 3 (open); ⭐⭐ approach 1 from below (7→1); ⭐⭐⭐ deceive the cadence (end on 6).",
    },
    citationIds: ["meyer-1956"],
  },
  {
    id: "excessive-repetition",
    test: (_, midi) => {
      let run = 1;
      for (let i = 1; i < midi.length; i++) {
        run = midi[i] === midi[i - 1] ? run + 1 : 1;
        if (run >= 5) return true;
      }
      return false;
    },
    message: {
      uk: "Понад 4 однакові ноти поспіль — ризик монотонності. ⭐ змініть ритм повторів; ⭐⭐ введіть сусідній тон; ⭐⭐⭐ перетворіть на секвенцію.",
      en: "More than 4 identical notes in a row — risk of monotony. ⭐ vary the repeated rhythm; ⭐⭐ insert a neighbour tone; ⭐⭐⭐ turn it into a sequence.",
    },
    citationIds: ["margulis-2014"],
  },
];

/** Розпізнати кліше у мелодії. */
export function detectCliches(melody: Melody, scale: Scale): Finding[] {
  if (melody.notes.length < 3) return [];
  const deg = degreeSeq(melody, scale);
  const midi = melodyMidiSequence(melody);
  const found: Finding[] = [];
  for (const c of CLICHES) {
    if (c.test(deg, midi)) {
      found.push(makeFinding({
        kind: "cliche",
        severity: "suggestion",
        message: c.message,
        params: { cliche: c.id },
        citationIds: c.citationIds,
      }));
    }
  }
  return found;
}

// ─────────────────────── Predictability (Berlyne) ───────────────────────

/** Орієнтовні частоти мелодичних інтервалів (|семітони|) у західній музиці. */
const IV_PROB: number[] = [
  0.09, 0.17, 0.20, 0.13, 0.10, 0.08, 0.012, 0.06, 0.025, 0.02, 0.012, 0.006, 0.03,
];
function ivProb(absSemi: number): number {
  return IV_PROB[Math.min(absSemi, IV_PROB.length - 1)] ?? 0.004;
}

/** Індекс передбачуваності 0..~0.2 (вище = передбачуваніше). */
export function predictabilityScore(melody: Melody): number {
  const ivs = melodicIntervals(melody);
  if (ivs.length === 0) return 0;
  const sum = ivs.reduce((s, d) => s + ivProb(Math.abs(d)), 0);
  return sum / ivs.length;
}

/**
 * Оцінка передбачуваності/новизни (Berlyne inverted-U).
 */
export function analyzePredictability(melody: Melody): Finding | null {
  const ivs = melodicIntervals(melody);
  if (ivs.length < 3) return null;
  const score = predictabilityScore(melody);
  const pct = Math.round(score * 100);

  if (score >= 0.17) {
    return makeFinding({
      kind: "predictability",
      severity: "suggestion",
      message: {
        uk: `Висока передбачуваність (${pct}) — майже самі дрібні кроки. За Berlyne (перевернута-U) додайте несподіванку: характеристичний стрибок чи хроматизм.`,
        en: `High predictability (${pct}) — almost all small steps. Per Berlyne (inverted-U) add a surprise: a characteristic leap or chromaticism.`,
      },
      params: { predictability: pct },
      citationIds: ["berlyne-1971", "huron-2006"],
    });
  }
  if (score <= 0.055) {
    return makeFinding({
      kind: "predictability",
      severity: "suggestion",
      message: {
        uk: `Дуже низька передбачуваність (${pct}) — забагато великих/рідкісних стрибків, мелодію важко стежити. Додайте крокового руху для зв'язності.`,
        en: `Very low predictability (${pct}) — too many large/rare leaps, hard to follow. Add stepwise motion for coherence.`,
      },
      params: { predictability: pct },
      citationIds: ["berlyne-1971", "huron-2006"],
    });
  }
  return makeFinding({
    kind: "predictability",
    severity: "info",
    message: {
      uk: `Баланс передбачуваності й новизни (${pct}) — у «солодкій зоні» Berlyne. Добре.`,
      en: `Balance of predictability and novelty (${pct}) — within Berlyne’s sweet spot. Good.`,
    },
    params: { predictability: pct },
    citationIds: ["berlyne-1971"],
  });
}

/** Повний аналіз банальності → Finding[]. */
export function analyzeBanality(melody: Melody, scale: Scale): Finding[] {
  const out: Finding[] = [...detectCliches(melody, scale)];
  const pred = analyzePredictability(melody);
  if (pred) out.push(pred);
  return out;
}

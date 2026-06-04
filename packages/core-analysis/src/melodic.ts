import type { Melody, Scale } from "@melos/core-theory";
import { melodicIntervals, melodyRange, degreeOf } from "@melos/core-theory";
import { makeFinding, type Finding } from "./finding";

/**
 * Gap-fill / правило компенсації (Narmour I-R; Meyer).
 * Після стрибка > ч.4 (5 семітонів) очікується крок у протилежному напрямку.
 * Якщо стрибок не «заповнений» — Finding.
 */
export function analyzeGapFill(melody: Melody): Finding[] {
  const ivs = melodicIntervals(melody);
  const findings: Finding[] = [];

  for (let i = 0; i < ivs.length; i++) {
    const leap = ivs[i]!;
    if (Math.abs(leap) <= 5) continue; // не широкий стрибок

    const next = ivs[i + 1];
    // Фінальний стрибок фрази не позначаємо — немає наступного руху для оцінки.
    if (next === undefined) continue;

    const resolved =
      Math.abs(next) >= 1 &&
      Math.abs(next) <= 2 &&
      Math.sign(next) === -Math.sign(leap);

    if (!resolved) {
      const dir = leap > 0 ? "вгору" : "вниз";
      const counterDir = leap > 0 ? "вниз" : "up";
      findings.push(
        makeFinding({
          kind: "gap-fill-unresolved",
          severity: "suggestion",
          message: {
            uk: `Стрибок на ${Math.abs(leap)} пт ${dir} (нота ${i + 1}→${i + 2}) не компенсовано кроком у протилежному напрямку. Спробуйте крок ${leap > 0 ? "вниз" : "вгору"}.`,
            en: `A ${Math.abs(leap)}-semitone leap (note ${i + 1}→${i + 2}) is not balanced by a step in the opposite direction. Try a step ${leap > 0 ? "down" : "up"}.`,
          },
          location: { startIndex: i, endIndex: i + 2 },
          params: { leapSemitones: Math.abs(leap), counterDir },
          citationIds: ["narmour-1990", "meyer-1956"],
        }),
      );
    }
  }
  return findings;
}

/**
 * Співвідношення крокового і стрибкового руху.
 * Занадто багато кроків (>85%) — пласко; занадто багато стрибків (<40% кроків) — розірвано.
 */
export function analyzeStepwiseRatio(melody: Melody): Finding | null {
  const ivs = melodicIntervals(melody);
  const moves = ivs.filter((d) => d !== 0);
  if (moves.length < 3) return null;

  const steps = moves.filter((d) => Math.abs(d) >= 1 && Math.abs(d) <= 2).length;
  const ratio = steps / moves.length;
  const pct = Math.round(ratio * 100);

  if (ratio >= 0.85) {
    return makeFinding({
      kind: "stepwise-ratio",
      severity: "suggestion",
      message: {
        uk: `Ваша мелодія на ${pct}% складається з крокового руху — додайте характеристичний стрибок (наприклад, ч.5) для контрасту.`,
        en: `Your melody is ${pct}% stepwise — add a characteristic leap (e.g. a P5) for contrast.`,
      },
      params: { stepwisePercent: pct },
      citationIds: ["huron-2006"],
    });
  }

  if (ratio <= 0.4) {
    return makeFinding({
      kind: "stepwise-ratio",
      severity: "suggestion",
      message: {
        uk: `Лише ${pct}% крокового руху — мелодія розірвана. Додайте плавні кроки, щоб «заповнити» стрибки (gap-fill).`,
        en: `Only ${pct}% stepwise motion — the melody is disjunct. Add conjunct steps to ‘fill’ the leaps (gap-fill).`,
      },
      params: { stepwisePercent: pct },
      citationIds: ["huron-2006", "narmour-1990"],
    });
  }

  return null;
}

/**
 * Діапазон мелодії. Вокальний оптимум — близько децими (16 пт).
 * Понад дві октави (24 пт) — складно для вокалу.
 */
export function analyzeRange(melody: Melody): Finding | null {
  const { semitones } = melodyRange(melody);
  if (semitones > 24) {
    return makeFinding({
      kind: "range",
      severity: "warning",
      message: {
        uk: `Діапазон ${semitones} пт (понад дві октави) — важко для вокалу. Вокальний оптимум — близько децими (16 пт).`,
        en: `Range is ${semitones} semitones (over two octaves) — hard to sing. The vocal optimum is around a tenth (16 semitones).`,
      },
      params: { rangeSemitones: semitones },
      citationIds: ["huron-2006"],
    });
  }
  return null;
}

/** Чи має лад провідний тон (7-й ступінь на півтон нижче тоніки)? */
function scaleHasLeadingTone(scale: Scale): boolean {
  return scale.formula.includes(11);
}

/**
 * Гравітація провідного тону (Level 1): 7→1.
 * Якщо нота на 7-му ступені (провідний тон) НЕ розв'язується в тоніку — Finding.
 * Потребує тонального контексту (Scale).
 */
export function analyzeLeadingTone(melody: Melody, scale: Scale): Finding[] {
  if (!scaleHasLeadingTone(scale)) return [];
  const notes = melody.notes;
  const findings: Finding[] = [];

  for (let i = 0; i < notes.length - 1; i++) {
    const deg = degreeOf(scale, notes[i]!.pitch.name);
    if (deg !== 7) continue;
    const nextDeg = degreeOf(scale, notes[i + 1]!.pitch.name);
    if (nextDeg !== 1) {
      findings.push(
        makeFinding({
          kind: "leading-tone-unresolved",
          severity: "suggestion",
          message: {
            uk: `Провідний тон (нота ${i + 1}) не розв'язується в тоніку. Сильне тяжіння 7→1 лишилось нереалізованим — це можна використати свідомо або розв'язати.`,
            en: `The leading tone (note ${i + 1}) does not resolve to the tonic. The strong 7→1 pull is left unrealized — use it deliberately or resolve it.`,
          },
          location: { startIndex: i, endIndex: i + 1 },
          citationIds: ["huron-2006"],
        }),
      );
    }
  }
  return findings;
}

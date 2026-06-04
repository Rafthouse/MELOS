import type { Melody } from "@melos/core-theory";
import { makeFinding, type Finding } from "./finding";

/**
 * Метрична вага позиції (спрощена модель Longuet-Higgins & Lee 1984).
 * Вища (ближча до 0) = сильніша доля. Downbeat найсильніший.
 *
 * @param step  — крок усередині сітки (буде взято mod stepsPerBar)
 * @param beatsPerBar — доль у такті
 * @param sub   — підрозділів на долю (напр. 4 = шістнадцяті)
 */
export function metricWeight(step: number, beatsPerBar: number, sub: number): number {
  const stepsPerBar = beatsPerBar * sub;
  const s = ((step % stepsPerBar) + stepsPerBar) % stepsPerBar;

  if (s === 0) return 0; // downbeat — найсильніший
  if (s % sub === 0) {
    // рівень долі
    const beat = s / sub;
    if (beatsPerBar === 4 && beat === 2) return -1; // 3-я доля сильніша
    return -2;
  }
  if (sub % 2 === 0 && s % (sub / 2) === 0) return -3; // вісімкові офбіти
  return -4; // шістнадцяті
}

/**
 * Індекс синкопованості (Longuet-Higgins & Lee, спрощено).
 *
 * Синкопа = нота на слабкій позиції, що ТРИМАЄТЬСЯ через сильнішу позицію
 * (яка не переартикульована). Внесок = вага сильнішої позиції − вага ноти.
 */
export function syncopationIndex(melody: Melody, sub: number = 4): number {
  let total = 0;
  for (const note of melody.notes) {
    const p = Math.round(note.onset * sub);
    const durSteps = Math.max(1, Math.round(note.duration * sub));
    const wp = metricWeight(p, melody.beatsPerBar, sub);

    let maxW = -Infinity;
    for (let s = p + 1; s < p + durSteps; s++) {
      const w = metricWeight(s, melody.beatsPerBar, sub);
      if (w > maxW) maxW = w;
    }
    if (maxW > wp) total += maxW - wp;
  }
  return total;
}

/**
 * Аналіз грувності за синкопованістю.
 * Vuust «Goldilocks zone»: помірна синкопа максимізує бажання рухатися.
 */
export function analyzeSyncopation(melody: Melody, sub: number = 4): Finding {
  const index = syncopationIndex(melody, sub);
  const n = Math.max(1, melody.notes.length);
  const density = index / n;

  let message: { uk: string; en: string };
  if (index === 0) {
    message = {
      uk: "Синкоп немає — рівний рух по долях. Додайте легку синкопу для грувності (Vuust «Goldilocks»).",
      en: "No syncopation — straight on-beat motion. Add light syncopation for groove (Vuust ‘Goldilocks’).",
    };
  } else if (density <= 1.6) {
    message = {
      uk: `Помірна синкопованість (індекс ${index}) — зона максимальної грувності (Vuust «Goldilocks»).`,
      en: `Moderate syncopation (index ${index}) — the peak-groove zone (Vuust ‘Goldilocks’).`,
    };
  } else {
    message = {
      uk: `Висока синкопованість (індекс ${index}) — ризик втратити відчуття пульсу. Поверніть кілька опорних долей.`,
      en: `High syncopation (index ${index}) — risk of losing the pulse. Restore a few on-beat anchors.`,
    };
  }

  return makeFinding({
    kind: "syncopation",
    severity: "info",
    message,
    params: { syncopationIndex: index },
    citationIds: ["longuet-higgins-lee-1984", "vuust-2014"],
  });
}

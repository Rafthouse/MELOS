/**
 * Бібліотека ритмічних cells для Rhythm Designer (ТЗ M5, Level 5).
 * Усі — 1 такт 4/4, sub=4 (шістнадцяті), 16 кроків. 0=пауза, 1=удар, 2=акцент.
 */

/** Зібрати 16-кроковий патерн зі списків ударів і акцентів. */
function pat(hits: number[], accents: number[] = [], len = 16): number[] {
  const s = new Array<number>(len).fill(0);
  for (const i of hits) s[i] = 1;
  for (const i of accents) s[i] = 2;
  return s;
}

export const rawRhythmicCells: unknown[] = [
  {
    id: "son-clave",
    names: { uk: "Сон-клаве (3-2)", en: "Son clave (3-2)" },
    region: { uk: "Куба", en: "Cuba" },
    steps: pat([], [0, 3, 6, 10, 12]),
    sub: 4, beatsPerBar: 4,
    note: { uk: "Серце кубинської музики; асиметрія 3+2.", en: "The heart of Cuban music; the 3+2 asymmetry." },
  },
  {
    id: "rumba-clave",
    names: { uk: "Румба-клаве (3-2)", en: "Rumba clave (3-2)" },
    region: { uk: "Куба", en: "Cuba" },
    steps: pat([], [0, 3, 7, 10, 12]),
    sub: 4, beatsPerBar: 4,
    note: { uk: "Як сон-клаве, але 3-й удар зміщено пізніше — гостріший грув.", en: "Like son clave but the 3rd stroke is later — a sharper groove." },
  },
  {
    id: "tresillo",
    names: { uk: "Тресільйо (3-3-2)", en: "Tresillo (3-3-2)" },
    region: { uk: "Куба → світовий поп", en: "Cuba → global pop" },
    steps: pat([3, 11], [0, 6, 8, 14]),
    sub: 4, beatsPerBar: 4,
    note: { uk: "Від кубинської музики до Drake; основа незліченних хітів.", en: "From Cuban music to Drake; the basis of countless hits." },
  },
  {
    id: "habanera",
    names: { uk: "Гаванера / танго", en: "Habanera / tango" },
    region: { uk: "Куба / Аргентина", en: "Cuba / Argentina" },
    steps: pat([3, 11], [0, 4, 6, 8, 12, 14]),
    sub: 4, beatsPerBar: 4,
    note: { uk: "Танцювальний бас із крапкою на 1-й долі.", en: "A dance bass with a dot on beat 1." },
  },
  {
    id: "charleston",
    names: { uk: "Чарльстон", en: "Charleston" },
    region: { uk: "Джаз / свінг", en: "Jazz / swing" },
    steps: pat([], [0, 6, 8, 14]),
    sub: 4, beatsPerBar: 4,
    note: { uk: "Доля 1 + «і» другої долі — синкопа-підпис джазу й попу.", en: "Beat 1 + the ‘and’ of 2 — a syncopation signature of jazz and pop." },
  },
  {
    id: "four-on-floor",
    names: { uk: "Four-on-the-floor", en: "Four-on-the-floor" },
    region: { uk: "Диско / хаус", en: "Disco / house" },
    steps: pat([], [0, 4, 8, 12]),
    sub: 4, beatsPerBar: 4,
    note: { uk: "Удар на кожну долю — нульова синкопа, машинний драйв.", en: "A hit on every beat — zero syncopation, machine drive." },
  },
  {
    id: "backbeat",
    names: { uk: "Бекбіт (2 і 4)", en: "Backbeat (2 & 4)" },
    region: { uk: "Рок / поп", en: "Rock / pop" },
    steps: pat([0, 8], [4, 12]),
    sub: 4, beatsPerBar: 4,
    note: { uk: "Акцент на слабкі долі 2 і 4 — основа рок-біту.", en: "Accent on the weak beats 2 and 4 — the basis of the rock beat." },
  },
  {
    id: "dembow",
    names: { uk: "Дембоу", en: "Dembow" },
    region: { uk: "Реггетон / Ямайка", en: "Reggaeton / Jamaica" },
    steps: pat([0, 8], [3, 6, 10, 13]),
    sub: 4, beatsPerBar: 4,
    note: { uk: "«Boom-ch-boom-chick» — двигун реггетону.", en: "‘Boom-ch-boom-chick’ — the engine of reggaeton." },
  },
  {
    id: "dotted-eighth-sixteenth",
    names: { uk: "Крапкована 8-ма + 16-та", en: "Dotted-eighth + sixteenth" },
    region: { uk: "Motown / соул", en: "Motown / soul" },
    steps: pat([3, 7, 11, 15], [0, 4, 8, 12]),
    sub: 4, beatsPerBar: 4,
    note: { uk: "Пунктирний рух — характерний драйв Motown.", en: "A dotted lilt — the characteristic Motown drive." },
  },
];

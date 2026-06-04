import type { ModeDefinition } from "./schema";

/**
 * Перша партія ладів MELOS (v0.1).
 *
 * Підбір свідомий: 7 церковних + 2 пентатоніки + blues + 2 форми мінору
 * + 2 «дробові» лади (lydian dominant, whole-tone) + 2 близькі користувачеві:
 *   - ірландська музика → Dorian, Mixolydian (див. user_irish_bouzouki);
 *   - український матеріал → гуцульський (phrygian dominant), укр.-дорійський.
 *
 * Без дублів за звучанням: гуцульський НЕ дублюється окремим "phrygian-dominant".
 *
 * canonicalExamples тут — 2–3 на лад (повні 5–10 — задача курування, ТЗ §9).
 * Точні такти навмисно не вигадуємо; рівень тверджень — музикознавчо безпечний.
 *
 * Дані НЕ типізовані `ModeDefinition` напряму, а валідуються через Zod у index.ts
 * (parse-on-load), щоб superRefine-перевірки реально спрацьовували.
 */
export const rawModes: unknown[] = [
  // ─────────────────────────── ЦЕРКОВНІ ───────────────────────────
  {
    id: "ionian",
    names: { uk: "Іонійський (натуральний мажор)", en: "Ionian (major)" },
    aliases: ["major", "мажор"],
    formula: [0, 2, 4, 5, 7, 9, 11],
    parent: { scaleId: "ionian", degree: 1 },
    characteristicDegrees: [
      {
        degree: 7,
        label: {
          uk: "♮7 — провідний тон, сильне тяжіння до тоніки",
          en: "♮7 — leading tone, strong pull to the tonic",
        },
      },
    ],
    typicalCadences: [
      { kind: "PAC", label: { uk: "V–I, сопрано на 1", en: "V–I, soprano on 1" } },
      { kind: "plagal", label: { uk: "IV–I, «амінь»", en: "IV–I, the ‘amen’ cadence" } },
    ],
    typicalHarmony: [
      { roman: "I–V–vi–IV", label: { uk: "вісь поп-музики", en: "the pop axis" } },
      { roman: "I–IV–V", label: { uk: "базова функційна тріада", en: "primary triads" } },
    ],
    canonicalExamples: [
      {
        title: "Twinkle, Twinkle, Little Star",
        source: { uk: "традиційна", en: "traditional" },
        note: { uk: "еталон мажорної діатоніки", en: "the reference major scale" },
      },
      {
        title: "Ode to Joy",
        source: { uk: "Л. ван Бетовен", en: "L. van Beethoven" },
        year: 1824,
        note: { uk: "переважно покроковий мажорний підйом", en: "mostly stepwise major ascent" },
      },
    ],
    context: {
      emotional: { uk: "світлість, стабільність, відкритість", en: "brightness, stability, openness" },
      geographic: { uk: "універсальний у західній музиці", en: "universal in Western music" },
      historical: { uk: "основа тональної системи від бароко", en: "basis of tonality since the Baroque" },
    },
    family: "church",
  },
  {
    id: "dorian",
    names: { uk: "Дорійський", en: "Dorian" },
    aliases: ["дорійський мінор"],
    formula: [0, 2, 3, 5, 7, 9, 10],
    parent: { scaleId: "ionian", degree: 2 },
    characteristicDegrees: [
      {
        degree: 6,
        label: {
          uk: "♮6 — світла нота всередині мінорного ладу (відрізняє від еолійського)",
          en: "♮6 — the bright note inside a minor mode (distinguishes it from Aeolian)",
        },
      },
    ],
    typicalCadences: [
      { kind: "modal", label: { uk: "i–IV (мажорна IV — підпис ладу)", en: "i–IV (major IV is the hallmark)" } },
    ],
    typicalHarmony: [
      { roman: "i–IV", label: { uk: "мінорна тоніка + мажорна субдомінанта", en: "minor tonic + major subdominant" } },
      { roman: "i–♭VII–IV", label: { uk: "модальний фолк/рок-зворот", en: "modal folk/rock turn" } },
    ],
    canonicalExamples: [
      {
        title: "Scarborough Fair",
        source: { uk: "англ. традиційна", en: "English traditional" },
        note: { uk: "класичний дорійський наспів", en: "a classic Dorian tune" },
      },
      {
        title: "Drowsy Maggie",
        source: { uk: "ірландський рил", en: "Irish reel" },
        note: { uk: "E-дорійський, типовий для ірландської традиції", en: "E Dorian, staple of the Irish tradition" },
      },
      {
        title: "So What",
        source: { uk: "Miles Davis", en: "Miles Davis" },
        year: 1959,
        note: { uk: "модальний джаз на D-дорійському", en: "modal jazz on D Dorian" },
      },
    ],
    context: {
      emotional: { uk: "мінорна, але не похмура; «дорога», рух", en: "minor yet not gloomy; ‘the road’, motion" },
      geographic: { uk: "кельтський фольк, модальний джаз", en: "Celtic folk, modal jazz" },
      historical: { uk: "1-й автентичний церковний лад", en: "the 1st authentic church mode" },
    },
    family: "church",
  },
  {
    id: "phrygian",
    names: { uk: "Фрігійський", en: "Phrygian" },
    aliases: [],
    formula: [0, 1, 3, 5, 7, 8, 10],
    parent: { scaleId: "ionian", degree: 3 },
    characteristicDegrees: [
      {
        degree: 2,
        label: {
          uk: "♭2 — темний півтон одразу над тонікою, «іспанський» колір",
          en: "♭2 — the dark half-step right above the tonic, the ‘Spanish’ colour",
        },
      },
    ],
    typicalCadences: [
      { kind: "phrygian", label: { uk: "♭II–i — фрігійська каденція", en: "♭II–i — the Phrygian cadence" } },
    ],
    typicalHarmony: [
      { roman: "i–♭II", label: { uk: "тоніка + неаполітанський відтінок", en: "tonic + Neapolitan flavour" } },
    ],
    canonicalExamples: [
      {
        title: "Soleá (фламенко)",
        source: { uk: "андалузька традиція", en: "Andalusian tradition" },
        note: { uk: "фрігійський як основа кантe", en: "Phrygian as the basis of cante" },
      },
      {
        title: "Symphony of Destruction",
        source: { uk: "Megadeth", en: "Megadeth" },
        year: 1992,
        note: { uk: "фрігійський рифовий метал", en: "Phrygian riff metal" },
      },
    ],
    context: {
      emotional: { uk: "напруга, темрява, екзотика", en: "tension, darkness, exoticism" },
      geographic: { uk: "Іберія, метал, фламенко", en: "Iberia, metal, flamenco" },
      historical: { uk: "3-й церковний лад", en: "the 3rd church mode" },
    },
    family: "church",
  },
  {
    id: "lydian",
    names: { uk: "Лідійський", en: "Lydian" },
    aliases: [],
    formula: [0, 2, 4, 6, 7, 9, 11],
    parent: { scaleId: "ionian", degree: 4 },
    characteristicDegrees: [
      {
        degree: 4,
        label: {
          uk: "#4 — підвищена кварта, відчуття «ширяння», тритон над тонікою",
          en: "#4 — the raised fourth, a floating tritone over the tonic",
        },
      },
    ],
    typicalCadences: [
      { kind: "modal", label: { uk: "I–II (мажорна II — підпис ладу)", en: "I–II (major II is the hallmark)" } },
    ],
    typicalHarmony: [
      { roman: "I–II", label: { uk: "мажор + мажорна надтоніка", en: "major + major supertonic" } },
    ],
    canonicalExamples: [
      {
        title: "The Simpsons (main theme)",
        source: { uk: "Danny Elfman", en: "Danny Elfman" },
        year: 1989,
        note: { uk: "впізнаваний лідійський стрибок на #4", en: "the recognizable Lydian leap to #4" },
      },
      {
        title: "Flying in a Blue Dream",
        source: { uk: "Joe Satriani", en: "Joe Satriani" },
        year: 1989,
        note: { uk: "лідійський інструментал", en: "a Lydian instrumental" },
      },
    ],
    context: {
      emotional: { uk: "мрійливість, ширяння, диво", en: "dreaminess, floating, wonder" },
      geographic: { uk: "кіномузика, прог, джаз-ф'южн", en: "film music, prog, jazz fusion" },
      historical: { uk: "4-й церковний лад", en: "the 4th church mode" },
    },
    family: "church",
  },
  {
    id: "mixolydian",
    names: { uk: "Міксолідійський", en: "Mixolydian" },
    aliases: ["домінантовий лад"],
    formula: [0, 2, 4, 5, 7, 9, 10],
    parent: { scaleId: "ionian", degree: 5 },
    characteristicDegrees: [
      {
        degree: 7,
        label: {
          uk: "♭7 — знижений ввідний; мажор без тяжіння провідного тону",
          en: "♭7 — the lowered seventh; major without leading-tone pull",
        },
      },
    ],
    typicalCadences: [
      { kind: "modal", label: { uk: "♭VII–I — міксолідійська каденція", en: "♭VII–I — the Mixolydian cadence" } },
    ],
    typicalHarmony: [
      { roman: "I–♭VII–IV", label: { uk: "рок/фолк-зворот", en: "rock/folk turn" } },
    ],
    canonicalExamples: [
      {
        title: "She Moved Through the Fair",
        source: { uk: "ірландська традиційна", en: "Irish traditional" },
        note: { uk: "міксолідійський наспів без провідного тону", en: "a Mixolydian air with no leading tone" },
      },
      {
        title: "Sweet Home Alabama",
        source: { uk: "Lynyrd Skynyrd", en: "Lynyrd Skynyrd" },
        year: 1974,
        note: { uk: "I–♭VII–IV — хрестоматійний міксолідійський рок", en: "I–♭VII–IV, textbook Mixolydian rock" },
      },
    ],
    context: {
      emotional: { uk: "світла приземленість, фольковість, рух", en: "bright groundedness, folksiness, drive" },
      geographic: { uk: "кельтська традиція, блюз-рок", en: "Celtic tradition, blues-rock" },
      historical: { uk: "5-й церковний лад", en: "the 5th church mode" },
    },
    family: "church",
  },
  {
    id: "aeolian",
    names: { uk: "Еолійський (натуральний мінор)", en: "Aeolian (natural minor)" },
    aliases: ["minor", "мінор"],
    formula: [0, 2, 3, 5, 7, 8, 10],
    parent: { scaleId: "ionian", degree: 6 },
    characteristicDegrees: [
      {
        degree: 6,
        label: {
          uk: "♭6 — туга й важкість, що відрізняє від дорійського",
          en: "♭6 — the melancholy weight that sets it apart from Dorian",
        },
      },
    ],
    typicalCadences: [
      { kind: "modal", label: { uk: "♭VII–i або v–i (без провідного тону)", en: "♭VII–i or v–i (no leading tone)" } },
    ],
    typicalHarmony: [
      { roman: "i–♭VI–♭VII", label: { uk: "епічний мінорний зворот", en: "the epic minor turn" } },
      { roman: "i–iv–v", label: { uk: "натуральний мінор, мінорна домінанта", en: "natural minor, minor dominant" } },
    ],
    canonicalExamples: [
      {
        title: "Losing My Religion",
        source: { uk: "R.E.M.", en: "R.E.M." },
        year: 1991,
        note: { uk: "переважно еолійський поп", en: "largely Aeolian pop" },
      },
      {
        title: "Mad World",
        source: { uk: "Tears for Fears / Gary Jules", en: "Tears for Fears / Gary Jules" },
        note: { uk: "натуральний мінор без підвищеного ввідного", en: "natural minor, no raised leading tone" },
      },
    ],
    context: {
      emotional: { uk: "смуток, інтроспекція, серйозність", en: "sadness, introspection, gravity" },
      geographic: { uk: "західна поп/рок-музика, фольк", en: "Western pop/rock, folk" },
      historical: { uk: "6-й церковний лад, основа мінору", en: "the 6th church mode, basis of the minor" },
    },
    family: "church",
  },
  {
    id: "locrian",
    names: { uk: "Локрійський", en: "Locrian" },
    aliases: [],
    formula: [0, 1, 3, 5, 6, 8, 10],
    parent: { scaleId: "ionian", degree: 7 },
    characteristicDegrees: [
      {
        degree: 2,
        label: { uk: "♭2 — темний півтон над тонікою", en: "♭2 — dark half-step above the tonic" },
      },
      {
        degree: 5,
        label: {
          uk: "♭5 — зменшена квінта; тоніка нестабільна (зменшена тризвучність)",
          en: "♭5 — diminished fifth; the tonic itself is unstable (diminished triad)",
        },
      },
    ],
    typicalCadences: [
      { kind: "none", label: { uk: "лад майже не тонізується традиційно", en: "the mode is rarely tonicized traditionally" } },
    ],
    typicalHarmony: [
      { roman: "i°", label: { uk: "зменшена тоніка — без опори", en: "diminished tonic — no point of rest" } },
    ],
    canonicalExamples: [
      {
        title: "Army of Me",
        source: { uk: "Björk", en: "Björk" },
        year: 1995,
        note: { uk: "рідкісне локрійське забарвлення в попі", en: "a rare Locrian colouring in pop" },
      },
    ],
    context: {
      emotional: { uk: "нестабільність, тривога, відсутність опори", en: "instability, anxiety, no ground" },
      geographic: { uk: "експериментальний метал, академічна музика", en: "experimental metal, academic music" },
      historical: { uk: "7-й церковний лад, теоретичний, рідкісний на практиці", en: "the 7th church mode, theoretical, rare in practice" },
    },
    family: "church",
  },

  // ─────────────────────────── ПЕНТАТОНІКИ + BLUES ───────────────────────────
  {
    id: "major-pentatonic",
    names: { uk: "Мажорна пентатоніка", en: "Major pentatonic" },
    aliases: [],
    formula: [0, 2, 4, 7, 9],
    characteristicDegrees: [
      {
        degree: 1,
        label: {
          uk: "відсутність 4 і 7 (півтонів) — немає тяжінь, усе консонує",
          en: "no 4th or 7th (no half-steps) — no tendency tones, everything consonant",
        },
      },
    ],
    typicalCadences: [
      { kind: "modal", label: { uk: "дрон / кварто-квінтові опори", en: "drone / quartal-quintal support" } },
    ],
    typicalHarmony: [
      { roman: "I (drone)", label: { uk: "часто без функційної гармонії", en: "often without functional harmony" } },
    ],
    canonicalExamples: [
      {
        title: "Amazing Grace",
        source: { uk: "традиційний гімн", en: "traditional hymn" },
        note: { uk: "повністю на мажорній пентатоніці", en: "entirely major pentatonic" },
      },
      {
        title: "My Girl",
        source: { uk: "The Temptations", en: "The Temptations" },
        year: 1964,
        note: { uk: "пентатонічний рифф-вступ", en: "the pentatonic intro riff" },
      },
    ],
    context: {
      emotional: { uk: "відкритість, простота, радість", en: "openness, simplicity, joy" },
      geographic: { uk: "крос-культурна універсалія (Savage 2015)", en: "a cross-cultural universal (Savage 2015)" },
      historical: { uk: "одна з найдавніших звукорядних структур", en: "one of the oldest scale structures" },
    },
    family: "pentatonic",
  },
  {
    id: "minor-pentatonic",
    names: { uk: "Мінорна пентатоніка", en: "Minor pentatonic" },
    aliases: [],
    formula: [0, 3, 5, 7, 10],
    characteristicDegrees: [
      {
        degree: 1,
        label: {
          uk: "відсутність 2 і ♭6 — мінор без напівтонових тяжінь",
          en: "no 2nd or ♭6 — minor without half-step tendencies",
        },
      },
    ],
    typicalCadences: [
      { kind: "modal", label: { uk: "♭VII–i / v–i дрон", en: "♭VII–i / v–i drone" } },
    ],
    typicalHarmony: [
      { roman: "i–♭III–IV", label: { uk: "блюз/рок-каркас", en: "blues/rock frame" } },
    ],
    canonicalExamples: [
      {
        title: "Smoke on the Water",
        source: { uk: "Deep Purple", en: "Deep Purple" },
        year: 1972,
        note: { uk: "мінорно-пентатонічний рифф", en: "the minor-pentatonic riff" },
      },
    ],
    context: {
      emotional: { uk: "сила, прямота, блюзовість", en: "power, directness, bluesiness" },
      geographic: { uk: "блюз, рок, поп — глобально", en: "blues, rock, pop — globally" },
      historical: { uk: "інверсія мажорної пентатоніки", en: "a rotation of the major pentatonic" },
    },
    family: "pentatonic",
  },
  {
    id: "blues-minor",
    names: { uk: "Блюзова (мінорна) гама", en: "Blues (minor) scale" },
    aliases: ["hexatonic blues"],
    formula: [0, 3, 5, 6, 7, 10],
    parent: { scaleId: "minor-pentatonic", degree: 1 },
    characteristicDegrees: [
      {
        degree: 4,
        label: {
          uk: "♭5 — «блюзова нота», прохідне напруження між 4 і 5",
          en: "♭5 — the ‘blue note’, a passing tension between 4 and 5",
        },
      },
    ],
    typicalCadences: [
      { kind: "modal", label: { uk: "12-тактовий блюзовий зворот I7–IV7–V7", en: "12-bar blues turnaround I7–IV7–V7" } },
    ],
    typicalHarmony: [
      { roman: "I7–IV7–V7", label: { uk: "домінантсепт-блюз", en: "dominant-seventh blues" } },
    ],
    canonicalExamples: [
      {
        title: "Sweet Home Chicago",
        source: { uk: "блюзовий стандарт", en: "blues standard" },
        note: { uk: "блюзова гама поверх 12 тактів", en: "blues scale over a 12-bar form" },
      },
    ],
    context: {
      emotional: { uk: "туга з силою, «бруд», виразність", en: "ache with grit, ‘dirt’, expressivity" },
      geographic: { uk: "афроамериканська традиція, блюз", en: "African-American tradition, the blues" },
      historical: { uk: "мінорна пентатоніка + ♭5", en: "minor pentatonic + ♭5" },
    },
    family: "blues",
  },

  // ─────────────────────────── ФОРМИ МІНОРУ ───────────────────────────
  {
    id: "harmonic-minor",
    names: { uk: "Гармонічний мінор", en: "Harmonic minor" },
    aliases: [],
    formula: [0, 2, 3, 5, 7, 8, 11],
    characteristicDegrees: [
      {
        degree: 7,
        label: {
          uk: "♮7 — провідний тон, що дає збільшену секунду з ♭6",
          en: "♮7 — leading tone forming an augmented 2nd with ♭6",
        },
      },
    ],
    typicalCadences: [
      { kind: "PAC", label: { uk: "V–i з мажорною домінантою (за рахунок ♮7)", en: "V–i with a major dominant (thanks to ♮7)" } },
    ],
    typicalHarmony: [
      { roman: "i–V7", label: { uk: "мінорна тоніка + функційна домінанта", en: "minor tonic + functional dominant" } },
    ],
    canonicalExamples: [
      {
        title: "Hava Nagila",
        source: { uk: "єврейська традиційна", en: "Jewish traditional" },
        note: { uk: "гарм. мінор / фрігійський домінантовий", en: "harmonic minor / Phrygian dominant" },
      },
    ],
    context: {
      emotional: { uk: "драматизм, напруга домінанти, «східний» відтінок", en: "drama, dominant tension, an ‘Eastern’ tint" },
      geographic: { uk: "європейська класика, клезмер, метал", en: "European classical, klezmer, metal" },
      historical: { uk: "мінор із підвищеним ввідним для функційної каденції", en: "minor with raised leading tone for functional cadence" },
    },
    family: "melodic-minor-modes",
  },
  {
    id: "melodic-minor",
    names: { uk: "Мелодичний мінор (висхідний)", en: "Melodic minor (ascending)" },
    aliases: ["jazz minor"],
    formula: [0, 2, 3, 5, 7, 9, 11],
    characteristicDegrees: [
      {
        degree: 6,
        label: { uk: "♮6 над мінорною терцією — згладжує крок до ♮7", en: "♮6 over a minor third — smooths the step to ♮7" },
      },
      {
        degree: 7,
        label: { uk: "♮7 — провідний тон без збільшеної секунди", en: "♮7 — leading tone without the augmented 2nd" },
      },
    ],
    typicalCadences: [
      { kind: "PAC", label: { uk: "V–i, плавне голосоведіння вгору", en: "V–i, smooth upward voice leading" } },
    ],
    typicalHarmony: [
      { roman: "i–IV–V", label: { uk: "функційний мінор; у джазі — джазовий мінор", en: "functional minor; in jazz, the ‘jazz minor’" } },
    ],
    canonicalExamples: [
      {
        title: "Yesterdays",
        source: { uk: "Jerome Kern (джазовий стандарт)", en: "Jerome Kern (jazz standard)" },
        note: { uk: "мелодичний мінор у джазовому контексті", en: "melodic minor in a jazz context" },
      },
    ],
    context: {
      emotional: { uk: "напруга, що тече вгору; рафінованість", en: "upward-flowing tension; refinement" },
      geographic: { uk: "класика, джаз", en: "classical, jazz" },
      historical: { uk: "джерело багатьох джазових ладів (4-й — lydian dominant)", en: "source of many jazz modes (4th = Lydian dominant)" },
    },
    family: "melodic-minor-modes",
  },
  {
    id: "lydian-dominant",
    names: { uk: "Лідійський домінантовий (акустичний)", en: "Lydian dominant (acoustic)" },
    aliases: ["overtone", "acoustic scale", "Lydian ♭7"],
    formula: [0, 2, 4, 6, 7, 9, 10],
    parent: { scaleId: "melodic-minor", degree: 4 },
    characteristicDegrees: [
      {
        degree: 4,
        label: { uk: "#4 — лідійське ширяння", en: "#4 — the Lydian float" },
      },
      {
        degree: 7,
        label: { uk: "♭7 — домінантова приземленість водночас", en: "♭7 — dominant groundedness at the same time" },
      },
    ],
    typicalCadences: [
      { kind: "modal", label: { uk: "звучання V7#11, домінантова функція", en: "a V7#11 sound, dominant function" } },
    ],
    typicalHarmony: [
      { roman: "I7(#11)", label: { uk: "домінантсепт із підвищеною ундецимою", en: "dominant seventh with a raised eleventh" } },
    ],
    canonicalExamples: [
      {
        title: "The Simpsons (bridge)",
        source: { uk: "Danny Elfman", en: "Danny Elfman" },
        note: { uk: "#4 разом із ♭7 у переході", en: "#4 together with ♭7 in the bridge" },
      },
    ],
    context: {
      emotional: { uk: "яскравість із «прянкою», обертональна свіжість", en: "brightness with a ‘spice’, overtone freshness" },
      geographic: { uk: "джаз-ф'южн, кіно, обертональний фольк", en: "jazz fusion, film, overtone folk" },
      historical: { uk: "4-й ступінь мелодичного мінору; близький до обертонового ряду", en: "the 4th degree of melodic minor; close to the overtone series" },
    },
    family: "melodic-minor-modes",
  },

  // ─────────────────────────── УКРАЇНСЬКІ ───────────────────────────
  {
    id: "phrygian-dominant",
    names: { uk: "Фрігійський домінантовий / Гуцульський", en: "Phrygian dominant / Hutsul" },
    aliases: ["Spanish", "Freygish", "Hijaz", "Гуцульський", "5-й ступінь гарм. мінору"],
    formula: [0, 1, 4, 5, 7, 8, 10],
    parent: { scaleId: "harmonic-minor", degree: 5 },
    characteristicDegrees: [
      {
        degree: 2,
        label: { uk: "♭2 — темний півтон над тонікою", en: "♭2 — dark half-step above the tonic" },
      },
      {
        degree: 3,
        label: {
          uk: "♮3 над ♭2 — збільшена секунда, «гуцульсько-східний» колір",
          en: "♮3 above ♭2 — an augmented 2nd, the ‘Hutsul/Eastern’ colour",
        },
      },
    ],
    typicalCadences: [
      { kind: "phrygian", label: { uk: "♭II–I — кадансовий зворот на мажорній тоніці", en: "♭II–I — cadence onto a major tonic" } },
    ],
    typicalHarmony: [
      { roman: "I–♭II", label: { uk: "мажорна тоніка + неаполь; андалузький зворот на V", en: "major tonic + Neapolitan; the Andalusian cadence sits on its V" } },
    ],
    canonicalExamples: [
      {
        title: "Гуцульські награвання",
        source: { uk: "українська (Карпати)", en: "Ukrainian (Carpathians)" },
        note: { uk: "тонічна збільшена секунда — підпис ладу", en: "the tonic augmented second is the hallmark" },
      },
      {
        title: "Misirlou",
        source: { uk: "середземноморська/грецька", en: "Mediterranean/Greek" },
        note: { uk: "фрігійський домінантовий у популярному вигляді", en: "Phrygian dominant in a popular form" },
      },
    ],
    context: {
      emotional: { uk: "жагучість, екзотика, ритуальність", en: "ardour, exoticism, ritual" },
      geographic: { uk: "Карпати, клезмер, фламенко, Близький Схід", en: "the Carpathians, klezmer, flamenco, the Middle East" },
      historical: { uk: "5-й ступінь гармонічного мінору; в українській традиції — гуцульський лад", en: "the 5th degree of harmonic minor; in Ukrainian tradition the Hutsul mode" },
    },
    family: "ukrainian",
  },
  {
    id: "ukrainian-dorian",
    names: { uk: "Український дорійський", en: "Ukrainian Dorian" },
    aliases: ["Dorian #4", "Romanian minor", "Misheberach", "Nikriz"],
    formula: [0, 2, 3, 6, 7, 9, 10],
    parent: { scaleId: "harmonic-minor", degree: 4 },
    characteristicDegrees: [
      {
        degree: 4,
        label: {
          uk: "#4 — підвищена кварта над мінорною терцією, збільшена секунда з ♭3",
          en: "#4 — raised fourth over a minor third, an augmented 2nd with ♭3",
        },
      },
      {
        degree: 6,
        label: { uk: "♮6 — світла нота (дорійська спадщина)", en: "♮6 — the bright note (Dorian heritage)" },
      },
    ],
    typicalCadences: [
      { kind: "modal", label: { uk: "i–IV (мажорна IV із #4), часто над дроном", en: "i–IV (major IV via #4), often over a drone" } },
    ],
    typicalHarmony: [
      { roman: "i–IV", label: { uk: "мінорна тоніка + мажорна субдомінанта з підвищеною квартою", en: "minor tonic + major subdominant via the raised fourth" } },
    ],
    canonicalExamples: [
      {
        title: "Українські танцювальні награвання",
        source: { uk: "українська традиційна", en: "Ukrainian traditional" },
        note: { uk: "характеристична #4 в мінорному ладу", en: "the characteristic #4 within a minor mode" },
      },
      {
        title: "Mi Shebeirach",
        source: { uk: "єврейська літургійна", en: "Jewish liturgical" },
        note: { uk: "той самий звукоряд у клезмерській традиції", en: "the same scale in the klezmer tradition" },
      },
    ],
    context: {
      emotional: { uk: "жалоба з гострим злетом, гуцульсько-балканський перегук", en: "lament with a sharp lift; a Hutsul–Balkan echo" },
      geographic: { uk: "Україна, Румунія, клезмер, Балкани", en: "Ukraine, Romania, klezmer, the Balkans" },
      historical: { uk: "4-й ступінь гармонічного мінору; стрижневий український модальний матеріал", en: "the 4th degree of harmonic minor; a core Ukrainian modal resource" },
    },
    family: "ukrainian",
  },

  // ─────────────────────────── СИМЕТРИЧНІ ───────────────────────────
  {
    id: "whole-tone",
    names: { uk: "Цілотонна гама", en: "Whole-tone scale" },
    aliases: ["Messiaen mode 1"],
    formula: [0, 2, 4, 6, 8, 10],
    characteristicDegrees: [
      {
        degree: 1,
        label: {
          uk: "усі кроки — велика секунда; немає півтонів, тритонів-розв'язань і тоніки",
          en: "every step is a whole tone; no half-steps, no resolving tritones, no tonic gravity",
        },
      },
    ],
    typicalCadences: [
      { kind: "none", label: { uk: "функційних каденцій немає — лад «завислий»", en: "no functional cadences — the mode hangs suspended" } },
    ],
    typicalHarmony: [
      { roman: "I+", label: { uk: "збільшені тризвуччя, паралельний рух", en: "augmented triads, parallel motion" } },
    ],
    canonicalExamples: [
      {
        title: "Voiles (Préludes I)",
        source: { uk: "Claude Debussy", en: "Claude Debussy" },
        year: 1910,
        note: { uk: "майже повністю цілотонна п'єса", en: "an almost entirely whole-tone piece" },
      },
      {
        title: "You Are the Sunshine of My Life (intro)",
        source: { uk: "Stevie Wonder", en: "Stevie Wonder" },
        year: 1972,
        note: { uk: "цілотонна гармонія вступу", en: "whole-tone harmony in the intro" },
      },
    ],
    context: {
      emotional: { uk: "невагомість, сон, дезорієнтація", en: "weightlessness, dream, disorientation" },
      geographic: { uk: "імпресіонізм, кіно (флешбеки, марення)", en: "impressionism, film (flashbacks, dreams)" },
      historical: { uk: "1-й лад обмеженого транспонування Месіана; лише 2 транспозиції", en: "Messiaen’s 1st mode of limited transposition; only 2 transpositions" },
    },
    family: "symmetric",
  },
  {
    id: "octatonic-hw",
    names: { uk: "Октатоніка (півтон–тон)", en: "Octatonic (half–whole)" },
    aliases: ["diminished scale", "Messiaen mode 2", "H/W"],
    formula: [0, 1, 3, 4, 6, 7, 9, 10],
    characteristicDegrees: [
      {
        degree: 1,
        label: {
          uk: "чергування півтон–тон; симетрія, лише 3 транспозиції",
          en: "alternating half–whole; symmetric, only 3 transpositions",
        },
      },
    ],
    typicalCadences: [
      { kind: "modal", label: { uk: "над домінантсептакордом ♭9 (V7♭9)", en: "over a dominant ♭9 chord (V7♭9)" } },
    ],
    typicalHarmony: [
      { roman: "V7♭9", label: { uk: "домінанта зі зниженою ноною; зменшені акорди", en: "dominant with flat ninth; diminished chords" } },
    ],
    canonicalExamples: [
      {
        title: "Petrushka",
        source: { uk: "Ігор Стравінський", en: "Igor Stravinsky" },
        year: 1911,
        note: { uk: "октатонічні гармонії «петрушкиного» акорду", en: "octatonic harmonies of the ‘Petrushka chord’" },
      },
    ],
    context: {
      emotional: { uk: "напружена нестабільність, механічність", en: "tense instability, mechanical motion" },
      geographic: { uk: "російська школа, джаз над домінантою, кіно жахів", en: "the Russian school, jazz over dominants, horror film" },
      historical: { uk: "2-й лад Месіана; основа зменшеної гармонії XX ст.", en: "Messiaen’s 2nd mode; basis of 20th-c. diminished harmony" },
    },
    family: "symmetric",
  },
  {
    id: "octatonic-wh",
    names: { uk: "Октатоніка (тон–півтон)", en: "Octatonic (whole–half)" },
    aliases: ["diminished scale", "W/H"],
    formula: [0, 2, 3, 5, 6, 8, 9, 11],
    parent: { scaleId: "octatonic-hw", degree: 2 },
    characteristicDegrees: [
      {
        degree: 1,
        label: {
          uk: "чергування тон–півтон; над зменшеним септакордом тоніки",
          en: "alternating whole–half; over a diminished-seventh tonic",
        },
      },
    ],
    typicalCadences: [
      { kind: "modal", label: { uk: "над зменшеним септакордом (dim7)", en: "over a diminished-seventh chord (dim7)" } },
    ],
    typicalHarmony: [
      { roman: "dim7", label: { uk: "зменшений септакорд", en: "diminished-seventh chord" } },
    ],
    canonicalExamples: [
      {
        title: "Scheherazade (епізоди)",
        source: { uk: "М. Римський-Корсаков", en: "N. Rimsky-Korsakov" },
        year: 1888,
        note: { uk: "октатонічні фігурації над зменшеною гармонією", en: "octatonic figuration over diminished harmony" },
      },
    ],
    context: {
      emotional: { uk: "тривога, казкова фантастика", en: "anxiety, fairy-tale fantasy" },
      geographic: { uk: "російська школа, джазова імпровізація", en: "the Russian school, jazz improvisation" },
      historical: { uk: "ротація октатоніки H/W (та сама гама від іншого ступеня)", en: "a rotation of the H/W octatonic (same scale, different degree)" },
    },
    family: "symmetric",
  },

  // ─────────────────────── МЕЛОДИЧНИЙ МІНОР — ДЖАЗОВІ ЛАДИ ───────────────────────
  {
    id: "altered",
    names: { uk: "Альтерована (супер-локрійська)", en: "Altered (super Locrian)" },
    aliases: ["Super Locrian", "diminished whole-tone", "altered dominant"],
    formula: [0, 1, 3, 4, 6, 8, 10],
    parent: { scaleId: "melodic-minor", degree: 7 },
    characteristicDegrees: [
      {
        degree: 1,
        label: {
          uk: "усі ноти — альтерації домінанти: ♭9, #9, ♭5, #5",
          en: "every note is a dominant alteration: ♭9, #9, ♭5, #5",
        },
      },
    ],
    typicalCadences: [
      { kind: "modal", label: { uk: "над V7alt → розв'язання в тоніку", en: "over V7alt → resolving to the tonic" } },
    ],
    typicalHarmony: [
      { roman: "V7alt", label: { uk: "максимально напружена домінанта", en: "the maximally tense dominant" } },
    ],
    canonicalExamples: [
      {
        title: "ii–V–I (джазовий зворот)",
        source: { uk: "бібоп-традиція", en: "the bebop tradition" },
        note: { uk: "звучання альтерованої домінанти перед розв'язанням", en: "the altered-dominant sound before resolution" },
      },
    ],
    context: {
      emotional: { uk: "гранична напруга, що вимагає розв'язання", en: "extreme tension demanding resolution" },
      geographic: { uk: "бібоп, модальний і пост-боп джаз", en: "bebop, modal and post-bop jazz" },
      historical: { uk: "7-й ступінь мелодичного мінору", en: "the 7th degree of melodic minor" },
    },
    family: "melodic-minor-modes",
  },
  {
    id: "locrian-natural-2",
    names: { uk: "Локрійський ♮2 (напівзменшений)", en: "Locrian ♮2 (half-diminished)" },
    aliases: ["Aeolian ♭5", "half-diminished scale"],
    formula: [0, 2, 3, 5, 6, 8, 10],
    parent: { scaleId: "melodic-minor", degree: 6 },
    characteristicDegrees: [
      {
        degree: 2,
        label: { uk: "♮2 пом'якшує локрійську темряву", en: "♮2 softens the Locrian darkness" },
      },
      {
        degree: 5,
        label: { uk: "♭5 — напівзменшена тоніка (m7♭5)", en: "♭5 — a half-diminished tonic (m7♭5)" },
      },
    ],
    typicalCadences: [
      { kind: "modal", label: { uk: "над iiø7 у мінорному ii–V–i", en: "over the iiø7 in a minor ii–V–i" } },
    ],
    typicalHarmony: [
      { roman: "iiø7", label: { uk: "напівзменшений як субдомінанта мінору", en: "half-diminished as the minor subdominant" } },
    ],
    canonicalExamples: [
      {
        title: "мінорний ii–V–i",
        source: { uk: "джазовий стандарт", en: "jazz standard" },
        note: { uk: "лад напівзменшеного акорду перед домінантою", en: "the scale of the half-diminished chord before the dominant" },
      },
    ],
    context: {
      emotional: { uk: "тьмяна нестабільність із проблиском", en: "dim instability with a glimmer" },
      geographic: { uk: "джаз, особливо мінорні баляди", en: "jazz, especially minor ballads" },
      historical: { uk: "6-й ступінь мелодичного мінору", en: "the 6th degree of melodic minor" },
    },
    family: "melodic-minor-modes",
  },
  {
    id: "lydian-augmented",
    names: { uk: "Лідійський збільшений", en: "Lydian augmented" },
    aliases: ["Lydian #5"],
    formula: [0, 2, 4, 6, 8, 9, 11],
    parent: { scaleId: "melodic-minor", degree: 3 },
    characteristicDegrees: [
      {
        degree: 4,
        label: { uk: "#4 — лідійське ширяння", en: "#4 — the Lydian float" },
      },
      {
        degree: 5,
        label: { uk: "#5 — збільшена квінта, мерехтіння maj7#5", en: "#5 — augmented fifth, the shimmer of maj7#5" },
      },
    ],
    typicalCadences: [
      { kind: "modal", label: { uk: "над Imaj7#5", en: "over Imaj7#5" } },
    ],
    typicalHarmony: [
      { roman: "Imaj7#5", label: { uk: "великий мажорсептакорд зі збільшеною квінтою", en: "major-seventh with a raised fifth" } },
    ],
    canonicalExamples: [
      {
        title: "кіномузика 1950-х",
        source: { uk: "голлівудська традиція", en: "the Hollywood tradition" },
        note: { uk: "мерехтливе «зоряне» звучання maj7#5", en: "the shimmering ‘starlit’ maj7#5 sound" },
      },
    ],
    context: {
      emotional: { uk: "піднесена мрійливість, зачудування", en: "elevated reverie, wonder" },
      geographic: { uk: "джаз, кіно, прог", en: "jazz, film, prog" },
      historical: { uk: "3-й ступінь мелодичного мінору", en: "the 3rd degree of melodic minor" },
    },
    family: "melodic-minor-modes",
  },

  // ─────────────────────── БАЛКАНСЬКІ / ВІЗАНТІЙСЬКІ ───────────────────────
  {
    id: "double-harmonic",
    names: { uk: "Подвійний гармонічний (візантійський)", en: "Double harmonic (Byzantine)" },
    aliases: ["Hijaz Kar", "Byzantine", "Arabic scale", "Gypsy major"],
    formula: [0, 1, 4, 5, 7, 8, 11],
    characteristicDegrees: [
      {
        degree: 2,
        label: { uk: "♭2 з ♮3 — нижня збільшена секунда", en: "♭2 with ♮3 — the lower augmented second" },
      },
      {
        degree: 6,
        label: { uk: "♭6 з ♮7 — верхня збільшена секунда", en: "♭6 with ♮7 — the upper augmented second" },
      },
    ],
    typicalCadences: [
      { kind: "phrygian", label: { uk: "♭II–I на мажорній тоніці", en: "♭II–I onto a major tonic" } },
    ],
    typicalHarmony: [
      { roman: "I–♭II", label: { uk: "мажорна тоніка з двома збільшеними секундами", en: "major tonic with two augmented seconds" } },
    ],
    canonicalExamples: [
      {
        title: "Misirlou",
        source: { uk: "східносередземноморська традиція", en: "Eastern Mediterranean tradition" },
        note: { uk: "дві збільшені секунди — підпис ладу", en: "two augmented seconds are the hallmark" },
      },
      {
        title: "Hijaz Kar",
        source: { uk: "турецький/арабський макам (12-TET наближення)", en: "Turkish/Arabic maqam (12-TET approximation)" },
        note: { uk: "у рівномірному строї збігається з подвійним гармонічним", en: "in equal temperament it coincides with the double harmonic" },
      },
    ],
    context: {
      emotional: { uk: "урочиста екзотика, давнина", en: "solemn exoticism, antiquity" },
      geographic: { uk: "Балкани, Близький Схід, Візантія, метал", en: "the Balkans, the Middle East, Byzantium, metal" },
      historical: { uk: "симетрична гама з двома збільшеними секундами", en: "a symmetric scale with two augmented seconds" },
    },
    family: "balkan",
  },

  // ─────────────────────── ЯПОНСЬКІ ───────────────────────
  {
    id: "hirajoshi",
    names: { uk: "Хіраджоші", en: "Hirajoshi" },
    aliases: [],
    formula: [0, 2, 3, 7, 8],
    characteristicDegrees: [
      {
        degree: 3,
        label: { uk: "♭3 і ♭6 — два півтони створюють напружений колір кото", en: "♭3 and ♭6 — two semitones give the tense koto colour" },
      },
    ],
    typicalCadences: [
      { kind: "modal", label: { uk: "дрон тоніки, рух навколо опорних тонів", en: "tonic drone, motion around pivot tones" } },
    ],
    typicalHarmony: [
      { roman: "drone", label: { uk: "пентатоніка з півтонами, зазвичай без функційної гармонії", en: "a semitone pentatonic, usually without functional harmony" } },
    ],
    canonicalExamples: [
      {
        title: "Музика для кото",
        source: { uk: "японська традиція", en: "Japanese tradition" },
        note: { uk: "класичний стрій хіраджоші", en: "the classic hirajoshi tuning" },
      },
    ],
    context: {
      emotional: { uk: "споглядальна меланхолія, стриманість", en: "contemplative melancholy, restraint" },
      geographic: { uk: "Японія (кото, сямісен)", en: "Japan (koto, shamisen)" },
      historical: { uk: "пентатоніка з двома півтонами", en: "a pentatonic scale with two semitones" },
    },
    family: "japanese",
  },
  {
    id: "in-sen",
    names: { uk: "Інсен", en: "In sen" },
    aliases: ["Insen"],
    formula: [0, 1, 5, 7, 10],
    characteristicDegrees: [
      {
        degree: 2,
        label: { uk: "♭2 одразу над тонікою — гострий японський колір", en: "♭2 right above the tonic — the sharp Japanese colour" },
      },
    ],
    typicalCadences: [
      { kind: "modal", label: { uk: "навколо тоніки з ♭2 як провідним напруженням", en: "around the tonic with ♭2 as the leading tension" } },
    ],
    typicalHarmony: [
      { roman: "drone", label: { uk: "переважно мелодична, дронова основа", en: "primarily melodic, drone-based" } },
    ],
    canonicalExamples: [
      {
        title: "Музика для сякухаті",
        source: { uk: "японська традиція", en: "Japanese tradition" },
        note: { uk: "інсен як основа багатьох награвань", en: "in sen underlies many pieces" },
      },
    ],
    context: {
      emotional: { uk: "аскетична напруга, тиша між нотами", en: "ascetic tension, the silence between notes" },
      geographic: { uk: "Японія (сякухаті)", en: "Japan (shakuhachi)" },
      historical: { uk: "пентатоніка міського стилю «ін»", en: "a pentatonic of the urban ‘in’ style" },
    },
    family: "japanese",
  },
  {
    id: "yo",
    names: { uk: "Йо", en: "Yo" },
    aliases: [],
    formula: [0, 2, 5, 7, 9],
    characteristicDegrees: [
      {
        degree: 1,
        label: { uk: "без півтонів — світліша за «ін», ближча до мажору", en: "no semitones — brighter than ‘in’, closer to major" },
      },
    ],
    typicalCadences: [
      { kind: "modal", label: { uk: "відкриті кварто-квінтові опори", en: "open quartal-quintal support" } },
    ],
    typicalHarmony: [
      { roman: "drone", label: { uk: "ангемітонна пентатоніка, зазвичай без гармонії", en: "an anhemitonic pentatonic, usually without harmony" } },
    ],
    canonicalExamples: [
      {
        title: "Народні та гагаку наспіви",
        source: { uk: "японська традиція", en: "Japanese tradition" },
        note: { uk: "світла безпівтонова пентатоніка", en: "the bright semitone-free pentatonic" },
      },
    ],
    context: {
      emotional: { uk: "ясність, відкритість, народна простота", en: "clarity, openness, folk simplicity" },
      geographic: { uk: "Японія (народна музика, гагаку)", en: "Japan (folk music, gagaku)" },
      historical: { uk: "«світлий» аналог ладу «ін»", en: "the ‘bright’ counterpart of the ‘in’ mode" },
    },
    family: "japanese",
  },

  // ─────────────────────── BEBOP ───────────────────────
  {
    id: "bebop-dominant",
    names: { uk: "Бібоп домінантовий", en: "Bebop dominant" },
    aliases: [],
    formula: [0, 2, 4, 5, 7, 9, 10, 11],
    characteristicDegrees: [
      {
        degree: 8,
        label: {
          uk: "♮7 як хроматичний прохідний між ♭7 і октавою — вирівнює акорд по долях",
          en: "♮7 as a chromatic passing tone between ♭7 and the octave — aligns chord tones to the beat",
        },
      },
    ],
    typicalCadences: [
      { kind: "modal", label: { uk: "над V7 у швидкому свінгу", en: "over a V7 in fast swing" } },
    ],
    typicalHarmony: [
      { roman: "V7", label: { uk: "домінанта з хроматичним прохідним тоном", en: "dominant with a chromatic passing tone" } },
    ],
    canonicalExamples: [
      {
        title: "теми Чарлі Паркера",
        source: { uk: "Charlie Parker", en: "Charlie Parker" },
        note: { uk: "8-нотна гама вирівнює акордові тони по сильних долях", en: "the 8-note scale places chord tones on strong beats" },
      },
    ],
    context: {
      emotional: { uk: "стрімкий драйв, віртуозність", en: "headlong drive, virtuosity" },
      geographic: { uk: "бібоп і свінг", en: "bebop and swing" },
      historical: { uk: "міксолідійський + хроматичний прохідний ♮7", en: "Mixolydian + a chromatic passing ♮7" },
    },
    family: "bebop",
  },

  // ─────────────────────── СИНТЕТИЧНІ ───────────────────────
  {
    id: "enigmatic",
    names: { uk: "Енігматична гама", en: "Enigmatic scale" },
    aliases: ["scala enigmatica"],
    formula: [0, 1, 4, 6, 8, 10, 11],
    characteristicDegrees: [
      {
        degree: 1,
        label: {
          uk: "♭2 знизу + цілотонна середина + ♮7 зверху — суперечливий «загадковий» колір",
          en: "♭2 below + a whole-tone middle + ♮7 above — a contradictory ‘enigmatic’ colour",
        },
      },
    ],
    typicalCadences: [
      { kind: "none", label: { uk: "функційно невизначена", en: "functionally ambiguous" } },
    ],
    typicalHarmony: [
      { roman: "—", label: { uk: "нестандартна; збільшені й цілотонні співзвуччя", en: "non-standard; augmented and whole-tone sonorities" } },
    ],
    canonicalExamples: [
      {
        title: "Ave Maria (scala enigmatica)",
        source: { uk: "Джузеппе Верді", en: "Giuseppe Verdi" },
        year: 1889,
        note: { uk: "Верді гармонізував цю штучну гаму як експеримент", en: "Verdi harmonized this artificial scale as an experiment" },
      },
    ],
    context: {
      emotional: { uk: "загадковість, штучна напруга", en: "enigma, artificial tension" },
      geographic: { uk: "пізньоромантичний експеримент, прог", en: "a late-Romantic experiment, prog" },
      historical: { uk: "сконструйована Верді в 1888 як «загадка»", en: "constructed by Verdi in 1888 as a ‘puzzle’" },
    },
    family: "synthetic",
  },
];

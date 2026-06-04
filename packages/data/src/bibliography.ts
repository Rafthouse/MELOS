/**
 * Reference Library MELOS (ТЗ M10, §10).
 *
 * Записи, на які посилаються Finding.citationIds з core-analysis, + ключові
 * джерела курикулуму. Валідуються Zod у index.ts (parse-on-load).
 *
 * ВАЖЛИВО: кожен citationId, що його видає core-analysis, мусить мати тут запис
 * (інваріант перевіряється тестом у @melos/core-pedagogy).
 */
export const rawBibliography: unknown[] = [
  // ── Джерела, на які посилається core-analysis ──
  {
    id: "huron-2006",
    type: "book",
    authors: ["David Huron"],
    year: 2006,
    title: "Sweet Anticipation: Music and the Psychology of Expectation",
    container: "MIT Press",
    note: {
      uk: "ITPRA-модель очікувань; статистика мелодичного руху (норма крокового руху, тяжіння вступних тонів).",
      en: "The ITPRA model of expectation; statistics of melodic motion (stepwise norm, tendency-tone gravity).",
    },
  },
  {
    id: "savage-2015",
    type: "article",
    authors: ["Patrick E. Savage", "Steven Brown", "Emi Sakai", "Thomas E. Currie"],
    year: 2015,
    title: "Statistical universals reveal the structures and functions of human music",
    container: "PNAS 112(29)",
    note: {
      uk: "Крос-культурний аналіз 304 пісень; контурні й ритмічні універсалії (arch-контур, спадний рух).",
      en: "Cross-cultural analysis of 304 songs; contour and rhythmic universals (arch contour, descending motion).",
    },
  },
  {
    id: "morris-1993",
    type: "article",
    authors: ["Robert D. Morris"],
    year: 1993,
    title: "New Directions in the Theory and Analysis of Musical Contour",
    container: "Music Theory Spectrum 15(2)",
    note: {
      uk: "Формальна теорія контуру (c-space, contour segments) — основа класифікації форми мелодії.",
      en: "Formal contour theory (c-space, contour segments) — the basis for melodic shape classification.",
    },
  },
  {
    id: "narmour-1990",
    type: "book",
    authors: ["Eugene Narmour"],
    year: 1990,
    title: "The Analysis and Cognition of Basic Melodic Structures: The Implication-Realization Model",
    container: "University of Chicago Press",
    note: {
      uk: "Модель I-R: як слухач передбачає наступну ноту; правило gap-fill (компенсація стрибка кроком).",
      en: "The I-R model: how listeners predict the next note; the gap-fill rule (a leap balanced by a step).",
    },
  },
  {
    id: "meyer-1956",
    type: "book",
    authors: ["Leonard B. Meyer"],
    year: 1956,
    title: "Emotion and Meaning in Music",
    container: "University of Chicago Press",
    note: {
      uk: "Порушення очікувань як джерело музичного афекту — теоретична основа gap-fill і напруги.",
      en: "Violation of expectation as the source of musical affect — the theoretical root of gap-fill and tension.",
    },
  },
  {
    id: "bartok-golden-section",
    type: "book",
    authors: ["Ernő Lendvai"],
    year: 1971,
    title: "Béla Bartók: An Analysis of His Music",
    container: "Kahn & Averill",
    note: {
      uk: "Аналіз застосування золотого перетину (0.618) Бартоком — розміщення кульмінації.",
      en: "Analysis of Bartók’s use of the golden section (0.618) — placement of the climax.",
    },
  },
  {
    id: "longuet-higgins-lee-1984",
    type: "article",
    authors: ["H. Christopher Longuet-Higgins", "Christopher S. Lee"],
    year: 1984,
    title: "The Rhythmic Interpretation of Monophonic Music",
    container: "Music Perception 1(4)",
    note: {
      uk: "Формальний алгоритм метричної ваги й обчислення індексу синкопованості.",
      en: "A formal algorithm for metric weight and computing the syncopation index.",
    },
  },
  {
    id: "vuust-2014",
    type: "article",
    authors: ["Maria A. G. Witek", "Eric F. Clarke", "Mads Wallentin", "Morten L. Kringelbach", "Peter Vuust"],
    year: 2014,
    title: "Syncopation, Body-Movement and Pleasure in Groove Music",
    container: "PLoS ONE 9(4)",
    note: {
      uk: "«Goldilocks»-зона: помірна синкопованість максимізує бажання рухатися (грув).",
      en: "The ‘Goldilocks’ zone: moderate syncopation maximizes the urge to move (groove).",
    },
  },

  // ── Earworms / пам'ять / форма (ТЗ §1, §10) ──
  {
    id: "jakubowski-2017",
    type: "article",
    authors: ["Kelly Jakubowski", "Sebastian Finkel", "Lauren Stewart", "Daniel Müllensiefen"],
    year: 2017,
    title: "Dissecting an Earworm: Melodic Features and Song Popularity Predict Involuntary Musical Imagery",
    container: "Psychology of Aesthetics, Creativity, and the Arts 11(2)",
    note: {
      uk: "Мелодичні маркери earworm-ів: помірний темп, arch-контур, повторювані ритмфігури.",
      en: "Melodic markers of earworms: moderate tempo, arch contour, recurring rhythmic figures.",
    },
  },
  {
    id: "margulis-2014",
    type: "book",
    authors: ["Elizabeth Hellmuth Margulis"],
    year: 2014,
    title: "On Repeat: How Music Plays the Mind",
    container: "Oxford University Press",
    note: {
      uk: "Феноменологія повторення в музиці.",
      en: "The phenomenology of repetition in music.",
    },
  },
  {
    id: "snyder-2000",
    type: "book",
    authors: ["Bob Snyder"],
    year: 2000,
    title: "Music and Memory: An Introduction",
    container: "MIT Press",
    note: {
      uk: "Chunking і обмеження робочої пам'яті (4±1 нот) — критичне для довжини мотиву.",
      en: "Chunking and working-memory limits (4±1 notes) — critical for motif length.",
    },
  },
  {
    id: "lerdahl-jackendoff-1983",
    type: "book",
    authors: ["Fred Lerdahl", "Ray Jackendoff"],
    year: 1983,
    title: "A Generative Theory of Tonal Music",
    container: "MIT Press",
    note: {
      uk: "Grouping structure, metrical structure, time-span reduction.",
      en: "Grouping structure, metrical structure, time-span reduction.",
    },
  },

  // ── Композиція / форма / гармонія (ТЗ §10) ──
  {
    id: "schoenberg-fundamentals",
    type: "book",
    authors: ["Arnold Schoenberg"],
    year: 1967,
    title: "Fundamentals of Musical Composition",
    container: "Faber & Faber",
    note: {
      uk: "Мотив як найменша осмислена одиниця; техніки розвитку, liquidation.",
      en: "The motif as the smallest meaningful unit; developing techniques, liquidation.",
    },
  },
  {
    id: "caplin-1998",
    type: "book",
    authors: ["William E. Caplin"],
    year: 1998,
    title: "Classical Form: A Theory of Formal Functions",
    container: "Oxford University Press",
    note: {
      uk: "Sentence/period, презентація-продовження-каденція — структура класичної фрази.",
      en: "Sentence/period, presentation-continuation-cadence — the structure of the classical phrase.",
    },
  },
  {
    id: "tymoczko-2011",
    type: "book",
    authors: ["Dmitri Tymoczko"],
    year: 2011,
    title: "A Geometry of Music",
    container: "Oxford University Press",
    note: {
      uk: "Голосоведіння в геометричних просторах; неорімановські перетворення.",
      en: "Voice leading in geometric spaces; Neo-Riemannian transformations.",
    },
  },
  {
    id: "fux-1725",
    type: "book",
    authors: ["Johann Joseph Fux"],
    year: 1725,
    title: "Gradus ad Parnassum",
    note: {
      uk: "Контрапункт 1–5 видів — канонічна основа поліфонії.",
      en: "Species counterpoint (1–5) — the canonical foundation of polyphony.",
    },
  },
  {
    id: "levitin-2006",
    type: "book",
    authors: ["Daniel J. Levitin"],
    year: 2006,
    title: "This Is Your Brain on Music",
    container: "Dutton",
    note: {
      uk: "Нейрокогнітивні основи музичного сприйняття для широкої аудиторії.",
      en: "The neurocognitive basis of music perception for a general audience.",
    },
  },

  // ── Естетика / складність ──
  {
    id: "berlyne-1971",
    type: "book",
    authors: ["Daniel E. Berlyne"],
    year: 1971,
    title: "Aesthetics and Psychobiology",
    container: "Appleton-Century-Crofts",
    note: {
      uk: "Перевернута-U: естетична насолода максимальна за помірної складності/новизни.",
      en: "The inverted-U: aesthetic pleasure peaks at moderate complexity/novelty.",
    },
  },

  // ── Гармонія / голосоведіння ──
  {
    id: "aldwell-schachter",
    type: "book",
    authors: ["Edward Aldwell", "Carl Schachter"],
    year: 2003,
    title: "Harmony and Voice Leading",
    container: "Thomson/Schirmer",
    note: {
      uk: "Функційна гармонія (T–S–D) і голосоведіння — стандартний курс.",
      en: "Functional harmony (T–S–D) and voice leading — the standard course.",
    },
  },
  {
    id: "tagg-2014",
    type: "book",
    authors: ["Philip Tagg"],
    year: 2014,
    title: "Everyday Tonality II",
    container: "Mass Media Music Scholars' Press",
    note: {
      uk: "Гармонія популярної музики: вісь, модальні петлі, не-класична тональність.",
      en: "Harmony of popular music: the axis, modal loops, non-classical tonality.",
    },
  },

  // ── Українські джерела (ТЗ §10) ──
  {
    id: "kyianovska-ukr-culture",
    type: "book",
    authors: ["Любов Кияновська"],
    year: 2009,
    title: "Українська музична культура",
    note: {
      uk: "Огляд української музичної культури — контекст для модального матеріалу.",
      en: "A survey of Ukrainian musical culture — context for the modal material.",
    },
    ukrainianSource: true,
  },
  {
    id: "lisetskyi-ukr-lit",
    type: "book",
    authors: ["Степан Лісецький"],
    year: 1991,
    title: "Українська музична література",
    note: {
      uk: "Українська музична література — джерело канонічних прикладів.",
      en: "Ukrainian music literature — a source of canonical examples.",
    },
    ukrainianSource: true,
  },
  {
    id: "skoryk-lysenko-modes",
    type: "book",
    authors: ["Мирослав Скорик"],
    year: 1968,
    title: "Лади М. Лисенка",
    titleUk: "Лади М. Лисенка",
    note: {
      uk: "Аналіз українського модального матеріалу (гуцульський, український дорійський).",
      en: "Analysis of Ukrainian modal material (Hutsul, Ukrainian Dorian).",
    },
    ukrainianSource: true,
  },
];

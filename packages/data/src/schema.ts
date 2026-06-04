import { z } from "zod";

/**
 * Схеми даних MELOS (рішення D6 з docs/ARCHITECTURE.md):
 * музичні дані — єдине джерело істини, типізоване й валідоване Zod на білді.
 * Ці типи — спина для M2 (Mode Explorer), M3, M5, M7, M8, M10.
 */

/** Двомовний рядок. Уся доменна мова — uk/en (ТЗ §5: uk/en). */
export const Localized = z.object({
  uk: z.string().min(1),
  en: z.string().min(1),
});
export type Localized = z.infer<typeof Localized>;

/**
 * Сімейство ладу. Покриває весь Level 6 ТЗ.
 * `ukrainian` свідомо окреме сімейство, хоч гуцульський = phrygian dominant:
 * для користувача-українця культурна рамка важливіша за теоретичну похідність.
 */
export const ModeFamily = z.enum([
  "church", // натуральні церковні: ionian…locrian
  "melodic-minor-modes", // мел./гарм. мінор та їхні лади
  "symmetric", // octatonic, whole-tone
  "messiaen", // 7 ладів обмеженого транспонування
  "ukrainian", // гуцульський, укр.-дорійський, обертональні
  "balkan", // Hijaz Kar, Niavent
  "raga",
  "maqam",
  "japanese",
  "pentatonic",
  "blues",
  "bebop",
  "synthetic", // enigmatic, prometheus, Tcherepnin
]);
export type ModeFamily = z.infer<typeof ModeFamily>;

/** Тип каденції (Level 3 ТЗ). `modal` — без провідного тону/домінанти. */
export const CadenceKind = z.enum([
  "PAC", // perfect authentic
  "IAC", // imperfect authentic
  "HC", // half
  "deceptive", // V–vi
  "plagal", // IV–I
  "phrygian", // ♭II–i / IV6–V у мінорі
  "modal", // характеристичний модальний зворот без домінанти
  "none", // лад функційно не каденціює (whole-tone, locrian тощо)
]);
export type CadenceKind = z.infer<typeof CadenceKind>;

/**
 * Характеристичний ступінь — той, що дає ладу «колір».
 * `degree` — 1-based позиція у власній гамі ладу (а не семітон).
 * UI зіставляє degree → реальну висоту через `formula`.
 */
export const CharacteristicDegree = z.object({
  degree: z.number().int().min(1),
  label: Localized, // напр. «♮6 — світла нота в мінорному ладу»
});
export type CharacteristicDegree = z.infer<typeof CharacteristicDegree>;

/** Типовий гармонічний зворот. `roman` — римська цифровка від тоніки ладу. */
export const HarmonyHint = z.object({
  roman: z.string().min(1), // напр. "i–♭VII–IV"
  label: Localized,
  /** Майбутнє посилання на ProgressionDefinition (M7/M8). Поки опційне. */
  ref: z.string().optional(),
});
export type HarmonyHint = z.infer<typeof HarmonyHint>;

export const CadenceHint = z.object({
  kind: CadenceKind,
  label: Localized,
  ref: z.string().optional(),
});
export type CadenceHint = z.infer<typeof CadenceHint>;

/**
 * Канонічний приклад. Зберігаємо ПОСИЛАННЯ і опис, не аудіо
 * (ризик ліцензій — ТЗ §9). Точні номери тактів навмисно не вигадуємо.
 */
export const CanonicalExample = z.object({
  title: z.string().min(1),
  source: Localized, // композитор / традиція / жанр
  year: z.number().int().optional(),
  note: Localized, // що саме ілюструє цей приклад
  link: z.string().url().optional(), // slow-listening / запис
});
export type CanonicalExample = z.infer<typeof CanonicalExample>;

export const ModeContext = z.object({
  emotional: Localized,
  geographic: Localized,
  historical: Localized,
});
export type ModeContext = z.infer<typeof ModeContext>;

/**
 * Визначення ладу — центральна одиниця Mode Explorer (M2).
 * `formula` — кумулятивні семітони від тоніки, ПЕРШИЙ елемент завжди 0,
 * октава (12) НЕ входить. Напр. Dorian = [0,2,3,5,7,9,10].
 */
export const ModeDefinition = z
  .object({
    id: z
      .string()
      .regex(/^[a-z][a-z0-9-]*$/, "id має бути kebab-case"),
    names: Localized,
    aliases: z.array(z.string()).default([]),
    formula: z
      .array(z.number().int().min(0).max(11))
      .min(2, "лад має містити принаймні 2 ноти"),
    /** Похідність: напр. Dorian = 2-й ступінь Ionian. */
    parent: z
      .object({ scaleId: z.string(), degree: z.number().int().min(1) })
      .optional(),
    characteristicDegrees: z.array(CharacteristicDegree).default([]),
    typicalCadences: z.array(CadenceHint).default([]),
    typicalHarmony: z.array(HarmonyHint).default([]),
    canonicalExamples: z.array(CanonicalExample).default([]),
    context: ModeContext,
    family: ModeFamily,
    /** true для макам/раг із мікротональними ступенями. */
    microtonal: z.boolean().default(false),
  })
  .superRefine((mode, ctx) => {
    // formula[0] мусить бути 0 (відлік від тоніки)
    if (mode.formula[0] !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["formula", 0],
        message: "formula має починатися з 0 (тоніка)",
      });
    }
    // строго зростаюча, без дублів
    for (let i = 1; i < mode.formula.length; i++) {
      if (mode.formula[i]! <= mode.formula[i - 1]!) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["formula", i],
          message: "formula має строго зростати в межах октави",
        });
      }
    }
    // характеристичні ступені — у межах кардинальності гами
    for (const [i, cd] of mode.characteristicDegrees.entries()) {
      if (cd.degree > mode.formula.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["characteristicDegrees", i, "degree"],
          message: `degree ${cd.degree} перевищує кількість ступенів (${mode.formula.length})`,
        });
      }
    }
  });
export type ModeDefinition = z.infer<typeof ModeDefinition>;

// ─────────────────────────── БІБЛІОГРАФІЯ (M10) ───────────────────────────

export const SourceType = z.enum(["book", "article", "chapter", "thesis"]);
export type SourceType = z.infer<typeof SourceType>;

/**
 * Запис Reference Library (ТЗ M10).
 * citationIds, що їх видає core-analysis, мусять резолвитись у ці записи —
 * інакше порушується принцип «клік → конкретне джерело» (ТЗ §5).
 */
export const BibliographyEntry = z.object({
  /** ID, на який посилаються Finding.citationIds (напр. "huron-2006"). */
  id: z.string().regex(/^[a-z][a-z0-9-]*$/, "id має бути kebab-case"),
  type: SourceType,
  authors: z.array(z.string()).min(1),
  year: z.number().int(),
  /** Назва мовою оригіналу. */
  title: z.string().min(1),
  /** Опційний український переклад назви. */
  titleUk: z.string().optional(),
  /** Журнал (для статей) або видавництво (для книг). */
  container: z.string().optional(),
  /** Чому це джерело важливе / що покриває. */
  note: Localized,
  url: z.string().url().optional(),
  /** Українськомовне джерело (для фільтра/розділу бібліотеки). */
  ukrainianSource: z.boolean().default(false),
});
export type BibliographyEntry = z.infer<typeof BibliographyEntry>;

// ─────────────────────────── РИТМІЧНІ CELLS (M5) ───────────────────────────

/**
 * Ритмічна фігура для Rhythm Designer (ТЗ M5, Level 5).
 * `steps` — патерн на 1 такт: 0=пауза, 1=удар, 2=акцент.
 */
export const RhythmicCell = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  names: Localized,
  /** Жанр/географія (clave → Куба тощо). */
  region: Localized,
  /** Патерн кроків (0/1/2). Довжина = beatsPerBar * sub. */
  steps: z.array(z.number().int().min(0).max(2)),
  /** Підрозділів на долю (4 = шістнадцяті). */
  sub: z.number().int().min(1),
  beatsPerBar: z.number().int().min(1),
  note: Localized,
});
export type RhythmicCell = z.infer<typeof RhythmicCell>;

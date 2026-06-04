/**
 * Finding — контракт між шаром аналізу і педагогікою.
 *
 * Кожен алгоритм видає не «голе число», а Finding: машинний `kind` + параметри
 * + двомовне повідомлення + ОБОВ'ЯЗКОВІ цитати (citationIds).
 *
 * Принцип ТЗ §7: жодного твердження без джерела. Інваріант перевіряється тестом.
 * Пізніше core-pedagogy зможе перевизначати message за kind+params, але вже зараз
 * аналіз дає придатний дефолтний текст.
 */

export type Severity = "info" | "suggestion" | "warning";

export type FindingKind =
  | "contour"
  | "gap-fill-unresolved"
  | "climax-position"
  | "climax-missing"
  | "stepwise-ratio"
  | "range"
  | "leading-tone-unresolved"
  | "syncopation"
  | "repetition"
  | "cliche"
  | "predictability"
  | "earworm";

export interface Localized {
  readonly uk: string;
  readonly en: string;
}

export interface Finding {
  readonly kind: FindingKind;
  readonly severity: Severity;
  /** Двомовний дефолтний текст (педагогіка може перевизначити). */
  readonly message: Localized;
  /** Локація у мелодії (індекси нот), якщо застосовно. */
  readonly location?: { startIndex: number; endIndex?: number };
  /** Числові/строкові параметри для UI і перевизначення тексту. */
  readonly params?: Readonly<Record<string, number | string>>;
  /** ID джерел у Reference Library. НЕ порожній — інваріант. */
  readonly citationIds: readonly string[];
}

/**
 * Створити Finding із перевіркою інваріанту «є хоча б одна цитата».
 * Кидає в dev, якщо citationIds порожній — захист від порушення принципу ТЗ §7.
 */
export function makeFinding(f: Finding): Finding {
  if (f.citationIds.length === 0) {
    throw new Error(
      `MELOS: Finding "${f.kind}" без citationIds — порушення принципу «кожне твердження з джерелом» (ТЗ §7).`,
    );
  }
  return f;
}

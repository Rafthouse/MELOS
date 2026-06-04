import type { Finding } from "@melos/core-analysis";
import { getCitation, type BibliographyEntry } from "@melos/data";

/**
 * ExplainedFinding — Finding із резолвленими джерелами.
 *
 * Це те, що споживає UI: кожна порада має не лише ID цитат, а самі записи
 * Reference Library (автор, рік, назва), щоб реалізувати «клік → джерело» (ТЗ §5).
 */
export interface ExplainedFinding extends Finding {
  /** Резолвлені записи бібліографії. */
  readonly citations: readonly BibliographyEntry[];
  /** ID, які НЕ знайшлися в бібліографії (мусить бути порожнім). */
  readonly unresolved: readonly string[];
}

/**
 * Резолвити цитати одного Finding у записи бібліографії.
 */
export function explainFinding(finding: Finding): ExplainedFinding {
  const citations: BibliographyEntry[] = [];
  const unresolved: string[] = [];

  for (const id of finding.citationIds) {
    const entry = getCitation(id);
    if (entry) citations.push(entry);
    else unresolved.push(id);
  }

  return { ...finding, citations, unresolved };
}

/** Резолвити цитати масиву Finding. */
export function explainAll(findings: readonly Finding[]): ExplainedFinding[] {
  return findings.map(explainFinding);
}

/**
 * Зібрати всі унікальні citationId, що не резолвляться, з набору Finding.
 * Якщо непорожнє — десь у core-analysis є «висяча» цитата без запису в M10.
 */
export function collectUnresolved(findings: readonly Finding[]): string[] {
  const set = new Set<string>();
  for (const f of explainAll(findings)) {
    for (const id of f.unresolved) set.add(id);
  }
  return [...set];
}

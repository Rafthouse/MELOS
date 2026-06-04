import { z } from "zod";
import { ModeDefinition, BibliographyEntry, RhythmicCell, type ModeFamily } from "./schema";
import { rawModes } from "./modes";
import { rawBibliography } from "./bibliography";
import { rawRhythmicCells } from "./rhythmic-cells";

export * from "./schema";

/**
 * Parse-on-load (рішення D6): дані валідуються Zod-схемою при імпорті модуля,
 * тож superRefine-перевірки (formula[0]===0, строге зростання, межі ступенів)
 * і будь-яка зламана партія ладів падають одразу, а не глибоко в UI.
 */
function loadModes(): ModeDefinition[] {
  const parsed = z.array(ModeDefinition).safeParse(rawModes);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  • [${i.path.join(".")}] ${i.message}`)
      .join("\n");
    throw new Error(`MELOS data: невалідні визначення ладів:\n${issues}`);
  }
  const modes = parsed.data;

  // інваріант: id унікальні
  const ids = new Set<string>();
  for (const m of modes) {
    if (ids.has(m.id)) {
      throw new Error(`MELOS data: дубльований id ладу "${m.id}"`);
    }
    ids.add(m.id);
  }
  return modes;
}

export const MODES: readonly ModeDefinition[] = Object.freeze(loadModes());

const BY_ID = new Map(MODES.map((m) => [m.id, m]));

/** Лад за id або undefined. */
export function getMode(id: string): ModeDefinition | undefined {
  return BY_ID.get(id);
}

/** Усі лади заданого сімейства (Level 6 ТЗ). */
export function modesByFamily(family: ModeFamily): ModeDefinition[] {
  return MODES.filter((m) => m.family === family);
}

/** Кількість ступенів у ладу (кардинальність). */
export function cardinality(mode: ModeDefinition): number {
  return mode.formula.length;
}

// ─────────────────────────── БІБЛІОГРАФІЯ ───────────────────────────

function loadBibliography(): BibliographyEntry[] {
  const parsed = z.array(BibliographyEntry).safeParse(rawBibliography);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  • [${i.path.join(".")}] ${i.message}`)
      .join("\n");
    throw new Error(`MELOS data: невалідна бібліографія:\n${issues}`);
  }
  const ids = new Set<string>();
  for (const e of parsed.data) {
    if (ids.has(e.id)) throw new Error(`MELOS data: дубльований id джерела "${e.id}"`);
    ids.add(e.id);
  }
  return parsed.data;
}

export const BIBLIOGRAPHY: readonly BibliographyEntry[] = Object.freeze(loadBibliography());

const BIB_BY_ID = new Map(BIBLIOGRAPHY.map((e) => [e.id, e]));

/** Джерело за citationId або undefined. */
export function getCitation(id: string): BibliographyEntry | undefined {
  return BIB_BY_ID.get(id);
}

/** Усі джерела бібліотеки. */
export function allCitations(): readonly BibliographyEntry[] {
  return BIBLIOGRAPHY;
}

/** Форматувати джерело як короткий рядок: «Author (Year). Title.» */
export function formatCitation(e: BibliographyEntry): string {
  const authors = e.authors.join(", ");
  const container = e.container ? ` ${e.container}.` : "";
  return `${authors} (${e.year}). ${e.title}.${container}`;
}

// ─────────────────────────── РИТМІЧНІ CELLS ───────────────────────────

function loadCells(): RhythmicCell[] {
  const parsed = z.array(RhythmicCell).safeParse(rawRhythmicCells);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  • [${i.path.join(".")}] ${i.message}`).join("\n");
    throw new Error(`MELOS data: невалідні ритмічні cells:\n${issues}`);
  }
  // довжина steps має дорівнювати beatsPerBar*sub
  for (const c of parsed.data) {
    const expected = c.beatsPerBar * c.sub;
    if (c.steps.length !== expected) {
      throw new Error(`MELOS data: cell "${c.id}" має ${c.steps.length} кроків, очікувалось ${expected}`);
    }
  }
  return parsed.data;
}

export const RHYTHMIC_CELLS: readonly RhythmicCell[] = Object.freeze(loadCells());

export function getRhythmicCell(id: string): RhythmicCell | undefined {
  return RHYTHMIC_CELLS.find((c) => c.id === id);
}

/** Експорт у BibTeX (ТЗ M10 — Zotero/BibTeX). */
export function toBibTeX(e: BibliographyEntry): string {
  const entryType = e.type === "article" ? "article" : e.type === "thesis" ? "phdthesis" : "book";
  const author = e.authors.join(" and ");
  const fields: string[] = [
    `  author = {${author}}`,
    `  title = {${e.title}}`,
    `  year = {${e.year}}`,
  ];
  if (e.container) {
    fields.push(e.type === "article" ? `  journal = {${e.container}}` : `  publisher = {${e.container}}`);
  }
  if (e.url) fields.push(`  url = {${e.url}}`);
  return `@${entryType}{${e.id},\n${fields.join(",\n")}\n}`;
}

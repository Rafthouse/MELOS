// data/schema.ts — Zod-валідація серіалізованих полів архетипа (інваріант MELOS: ≥1 цитата).
// Поведінка (events/fit) — код, не дані; тут перевіряється data-підмножина.

import { z } from 'zod';
import type { BassArchetype } from '../types';

const i18n = z.object({ uk: z.string(), en: z.string() });
const fitSpec = z.union([
  z.object({ kind: z.enum(['anticipation', 'fourFloor', 'pocket', 'sparseRoot', 'interlock', 'walking', 'oompah']) }),
  z.object({ fixed: z.number(), note: i18n }),
]);

export const bassArchetypeDataSchema = z.object({
  id: z.string().min(1),
  names: i18n,
  grooveFamilies: z.array(z.string()).min(1),
  meters: z.array(z.string()).min(1),
  grooveLock: z.enum(['lockKick', 'interlock', 'anticipate', 'pedal', 'counterpulse']),
  pitch: z.object({ strategy: z.string(), range: z.tuple([z.number(), z.number()]) }),
  bassDNA: z.tuple([z.number(), z.number(), z.number(), z.number(), z.number(), z.number(), z.number()]),
  fit: fitSpec,
  principles: z.array(z.object({ title: i18n, text: i18n })),
  sources: z.array(z.string()).min(1), // ІНВАРІАНТ: жодного архетипа без цитати
});

export type BassArchetypeData = z.infer<typeof bassArchetypeDataSchema>;

/** Витягти серіалізовану підмножину архетипа (без функцій) для валідації. */
export function archetypeData(a: BassArchetype): BassArchetypeData {
  const { id, names, grooveFamilies, meters, grooveLock, pitch, bassDNA, fit, principles, sources } = a;
  return { id, names, grooveFamilies, meters, grooveLock, pitch, bassDNA, fit, principles, sources };
}

export function validateArchetype(a: BassArchetype): BassArchetypeData {
  return bassArchetypeDataSchema.parse(archetypeData(a));
}

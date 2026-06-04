// data/catalog.ts — повний каталог архетипів (агрегат усіх родин).

import type { BassArchetype } from '../types';
import { tumbaoFamily } from './archetypes';
import { latinFamily } from './families/latin';
import { groove44Families } from './families/groove44';
import { meterFamilies } from './families/meters';

export const CATALOG: BassArchetype[] = [
  ...tumbaoFamily,
  ...latinFamily,
  ...groove44Families,
  ...meterFamilies,
];

export const byId = (id: string): BassArchetype | undefined => CATALOG.find((a) => a.id === id);

// @melos/groove-bass — публічний API модуля Groove-Bass Lab.

export * from './types';
export * from './transport/time';
export * from './harmony/chords';
export * from './analysis/groove-dna';
export * from './analysis/recommend';
export * from './analysis/realize';
export * from './analysis/affinity';
export * from './analysis/fit';
export * from './view/ascii';
export * from './pedagogy/registry';
export { tumbaoFamily } from './data/archetypes';
export { latinFamily } from './data/families/latin';
export { groove44Families } from './data/families/groove44';
export { meterFamilies } from './data/families/meters';
export { CATALOG, byId } from './data/catalog';
export { STYLES } from './data/ggl-styles';
export { bassArchetypeDataSchema, validateArchetype, archetypeData } from './data/schema';
export type { BassArchetypeData } from './data/schema';

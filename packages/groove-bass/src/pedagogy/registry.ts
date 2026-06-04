// pedagogy/registry.ts — Finding → Explanation + бібліографія (інваріант MELOS: кожна порада з цитатою).
// У MELOS це core-pedagogy; тут — локально до промоушну.

import type { I18n } from '../types';

export interface BibEntry { id: string; cite: string; }

export const bibliography: Record<string, BibEntry> = {
  penalosa2009: { id: 'penalosa2009', cite: 'Peñalosa, D. (2009). The Clave Matrix: Afro-Cuban Rhythm. Bembe Books.' },
  mauleon1993: { id: 'mauleon1993', cite: 'Mauleón, R. (1993). Salsa Guidebook for Piano & Ensemble. Sher Music.' },
  lhl1984: { id: 'lhl1984', cite: 'Longuet-Higgins, H. C., & Lee, C. S. (1984). The rhythmic interpretation of monophonic music. Music Perception, 1(4).' },
  vuust2014: { id: 'vuust2014', cite: 'Vuust, P., et al. (2014). Now you hear it: groove, rhythmic complexity and the brain.' },
};

export interface Explanation { text: I18n; citations: string[]; }

export const explanations: Record<string, Explanation> = {
  'bass.claveRoom': {
    text: { uk: 'Офбіти кіка дають простір для анте — типова clave-логіка тумбао.', en: 'Off-beat kicks open the anticipation window — clave logic.' },
    citations: ['penalosa2009', 'mauleon1993'],
  },
  'bass.noRoomToAnticipate': {
    text: { uk: 'Four-on-floor зачиняє вікно анте: бас не має куди передбачати.', en: 'Four-on-floor closes the anticipation window.' },
    citations: ['penalosa2009'],
  },
  'bass.openBeats': {
    text: { uk: 'Вільні від кіка долі дозволяють басу доповнювати, а не дублювати барабани.', en: 'Open beats let the bass complement rather than double the drums.' },
    citations: ['penalosa2009'],
  },
  'bass.outOfFamily': {
    text: { uk: 'Архетип не належить до рідної басової родини цього груву.', en: "Archetype is outside this groove's native bass family." },
    citations: [],
  },
};

export const explain = (kind: string): Explanation | null => explanations[kind] ?? null;
export const cite = (id: string): string | null => bibliography[id]?.cite ?? null;

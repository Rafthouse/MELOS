// data/archetypes.ts — родина Tumbao. У MELOS це data/bass-archetypes/tumbao.
// Архетип = events (вісь A) × pitch (вісь B) + bassDNA + fit + principles + sources.

import type { BassArchetype } from '../types';

export const tumbaoFamily: BassArchetype[] = [
  {
    id: 'tumbao',
    names: { uk: 'Тумбао', en: 'Tumbao' },
    grooveFamilies: ['Afro-Cuban', 'Latin American', 'Salsa and mambo'],
    meters: ['4-4'],
    grooveLock: 'anticipate',
    pitch: { strategy: 'root5oct', range: [28, 52] },
    bassDNA: [5, 4, 7, 4, 4, 3, 6],
    events: ({ bStep }) => [
      { step: Math.round(bStep * 1.5), degree: 'fifth' },
      { step: bStep * 3, degree: 'rootNext', accent: true },
    ],
    fit: { kind: 'anticipation' },
    principles: [
      { title: { uk: 'Понче передбачає долю', en: 'The ponche anticipates' },
        text: { uk: 'Бас грає перед сильною долею (анте), а не на ній — звідси тяга.', en: 'The bass plays before the strong beat, not on it.' } },
    ],
    sources: ['Peñalosa, The Clave Matrix (2009)', 'Mauleón, Salsa Guidebook (1993)'],
  },
  {
    id: 'son.montuno',
    names: { uk: 'Сон-монтуно', en: 'Son montuno' },
    grooveFamilies: ['Afro-Cuban', 'Latin American'],
    meters: ['4-4'],
    grooveLock: 'anticipate',
    pitch: { strategy: 'root5', range: [28, 52] },
    bassDNA: [6, 3, 6, 4, 3, 4, 6],
    events: ({ bStep }) => [
      { step: 0, degree: 'root' },
      { step: Math.round(bStep * 1.5), degree: 'fifth' },
      { step: bStep * 3, degree: 'rootNext', accent: true },
    ],
    fit: { kind: 'anticipation' },
    principles: [
      { title: { uk: 'Корінь-важче', en: 'Root-heavier' },
        text: { uk: 'Додає корінь на «1» — стабільніша опора під монтуно.', en: 'Adds the root on beat 1.' } },
    ],
    sources: ['Peñalosa, The Clave Matrix (2009)'],
  },
  {
    id: 'salsa.modern',
    names: { uk: 'Сучасна сальса', en: 'Modern salsa' },
    grooveFamilies: ['Salsa and mambo', 'Afro-Cuban'],
    meters: ['4-4'],
    grooveLock: 'interlock',
    pitch: { strategy: 'root5oct+approach', range: [28, 52] },
    bassDNA: [4, 5, 7, 5, 4, 3, 5],
    events: ({ bStep, spb }) => [
      { step: Math.round(bStep * 1.5), degree: 'fifth' },
      { step: bStep * 3, degree: 'rootNext', accent: true },
      { step: spb - 1, degree: 'approachNext' },
    ],
    fit: { kind: 'anticipation' },
    principles: [
      { title: { uk: 'Прохідний підхід', en: 'Approach note' },
        text: { uk: 'Хроматичний підхід до кореня наступної секції.', en: 'Chromatic approach to the next root.' } },
    ],
    sources: ['Mauleón, Salsa Guidebook (1993)'],
  },
  {
    id: 'timba',
    names: { uk: 'Тімба', en: 'Timba' },
    grooveFamilies: ['Afro-Cuban', 'Salsa and mambo'],
    meters: ['4-4'],
    grooveLock: 'interlock',
    pitch: { strategy: 'arpeggio', range: [28, 52] },
    bassDNA: [4, 5, 8, 6, 4, 3, 5],
    events: ({ bStep, spb }) => [
      { step: Math.round(bStep * 0.75), degree: 'root', ghost: true },
      { step: Math.round(bStep * 1.5), degree: 'fifth' },
      { step: Math.round(bStep * 2.75), degree: 'octave' },
      { step: bStep * 3, degree: 'rootNext', accent: true },
      { step: spb - 2, degree: 'approachNext' },
    ],
    fit: { kind: 'anticipation' },
    principles: [
      { title: { uk: 'Синкопа з гепами', en: 'Syncopation with gaps' },
        text: { uk: 'Щільніше й синкопованіше, з ghost-нотами (сучасна Куба).', en: 'Denser, syncopated, with ghosts.' } },
    ],
    sources: ['Mauleón, Salsa Guidebook (1993)'],
  },
];

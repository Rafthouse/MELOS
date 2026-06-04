// data/families/latin.ts — Latin-pop anticipated (bossa, cumbia, dembow). Метр 4/4.

import type { BassArchetype } from '../../types';

export const latinFamily: BassArchetype[] = [
  {
    id: 'bossa.rootfifth', names: { uk: 'Босанова', en: 'Bossa nova' },
    grooveFamilies: ['Latin American', 'Brazil'], meters: ['4-4'], grooveLock: 'pedal',
    pitch: { strategy: 'root5', range: [28, 52] }, bassDNA: [7, 2, 5, 3, 3, 4, 7],
    events: ({ bStep }) => [
      { step: 0, degree: 'root', accent: true },
      { step: Math.round(bStep * 1.5), degree: 'fifth' },
      { step: bStep * 2, degree: 'root' },
      { step: Math.round(bStep * 3.5), degree: 'fifth' },
    ],
    fit: { kind: 'anticipation' },
    principles: [{ title: { uk: 'Дводольний root-fifth', en: 'Two-note root-fifth' }, text: { uk: 'Сурду-похідний малюнок корінь→квінта, з легким нахилом на «і».', en: 'Surdo-derived root→fifth figure leaning on the and.' } }],
    sources: ['McGowan & Pessanha, The Brazilian Sound (1998)'],
  },
  {
    id: 'cumbia.chucu', names: { uk: 'Кумбія', en: 'Cumbia' },
    grooveFamilies: ['Latin American', 'Colombia'], meters: ['4-4'], grooveLock: 'lockKick',
    pitch: { strategy: 'root5', range: [28, 52] }, bassDNA: [6, 3, 5, 4, 3, 5, 6],
    events: ({ bStep }) => [
      { step: 0, degree: 'root' },
      { step: Math.round(bStep * 1.5), degree: 'fifth' },
      { step: bStep * 2, degree: 'root' },
      { step: Math.round(bStep * 3.5), degree: 'fifth' },
    ],
    fit: { kind: 'anticipation' },
    principles: [{ title: { uk: 'Чучу', en: 'Chucu' }, text: { uk: 'Галопний root-fifth, що тягне на «і» — колумбійський lilt.', en: 'Galloping root-fifth pulling on the and.' } }],
    sources: ['Manuel, Caribbean Currents (2006)'],
  },
  {
    id: 'dembow.reggaeton', names: { uk: 'Дембоу', en: 'Dembow' },
    grooveFamilies: ['Caribbean', 'Puerto Rico', 'Latin American'], meters: ['4-4'], grooveLock: 'lockKick',
    pitch: { strategy: 'root', range: [28, 50] }, bassDNA: [7, 2, 6, 4, 2, 6, 6],
    events: ({ bStep }) => [
      { step: 0, degree: 'root', accent: true },
      { step: bStep * 2, degree: 'root' },
    ],
    fit: { kind: 'anticipation' },
    principles: [{ title: { uk: 'Замок дембоу', en: 'Dembow lock' }, text: { uk: 'Анте, що затвердло в замок boom-ch — корінь під дембоу.', en: 'Anticipation hardened into the boom-ch lock.' } }],
    sources: ['W. Marshall, “Dem Bow” genealogy'],
  },
];

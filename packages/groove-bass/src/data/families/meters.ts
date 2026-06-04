// data/families/meters.ts — родини поза 4/4: samba (2/4), oom-pah (2/4), waltz (3/4), aksak (5/8,7/8), compound (6/8).
// Доречність метра гарантує filter по meters; fit здебільшого фіксований (дані).

import type { BassArchetype } from '../../types';

export const meterFamilies: BassArchetype[] = [
  // ---- Samba (2/4) ----
  { id: 'samba.surdo', names: { uk: 'Самба (сурду)', en: 'Samba surdo' }, grooveFamilies: ['Brazil', 'Latin American', 'Samba'], meters: ['2-4'], grooveLock: 'lockKick',
    pitch: { strategy: 'root5', range: [28, 50] }, bassDNA: [8, 2, 4, 4, 2, 7, 7],
    events: ({ bStep }) => [{ step: 0, degree: 'fifth' }, { step: bStep, degree: 'root', accent: true }],
    fit: { fixed: 0.68, note: { uk: 'Бас веде сурду: 2-га доля важча за 1-шу.', en: 'Bass leads the surdo: beat 2 heavier than 1.' } },
    principles: [{ title: { uk: 'Низ веде сурду', en: 'Bass leads the surdo' }, text: { uk: 'Акцент на 2-й долі; рух сурду в басу.', en: 'Accent on beat 2; the surdo motion in the bass.' } }], sources: ['McGowan & Pessanha, The Brazilian Sound (1998)'] },

  // ---- Oom-pah (2/4) ----
  { id: 'march.oompah', names: { uk: 'Марш (oom-pah)', en: 'March oom-pah' }, grooveFamilies: ['Duple meter', 'March'], meters: ['2-4'], grooveLock: 'lockKick',
    pitch: { strategy: 'root5alt', range: [28, 50] }, bassDNA: [9, 2, 1, 4, 3, 8, 8],
    events: ({ bStep }) => [{ step: 0, degree: 'root', accent: true }, { step: bStep, degree: 'fifth' }],
    fit: { kind: 'oompah' }, principles: [{ title: { uk: 'Корінь–квінта', en: 'Root–fifth' }, text: { uk: 'Корінь на «1», квінта на «2» — класичний oom-pah.', en: 'Root on 1, fifth on 2.' } }], sources: ['—'] },
  { id: 'polka.oompah', names: { uk: 'Полька', en: 'Polka' }, grooveFamilies: ['Duple meter', 'Polka'], meters: ['2-4'], grooveLock: 'lockKick',
    pitch: { strategy: 'root5alt', range: [28, 50] }, bassDNA: [9, 2, 2, 4, 3, 8, 7],
    events: ({ bStep }) => [{ step: 0, degree: 'root' }, { step: bStep, degree: 'fifth' }],
    fit: { kind: 'oompah' }, principles: [{ title: { uk: 'Танцювальний oom-pah', en: 'Dance oom-pah' }, text: { uk: 'Рівний корінь–квінта на долях.', en: 'Even root–fifth on the beats.' } }], sources: ['—'] },

  // ---- Waltz (3/4) ----
  { id: 'waltz.classical', names: { uk: 'Класичний вальс', en: 'Classical waltz' }, grooveFamilies: ['Triple meter', 'Classical waltz'], meters: ['3-4'], grooveLock: 'lockKick',
    pitch: { strategy: 'root-then-fifth', range: [28, 52] }, bassDNA: [8, 3, 2, 4, 3, 6, 7],
    events: ({ bStep }) => [{ step: 0, degree: 'root', accent: true }, { step: bStep, degree: 'fifth' }, { step: bStep * 2, degree: 'fifth' }],
    fit: { fixed: 0.66, note: { uk: 'Корінь на «1», квінти на «2» і «3».', en: 'Root on 1, fifths on 2 and 3.' } },
    principles: [{ title: { uk: 'Корінь на «1»', en: 'Root on the 1' }, text: { uk: 'Бас тримає «раз», акорд робить «два-три».', en: 'Bass holds the 1; the chord does 2-3.' } }], sources: ['—'] },
  { id: 'waltz.jazz', names: { uk: 'Джазовий вальс', en: 'Jazz waltz' }, grooveFamilies: ['Triple meter', 'Jazz waltz'], meters: ['3-4'], grooveLock: 'interlock',
    pitch: { strategy: 'arpeggio', range: [28, 54] }, bassDNA: [4, 6, 3, 5, 5, 4, 5],
    events: ({ bStep }) => [{ step: 0, degree: 'root' }, { step: bStep, degree: 'third' }, { step: bStep * 2, degree: 'fifth' }],
    fit: { fixed: 0.64, note: { uk: 'Арпеджо замість бігу — вальсовий джазовий бас.', en: 'Arpeggiation, not walking — jazz waltz bass.' } },
    principles: [{ title: { uk: 'Арпеджо у 3/4', en: 'Arpeggio in 3/4' }, text: { uk: 'Корінь–терція–квінта по долях.', en: 'Root–third–fifth across the beats.' } }], sources: ['Goldsby, The Jazz Bass Book (2002)'] },
  { id: 'waltz.mazurka', names: { uk: 'Мазурка', en: 'Mazurka' }, grooveFamilies: ['Triple meter', 'Mazurka'], meters: ['3-4'], grooveLock: 'lockKick',
    pitch: { strategy: 'root5', range: [28, 52] }, bassDNA: [6, 4, 4, 4, 3, 5, 6],
    events: ({ bStep }) => [{ step: 0, degree: 'root' }, { step: bStep, degree: 'root', accent: true }, { step: bStep * 2, degree: 'fifth' }],
    fit: { fixed: 0.62, note: { uk: 'Акцент зміщено на 2-гу/3-тю долю.', en: 'Accent shifted to beat 2/3.' } },
    principles: [{ title: { uk: 'Зсунутий акцент', en: 'Shifted accent' }, text: { uk: 'Не «раз», а «два» несе вагу.', en: 'Not the 1 but the 2 carries the weight.' } }], sources: ['—'] },

  // ---- Aksak (5/8, 7/8) — бас спелінгує адитивні групи ----
  { id: 'aksak.paidushko', names: { uk: 'Пайдушко 5/8', en: 'Paidushko 5/8' }, grooveFamilies: ['Balkan', 'Aksak', 'Experimental and odd meter'], meters: ['5-8'], grooveLock: 'lockKick',
    pitch: { strategy: 'root5', range: [28, 50] }, bassDNA: [6, 3, 5, 4, 3, 6, 6],
    events: () => [{ step: 0, degree: 'root', accent: true }, { step: 4, degree: 'fifth' }],
    fit: { fixed: 0.7, note: { uk: 'Групування 2+3 — бас на початках груп.', en: 'Grouping 2+3 — bass on group starts.' } },
    principles: [{ title: { uk: '2+3', en: '2+3' }, text: { uk: 'Бас спелінгує дві адитивні групи.', en: 'Bass spells the two additive groups.' } }], sources: ['Brăiloiu, Le rythme aksak (1952)'] },
  { id: 'aksak.rachenitsa', names: { uk: 'Ручениця 7/8', en: 'Rachenitsa 7/8' }, grooveFamilies: ['Balkan', 'Aksak', 'Experimental and odd meter'], meters: ['7-8'], grooveLock: 'lockKick',
    pitch: { strategy: 'root5', range: [28, 50] }, bassDNA: [6, 3, 5, 4, 3, 6, 6],
    events: () => [{ step: 0, degree: 'root', accent: true }, { step: 4, degree: 'fifth' }, { step: 8, degree: 'root' }],
    fit: { fixed: 0.7, note: { uk: 'Групування 2+2+3 — бас на початках груп.', en: 'Grouping 2+2+3 — bass on group starts.' } },
    principles: [{ title: { uk: '2+2+3', en: '2+2+3' }, text: { uk: 'Бас робить непарний метр відчутним.', en: 'Bass makes the odd meter felt.' } }], sources: ['London, Hearing in Time (2004)'] },
  { id: 'aksak.kalamatianos', names: { uk: 'Каламатіанос 7/8', en: 'Kalamatianos 7/8' }, grooveFamilies: ['Balkan', 'Aksak', 'Experimental and odd meter'], meters: ['7-8'], grooveLock: 'lockKick',
    pitch: { strategy: 'root5', range: [28, 50] }, bassDNA: [6, 3, 5, 4, 3, 6, 6],
    events: () => [{ step: 0, degree: 'root', accent: true }, { step: 6, degree: 'fifth' }, { step: 10, degree: 'root' }],
    fit: { fixed: 0.7, note: { uk: 'Групування 3+2+2 — інша орієнтація.', en: 'Grouping 3+2+2 — the other orientation.' } },
    principles: [{ title: { uk: '3+2+2', en: '3+2+2' }, text: { uk: 'Довга група спереду.', en: 'The long group leads.' } }], sources: ['Brăiloiu, Le rythme aksak (1952)'] },

  // ---- Compound root-drone (6/8) ----
  { id: 'compound.jig', names: { uk: 'Джига (дрон)', en: 'Jig drone' }, grooveFamilies: ['Irish jig', 'Celtic', 'Compound'], meters: ['6-8'], grooveLock: 'pedal',
    pitch: { strategy: 'root5-drone', range: [28, 50] }, bassDNA: [8, 3, 3, 3, 3, 6, 7],
    events: ({ bStep }) => [{ step: 0, degree: 'root', accent: true }, { step: bStep * 3, degree: 'fifth' }],
    fit: { fixed: 0.7, note: { uk: 'Складена 6/8 пульсація коренем-квінтою.', en: 'Compound 6/8 pulse with root-fifth.' } },
    principles: [{ title: { uk: 'Пунктирна пульсація', en: 'Dotted pulse' }, text: { uk: 'Рух — це зміна акорду, а не біг по долях. (Пряма паралель до ірландського бузукі.)', en: 'Motion = chord change, not running beats.' } }], sources: ['Williams, Focus: Irish Traditional Music (2009)'] },
  { id: 'compound.tarantella', names: { uk: 'Тарантела', en: 'Tarantella' }, grooveFamilies: ['Tarantella', 'Italian', 'Compound'], meters: ['6-8'], grooveLock: 'lockKick',
    pitch: { strategy: 'root5', range: [28, 50] }, bassDNA: [7, 4, 4, 4, 3, 6, 6],
    events: ({ bStep }) => [{ step: 0, degree: 'root', accent: true }, { step: bStep + 1, degree: 'root', ghost: true }, { step: bStep * 3, degree: 'fifth' }, { step: bStep * 4 + 1, degree: 'fifth', ghost: true }],
    fit: { fixed: 0.66, note: { uk: 'Швидший драйв у 6/8.', en: 'Faster 6/8 drive.' } },
    principles: [{ title: { uk: 'Південноіталійський 6/8', en: 'Southern Italian 6/8' }, text: { uk: 'Швидша компаундна пульсація з підштовхами.', en: 'Faster compound pulse with pushes.' } }], sources: ['—'] },
  { id: 'compound.blues68', names: { uk: 'Блюз 6/8', en: 'Blues 6/8' }, grooveFamilies: ['Blues', 'Compound'], meters: ['6-8'], grooveLock: 'lockKick',
    pitch: { strategy: 'root5+approach', range: [28, 52] }, bassDNA: [6, 4, 4, 5, 4, 5, 6],
    events: ({ bStep }) => [{ step: 0, degree: 'root' }, { step: bStep * 3, degree: 'fifth' }, { step: bStep * 5, degree: 'approachNext' }],
    fit: { fixed: 0.64, note: { uk: 'Повільний блюз 6/8 з підходом.', en: 'Slow 6/8 blues with an approach.' } },
    principles: [{ title: { uk: 'Тріольний low-end', en: 'Triplet low-end' }, text: { uk: 'Корінь-квінта з підходом до наступного акорду.', en: 'Root-fifth with an approach to the next chord.' } }], sources: ['—'] },
  { id: 'compound.bembe', names: { uk: 'Бембе 6/8', en: 'Bembé 6/8' }, grooveFamilies: ['Afro-Cuban', 'Bembe', 'Compound'], meters: ['6-8'], grooveLock: 'interlock',
    pitch: { strategy: 'root5', range: [28, 50] }, bassDNA: [5, 4, 6, 4, 3, 3, 5],
    events: ({ bStep }) => [{ step: 0, degree: 'root' }, { step: bStep * 2, degree: 'fifth' }, { step: bStep * 5, degree: 'root' }],
    fit: { fixed: 0.66, note: { uk: 'Замок на дзвін-патерн (bell) у 6/8.', en: 'Locked to the 6/8 bell pattern.' } },
    principles: [{ title: { uk: 'Замок на дзвін', en: 'Bell lock' }, text: { uk: 'Бас interlock із дзвоном, а не з кіком.', en: 'Bass interlocks with the bell, not the kick.' } }], sources: ['Peñalosa, The Clave Matrix (2009)'] },
];

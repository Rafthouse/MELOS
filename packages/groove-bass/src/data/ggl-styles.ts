// data/ggl-styles.ts — реальні/репрезентативні GGL-патерни (формат seed), мультиметрові.
// bossanova — точний seed із rhythm-packs.js Groove Grammar Lab; решта — репрезентативні.

import type { Groove } from '../types';

export const STYLES: Record<string, Groove> = {
  // ---- 4/4 ----
  bossanova: { name: 'Bossa nova', family: 'Latin American', meter: '4-4', tempo: [120, 140], swing: 8,
    seed: { kick: [0, 6, 8, 14], snare: [], closedHat: [0, 2, 4, 6, 8, 10, 12, 14], rim: [0, 3, 6, 10, 12], shaker: [0, 2, 4, 6, 8, 10, 12, 14] } },
  afrocuban_son: { name: 'Afro-Cuban son', family: 'Afro-Cuban', meter: '4-4', tempo: [90, 100], swing: 0,
    seed: { kick: [0, 6, 8, 14], snare: [], rim: [0, 3, 6, 10, 12], perc: [2, 10] } },
  afrocuban_fourfloor: { name: 'Afro-Cuban (dense kick)', family: 'Afro-Cuban', meter: '4-4', tempo: [120, 128], swing: 0,
    seed: { kick: [0, 4, 8, 12], snare: [4, 12], rim: [0, 3, 6, 10, 12] } },
  funk_jb: { name: 'Funk (JB)', family: 'American funk', meter: '4-4', tempo: [98, 112], swing: 0,
    seed: { kick: [0, 6, 8, 11, 14], snare: [4, 12], closedHat: [0, 2, 4, 6, 8, 10, 12, 14] } },
  reggae_onedrop: { name: 'Reggae one-drop', family: 'Reggae', meter: '4-4', tempo: [70, 82], swing: 0,
    seed: { kick: [8], snare: [8], closedHat: [2, 6, 10, 14], rim: [] } },
  afrobeat: { name: 'Afrobeat', family: 'Afrobeat', meter: '4-4', tempo: [108, 120], swing: 0,
    seed: { kick: [0, 6, 10], snare: [4, 12], closedHat: [0, 2, 4, 6, 8, 10, 12, 14], perc: [3, 7, 11, 15] } },
  techno: { name: 'Berlin techno', family: 'Techno', meter: '4-4', tempo: [128, 134], swing: 0,
    seed: { kick: [0, 4, 8, 12], closedHat: [2, 6, 10, 14], snare: [] } },
  jazz_swing: { name: 'Jazz swing', family: 'Jazz swing', meter: '4-4', tempo: [120, 180], swing: 60,
    seed: { kick: [0, 8], snare: [], rim: [4, 12] } },

  // ---- 2/4 ----
  samba: { name: 'Samba', family: 'Samba', meter: '2-4', tempo: [96, 110], swing: 0,
    seed: { kick: [0, 4], snare: [2, 6], shaker: [0, 1, 2, 3, 4, 5, 6, 7] } },
  march: { name: 'March', family: 'March', meter: '2-4', tempo: [110, 120], swing: 0,
    seed: { kick: [0, 4], snare: [2, 6] } },

  // ---- 3/4 ----
  waltz: { name: 'Classical waltz', family: 'Classical waltz', meter: '3-4', tempo: [140, 170], swing: 0,
    seed: { kick: [0], snare: [4, 8] } },

  // ---- 6/8 ----
  jig: { name: 'Irish jig', family: 'Irish jig', meter: '6-8', tempo: [116, 130], swing: 0,
    seed: { kick: [0, 6], snare: [3, 9], closedHat: [0, 2, 4, 6, 8, 10] } },

  // ---- 7/8 ----
  rachenitsa: { name: 'Rachenitsa 7/8', family: 'Balkan', meter: '7-8', tempo: [120, 150], swing: 0,
    seed: { kick: [0, 4, 8], snare: [4], closedHat: [0, 2, 4, 6, 8, 10, 12] } },
};

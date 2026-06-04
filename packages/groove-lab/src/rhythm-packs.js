/**
 * Groove Grammar Lab — external rhythm expansion pack.
 *
 * Loaded BEFORE app.js. Exposes window.EXTRA_RHYTHMS, which app.js merges into
 * STYLE_LIBRARY via mergeExternalRhythmPacks(). Each entry follows the same
 * shape as the built-in styles, plus `region` and `difficulty`.
 *
 * Seed step indices are 0-based and must stay below the meter's stepsPerBar:
 *   2/4 → 8 · 6/8 → 12 · 7/8 → 14 · 9/8 → 18 · 10/8 → 20 · 4/4 → 16
 *
 * Tracks: kick, snare, closedHat, openHat, rim, tom, perc, shaker.
 */

(function () {
  const EXTRA_RHYTHMS = {
    /* ──────────────── 4/4 (16 steps) ──────────────── */

    bossanova: {
      name: "Bossa nova",
      family: "Latin American",
      meter: "4-4",
      region: "Brazil",
      difficulty: "medium",
      subtitle: "Soft surdo pulse under a steady rim clave, brushed continuity",
      tags: ["clave", "syncopation", "brush", "medium-tempo", "latin"],
      tempo: [120, 140],
      swing: 8,
      seed: {
        kick: [0, 6, 8, 14],
        snare: [],
        closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
        openHat: [],
        rim: [0, 3, 6, 10, 12],
        tom: [],
        perc: [],
        shaker: [0, 2, 4, 6, 8, 10, 12, 14]
      },
      principles: [
        ["Clave spine", "The rim plays the bossa clave, so every other layer can float around it."],
        ["Soft anchors", "Kick marks the surdo motion rather than a hard four-on-the-floor."]
      ]
    },

    cumbia: {
      name: "Cumbia",
      family: "Latin American",
      meter: "4-4",
      region: "Colombia",
      difficulty: "easy",
      subtitle: "Scraper-driven groove with an off-beat percussion lean",
      tags: ["percussion", "off-beat", "dance", "latin", "medium-tempo"],
      tempo: [85, 105],
      swing: 10,
      seed: {
        kick: [0, 8],
        snare: [4, 12],
        closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
        openHat: [],
        rim: [2, 6, 10, 14],
        tom: [],
        perc: [2, 6, 10, 14],
        shaker: [1, 3, 5, 7, 9, 11, 13, 15]
      },
      principles: [
        ["Off-beat pull", "Percussion sits on the 'and' of each beat to create the cumbia lilt."],
        ["Steady scraper", "Continuous shaker keeps the sixteenth grid audible."]
      ]
    },

    reggaeton: {
      name: "Reggaeton dembow",
      family: "Caribbean",
      meter: "4-4",
      region: "Puerto Rico",
      difficulty: "easy",
      subtitle: "The boom-ch-boom-chick dembow with a flat kick floor",
      tags: ["dembow", "backbeat", "dance", "syncopation", "medium-tempo"],
      tempo: [88, 98],
      swing: 0,
      seed: {
        kick: [0, 8],
        snare: [3, 6, 11, 14],
        closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
        openHat: [],
        rim: [3, 6, 11, 14],
        tom: [],
        perc: [],
        shaker: []
      },
      principles: [
        ["Dembow snare", "The snare/rim 3-6-11-14 figure is the genre's defining hook."],
        ["Flat kick", "Kick on 1 and 3 anchors the dembow without competing with it."]
      ]
    },

    soca: {
      name: "Soca",
      family: "Caribbean",
      meter: "4-4",
      region: "Trinidad & Tobago",
      difficulty: "medium",
      subtitle: "Fast four-on-the-floor carnival drive with busy percussion",
      tags: ["four-on-floor", "dance", "carnival", "fast", "percussion"],
      tempo: [125, 160],
      swing: 0,
      seed: {
        kick: [0, 4, 8, 12],
        snare: [4, 12],
        closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
        openHat: [2, 6, 10, 14],
        rim: [],
        tom: [],
        perc: [1, 3, 5, 7, 9, 11, 13, 15],
        shaker: [0, 2, 4, 6, 8, 10, 12, 14]
      },
      principles: [
        ["Engine room", "Four-on-the-floor kick is the carnival propulsion."],
        ["Open-hat lift", "Off-beat open hats give soca its forward energy."]
      ]
    },

    highlife: {
      name: "Highlife",
      family: "West African",
      meter: "4-4",
      region: "Ghana",
      difficulty: "medium",
      subtitle: "Bell-led groove with a relaxed swing and interlocking parts",
      tags: ["bell", "interlocking", "swing", "call-response", "medium-tempo"],
      tempo: [100, 124],
      swing: 16,
      seed: {
        kick: [0, 6, 10],
        snare: [4, 12],
        closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
        openHat: [],
        rim: [0, 2, 3, 6, 8, 10, 11, 14],
        tom: [],
        perc: [2, 5, 8, 11, 14],
        shaker: [1, 3, 5, 7, 9, 11, 13, 15]
      },
      principles: [
        ["Bell timeline", "The rim plays a standard bell pattern that orients all parts."],
        ["Interlock", "Kick and percussion answer the bell from different angles."]
      ]
    },

    gahu: {
      name: "Gahu 4/4 study",
      family: "West African",
      meter: "4-4",
      region: "Ghana (Ewe)",
      difficulty: "advanced",
      subtitle: "Ewe bell timeline with displaced support drums",
      tags: ["bell", "interlocking", "displacement", "study", "polyrhythm"],
      tempo: [108, 132],
      swing: 12,
      seed: {
        kick: [0, 5, 8, 13],
        snare: [4, 12],
        closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
        openHat: [],
        rim: [0, 2, 4, 7, 9, 11, 14],
        tom: [6, 14],
        perc: [3, 7, 11, 15],
        shaker: [1, 5, 9, 13]
      },
      principles: [
        ["Standard bell", "The seven-stroke bell timeline is the structural reference."],
        ["Displaced kick", "Kick strokes deliberately fall between bell strokes."]
      ]
    },

    mbalax: {
      name: "Mbalax study",
      family: "West African",
      meter: "4-4",
      region: "Senegal",
      difficulty: "advanced",
      subtitle: "Sabar-driven density with sharp accent bursts",
      tags: ["sabar", "percussion", "syncopation", "fast", "study"],
      tempo: [112, 140],
      swing: 8,
      seed: {
        kick: [0, 6, 10],
        snare: [4, 7, 12, 15],
        closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
        openHat: [],
        rim: [0, 3, 5, 8, 11, 13],
        tom: [6, 7, 14, 15],
        perc: [1, 3, 5, 7, 9, 11, 13, 15],
        shaker: [0, 4, 8, 12]
      },
      principles: [
        ["Talking drums", "Tom and percussion imitate sabar phrase bursts."],
        ["Accent storms", "Extra snare strokes cluster near phrase ends."]
      ]
    },

    tintal: {
      name: "Tintal 16-beat study",
      family: "Indian classical",
      meter: "4-4",
      region: "India (Hindustani)",
      difficulty: "advanced",
      subtitle: "Teental theka: 16 matras with sam and khali markers",
      tags: ["tala", "cycle", "study", "tabla", "accent"],
      tempo: [80, 120],
      swing: 0,
      seed: {
        kick: [0],
        snare: [],
        closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
        openHat: [],
        rim: [0, 2, 3, 5, 6, 10, 11, 13, 14],
        tom: [8],
        perc: [0, 4, 8, 12],
        shaker: []
      },
      principles: [
        ["Sam and khali", "Beat 1 (sam) is strong; beat 9 (khali) is the open, weak accent."],
        ["Theka", "The rim spells the tabla theka across all sixteen matras."]
      ]
    },

    keherwa: {
      name: "Keherwa 8-beat study",
      family: "Indian classical",
      meter: "4-4",
      region: "India",
      difficulty: "medium",
      subtitle: "Eight-matra cycle laid across the bar as two half-cycles",
      tags: ["tala", "cycle", "study", "tabla", "dance"],
      tempo: [90, 130],
      swing: 6,
      seed: {
        kick: [0, 8],
        snare: [4, 12],
        closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
        openHat: [],
        rim: [0, 3, 4, 8, 11, 12],
        tom: [],
        perc: [2, 6, 10, 14],
        shaker: [1, 3, 5, 7, 9, 11, 13, 15]
      },
      principles: [
        ["Half cycles", "The eight-beat theka repeats twice inside one 4/4 bar."],
        ["Dha-ge-na", "Rim strokes outline the classic Keherwa bols."]
      ]
    },

    amapiano: {
      name: "Amapiano log drum",
      family: "Electronic",
      meter: "4-4",
      region: "South Africa",
      difficulty: "medium",
      subtitle: "Slow shuffle with a syncopated log-drum bass and airy shaker",
      tags: ["log-drum", "shuffle", "house", "syncopation", "slow"],
      tempo: [108, 118],
      swing: 22,
      seed: {
        kick: [0, 4, 8, 12],
        snare: [],
        closedHat: [2, 6, 10, 14],
        openHat: [],
        rim: [4, 12],
        tom: [6, 7, 10, 14],
        perc: [],
        shaker: [3, 7, 11, 15]
      },
      principles: [
        ["Log drum", "The tom voices the signature syncopated log-drum bass figure."],
        ["Shuffled air", "High swing on the off-beats gives amapiano its glide."]
      ]
    },

    ukgarage: {
      name: "UK garage",
      family: "Electronic",
      meter: "4-4",
      region: "United Kingdom",
      difficulty: "advanced",
      subtitle: "Skippy 2-step with heavy swing and shifted snares",
      tags: ["2-step", "swing", "syncopation", "dance", "shuffle"],
      tempo: [128, 138],
      swing: 32,
      seed: {
        kick: [0, 10],
        snare: [4, 12],
        closedHat: [2, 5, 7, 10, 13, 15],
        openHat: [6, 14],
        rim: [],
        tom: [],
        perc: [3, 11],
        shaker: [1, 5, 9, 13]
      },
      principles: [
        ["2-step", "Kick on 1 and the 'and of 3' creates the lurching 2-step feel."],
        ["Heavy swing", "Strong shuffle on the hats is essential to the genre."]
      ]
    },

    footwork: {
      name: "Footwork",
      family: "Electronic",
      meter: "4-4",
      region: "Chicago, USA",
      difficulty: "advanced",
      subtitle: "Very fast, triplet-leaning kicks with sparse claps",
      tags: ["fast", "triplet", "syncopation", "dance", "polyrhythm"],
      tempo: [155, 165],
      swing: 4,
      seed: {
        kick: [0, 3, 6, 10],
        snare: [4, 12],
        closedHat: [0, 4, 8, 12],
        openHat: [],
        rim: [7, 11, 15],
        tom: [],
        perc: [2, 6, 10, 14],
        shaker: []
      },
      principles: [
        ["Kick triplets", "Rapid kick clusters imply 3-against-4 motion at high tempo."],
        ["Sparse top", "Claps and rims stay minimal so the kick patterns lead."]
      ]
    },

    traphalf: {
      name: "Trap halftime",
      family: "Hip-hop",
      meter: "4-4",
      region: "Southern USA",
      difficulty: "medium",
      subtitle: "Halftime snare on beat 3 with rolling hi-hat subdivisions",
      tags: ["halftime", "hi-hat-rolls", "808", "syncopation", "slow"],
      tempo: [130, 150],
      swing: 0,
      seed: {
        kick: [0, 7, 10],
        snare: [8],
        closedHat: [0, 2, 3, 4, 6, 8, 10, 11, 12, 14],
        openHat: [],
        rim: [],
        tom: [],
        perc: [],
        shaker: []
      },
      principles: [
        ["Halftime backbeat", "Single snare on beat 3 halves the perceived tempo."],
        ["Hat rolls", "Dense, partially divided hats create the trap stutter."]
      ]
    },

    ambient: {
      name: "Ambient pulse",
      family: "Electronic",
      meter: "4-4",
      region: "Global",
      difficulty: "easy",
      subtitle: "Minimal heartbeat pulse with wide negative space",
      tags: ["minimal", "sparse", "slow", "texture", "ambient"],
      tempo: [60, 84],
      swing: 0,
      seed: {
        kick: [0, 8],
        snare: [],
        closedHat: [],
        openHat: [12],
        rim: [4, 12],
        tom: [],
        perc: [],
        shaker: [0, 8]
      },
      principles: [
        ["Negative space", "Most of the grid is intentionally empty."],
        ["Heartbeat", "Two kicks per bar imply a slow, calm pulse."]
      ]
    },

    /* ──────────────── 2/4 (8 steps) ──────────────── */

    tango24: {
      name: "Tango 2/4",
      family: "Latin American",
      meter: "2-4",
      region: "Argentina",
      difficulty: "medium",
      subtitle: "Marcato habanera cell with a firm strong-weak tread",
      tags: ["habanera", "marcato", "duple", "dance", "accent"],
      tempo: [100, 132],
      swing: 0,
      seed: {
        kick: [0, 3, 4, 6],
        snare: [],
        closedHat: [0, 2, 4, 6],
        openHat: [],
        rim: [0, 4],
        tom: [],
        perc: [1, 3, 5, 7],
        shaker: []
      },
      principles: [
        ["Habanera cell", "The dotted kick figure is the tango's rhythmic DNA."],
        ["Marcato", "Each beat is marked firmly, strong then weak."]
      ]
    },

    baiao24: {
      name: "Baião 2/4",
      family: "Latin American",
      meter: "2-4",
      region: "Northeast Brazil",
      difficulty: "medium",
      subtitle: "Zabumba low-high dialogue over a steady duple",
      tags: ["zabumba", "syncopation", "duple", "dance", "latin"],
      tempo: [100, 126],
      swing: 8,
      seed: {
        kick: [0, 3, 4],
        snare: [2, 6],
        closedHat: [0, 2, 4, 6],
        openHat: [],
        rim: [0, 2, 4, 6],
        tom: [3, 7],
        perc: [1, 5],
        shaker: [1, 3, 5, 7]
      },
      principles: [
        ["Zabumba", "Low kick and high tom trade strokes like the two-headed drum."],
        ["Syncopated lift", "The 'and' of beat 1 pushes the groove forward."]
      ]
    },

    /* ──────────────── 6/8 (12 steps) ──────────────── */

    chacarera68: {
      name: "Chacarera 6/8",
      family: "Latin American",
      meter: "6-8",
      region: "Argentina",
      difficulty: "medium",
      subtitle: "Bombo legüero pulse with a 6/8-over-3/4 hemiola pull",
      tags: ["bombo", "hemiola", "compound", "dance", "latin"],
      tempo: [110, 140],
      swing: 0,
      seed: {
        kick: [0, 6],
        snare: [3, 9],
        closedHat: [0, 2, 4, 6, 8, 10],
        openHat: [],
        rim: [0, 2, 4, 6, 8, 10],
        tom: [6, 7, 8],
        perc: [0, 4, 8],
        shaker: [1, 3, 5, 7, 9, 11]
      },
      principles: [
        ["Bombo", "Kick and tom imitate the rim-and-head bombo legüero strokes."],
        ["Hemiola", "Perc on 0-4-8 implies 3/4 against the 6/8 grid."]
      ]
    },

    joropo68: {
      name: "Joropo 6/8",
      family: "Latin American",
      meter: "6-8",
      region: "Venezuela & Colombia",
      difficulty: "advanced",
      subtitle: "Fast llanero hemiola with restless cross-accents",
      tags: ["hemiola", "fast", "compound", "cross-accent", "latin"],
      tempo: [140, 180],
      swing: 0,
      seed: {
        kick: [0, 6],
        snare: [3, 9],
        closedHat: [0, 2, 4, 6, 8, 10],
        openHat: [],
        rim: [0, 4, 8],
        tom: [],
        perc: [2, 6, 10],
        shaker: [1, 3, 5, 7, 9, 11]
      },
      principles: [
        ["Sesquialtera", "The constant 6/8 vs 3/4 tension defines joropo."],
        ["Restless drive", "High tempo keeps the cross-accents spinning."]
      ]
    },

    /* ──────────────── 7/8 (14 steps) ──────────────── */

    rupak78: {
      name: "Rupak 7-beat study",
      family: "Indian classical",
      meter: "7-8",
      region: "India (Hindustani)",
      difficulty: "advanced",
      subtitle: "Seven-matra tala grouped 3+2+2, opening on khali",
      tags: ["tala", "aksak", "study", "tabla", "odd-meter"],
      tempo: [90, 130],
      swing: 0,
      seed: {
        kick: [0, 6, 10],
        snare: [6],
        closedHat: [0, 2, 4, 6, 8, 10, 12],
        openHat: [],
        rim: [0, 2, 4, 6, 8, 10, 12],
        tom: [],
        perc: [0, 6, 10],
        shaker: [1, 3, 5, 7, 9, 11, 13]
      },
      principles: [
        ["3+2+2", "Rupak's seven matras split into one long then two short groups."],
        ["Khali start", "Unusually, the cycle begins on the weak (khali) accent."]
      ]
    },

    /* ──────────────── 9/8 (18 steps) ──────────────── */

    zeybek98: {
      name: "Zeybek 9/8",
      family: "Anatolian",
      meter: "9-8",
      region: "Western Türkiye",
      difficulty: "advanced",
      subtitle: "Slow, heavy nine felt in broad weighted steps",
      tags: ["aksak", "slow", "heavy", "odd-meter", "dance"],
      tempo: [60, 90],
      swing: 0,
      seed: {
        kick: [0, 8],
        snare: [4, 12],
        closedHat: [0, 2, 4, 6, 8, 10, 12, 14, 16],
        openHat: [],
        rim: [0, 4, 8, 12, 16],
        tom: [16, 17],
        perc: [2, 6, 10, 14],
        shaker: []
      },
      principles: [
        ["Broad nine", "The slow tempo lets each accent group breathe."],
        ["Weighted steps", "Kick and snare alternate like a heavy walking dance."]
      ]
    },

    zeibekiko98: {
      name: "Zeibekiko 9/8",
      family: "Greek",
      meter: "9-8",
      region: "Greece",
      difficulty: "advanced",
      subtitle: "Rebetiko nine, soulful and rubato-leaning",
      tags: ["aksak", "rebetiko", "expressive", "odd-meter", "slow"],
      tempo: [70, 100],
      swing: 6,
      seed: {
        kick: [0, 6, 12],
        snare: [8, 16],
        closedHat: [0, 2, 4, 6, 8, 10, 12, 14, 16],
        openHat: [],
        rim: [0, 4, 8, 12, 16],
        tom: [],
        perc: [3, 9, 15],
        shaker: [1, 5, 9, 13, 17]
      },
      principles: [
        ["Rebetiko nine", "The asymmetric grouping carries deep expressive weight."],
        ["Soulful pull", "Light swing nudges the groove toward a rubato feel."]
      ]
    },

    /* ──────────────── 10/8 (20 steps) ──────────────── */

    darbuka108: {
      name: "Darbuka 10/8 study",
      family: "Middle Eastern",
      meter: "10-8",
      region: "Eastern Mediterranean",
      difficulty: "advanced",
      subtitle: "Dum-tek vocabulary mapped over an extended aksak ten",
      tags: ["darbuka", "dum-tek", "aksak", "study", "odd-meter"],
      tempo: [100, 140],
      swing: 0,
      seed: {
        kick: [0, 6, 10, 16],
        snare: [],
        closedHat: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18],
        openHat: [],
        rim: [2, 4, 8, 12, 14, 18],
        tom: [],
        perc: [0, 6, 10, 16],
        shaker: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
      },
      principles: [
        ["Dum and tek", "Kick voices the deep 'dum'; rim voices the sharp 'tek'."],
        ["3+2+3+2", "The ten splits into alternating long and short cells."]
      ]
    }
  };

  if (typeof window !== "undefined") {
    window.EXTRA_RHYTHMS = EXTRA_RHYTHMS;
  } else if (typeof globalThis !== "undefined") {
    globalThis.EXTRA_RHYTHMS = EXTRA_RHYTHMS;
  }
})();

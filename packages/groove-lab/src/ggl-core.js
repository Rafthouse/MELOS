const DEFAULT_STEPS_PER_BAR = 16;

const METER_LIBRARY = {
  "2-4": {
    label: "2/4",
    stepsPerBar: 8,
    pulseSteps: [0, 4],
    accentSteps: [0],
    groupText: "2 quarter-note pulses, usually felt as strong-weak.",
    feel: "duple dance"
  },
  "4-4": {
    label: "4/4",
    stepsPerBar: 16,
    pulseSteps: [0, 4, 8, 12],
    accentSteps: [0, 8],
    groupText: "4 quarter-note pulses, grouped 4+4+4+4 sixteenth steps.",
    feel: "common time"
  },
  "3-4": {
    label: "3/4",
    stepsPerBar: 12,
    pulseSteps: [0, 4, 8],
    accentSteps: [0],
    groupText: "3 quarter-note pulses, often felt as strong-weak-weak.",
    feel: "waltz time"
  },
  "5-4": {
    label: "5/4",
    stepsPerBar: 20,
    pulseSteps: [0, 4, 8, 12, 16],
    accentSteps: [0, 12],
    groupText: "5 quarter-note pulses, commonly grouped 3+2 or 2+3.",
    feel: "asymmetric quintuple"
  },
  "5-8": {
    label: "5/8",
    stepsPerBar: 10,
    pulseSteps: [0, 2, 4, 6, 8],
    accentSteps: [0, 4],
    groupText: "5 eighth-note pulses, often grouped 2+3 or 3+2.",
    feel: "short aksak five"
  },
  "6-8": {
    label: "6/8",
    stepsPerBar: 12,
    pulseSteps: [0, 2, 4, 6, 8, 10],
    accentSteps: [0, 6],
    groupText: "6 eighth-note pulses, usually grouped 3+3.",
    feel: "compound duple"
  },
  "7-8": {
    label: "7/8",
    stepsPerBar: 14,
    pulseSteps: [0, 2, 4, 6, 8, 10, 12],
    accentSteps: [0, 4, 8],
    groupText: "7 eighth-note pulses, commonly grouped 2+2+3 or 3+2+2.",
    feel: "aksak seven"
  },
  "9-8": {
    label: "9/8",
    stepsPerBar: 18,
    pulseSteps: [0, 2, 4, 6, 8, 10, 12, 14, 16],
    accentSteps: [0, 4, 8, 12],
    groupText: "9 eighth-note pulses; Balkan and Turkish practice often groups it asymmetrically.",
    feel: "compound or aksak nine"
  },
  "10-8": {
    label: "10/8",
    stepsPerBar: 20,
    pulseSteps: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18],
    accentSteps: [0, 6, 10, 16],
    groupText: "10 eighth-note pulses, often grouped 3+2+3+2 or 2+3+2+3.",
    feel: "extended aksak ten"
  },
  "11-8": {
    label: "11/8",
    stepsPerBar: 22,
    pulseSteps: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
    accentSteps: [0, 4, 8, 14, 18],
    groupText: "11 eighth-note pulses, often grouped 2+2+3+2+2 in Balkan practice.",
    feel: "long odd cycle"
  },
  "12-8": {
    label: "12/8",
    stepsPerBar: 24,
    pulseSteps: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
    accentSteps: [0, 6, 12, 18],
    groupText: "12 eighth-note pulses, usually felt as four large triplet beats.",
    feel: "compound blues"
  },
  "13-8": {
    label: "13/8",
    stepsPerBar: 26,
    pulseSteps: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
    accentSteps: [0, 6, 12, 16, 20],
    groupText: "13 eighth-note pulses, usually handled as a repeated asymmetric grouping, for example 3+3+2+2+3.",
    feel: "large odd cycle"
  }
};

const TRACKS = [
  { id: "kick", name: "Kick", sound: "kick", layer: "core" },
  { id: "snare", name: "Snare", sound: "snare", layer: "core" },
  { id: "closedHat", name: "Closed hat", sound: "hat", layer: "texture" },
  { id: "openHat", name: "Open hat", sound: "openHat", layer: "ornament" },
  { id: "rim", name: "Rim / clave", sound: "rim", layer: "accent" },
  { id: "tom", name: "Tom", sound: "tom", layer: "fill" },
  { id: "perc", name: "Percussion", sound: "perc", layer: "ornament" },
  { id: "shaker", name: "Shaker", sound: "shaker", layer: "texture" }
];

// Maps track.sound → URL of the corresponding sample file.
// BASE_URL respects Vite's `base` config so paths resolve correctly both at
// the domain root (dev) and under a project subpath like /MELOS/ (GitHub Pages).
const BASE_URL = import.meta.env.BASE_URL;
const SAMPLE_MAP = {
  kick:     BASE_URL + "ggl-sounds/kick.wav",
  snare:    BASE_URL + "ggl-sounds/snare.wav",
  hat:      BASE_URL + "ggl-sounds/hihat-closed.wav",
  openHat:  BASE_URL + "ggl-sounds/hihat-open.wav",
  rim:      BASE_URL + "ggl-sounds/rim.wav",
  tom:      BASE_URL + "ggl-sounds/tom.wav",
  perc:     BASE_URL + "ggl-sounds/perc.wav",
  shaker:   BASE_URL + "ggl-sounds/shaker.wav"
};

// Instruments in the same choke group cut each other off (MIDI standard behaviour).
// Closed hat chokes open hat — exactly as hardware drum machines do it.
const CHOKE_GROUP = {
  hat:     "hihat",
  openHat: "hihat"
};

const STYLE_LIBRARY = {
  afrocuban: {
    name: "Afro-Cuban",
    family: "Clave and African diaspora",
    subtitle: "Clave orientation, interlocking percussion, tension between anchors and answers",
    tags: ["clave", "interlocking", "syncopation", "percussion", "call-response", "medium-tempo"],
    tempo: [92, 122],
    swing: 16,
    seed: {
      kick: [0, 6, 10],
      snare: [4, 12],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
      openHat: [7, 15],
      rim: [0, 3, 6, 10, 12],
      tom: [],
      perc: [2, 5, 8, 11, 14],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15]
    },
    principles: [
      ["Pulse", "The grid keeps clear quarter-note anchors while percussion answers around them."],
      ["Clave", "The rim line acts as a reference pattern, so other layers can create syncopation without losing orientation."],
      ["Conversation", "Kick and percussion alternate roles: one grounds the body, the other supplies response."]
    ]
  },
  salsa: {
    name: "Salsa / mambo",
    family: "Clave and African diaspora",
    subtitle: "Cascara-like motion, tumbao anchors, bright phrase turns",
    tags: ["clave", "interlocking", "percussion", "call-response", "dance", "medium-tempo"],
    tempo: [94, 128],
    swing: 12,
    seed: {
      kick: [0, 10],
      snare: [4, 12],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
      openHat: [15],
      rim: [0, 3, 6, 10, 12],
      tom: [],
      perc: [1, 4, 7, 9, 11, 14],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15]
    },
    principles: [
      ["Clave frame", "The rim pattern gives the phrase a directional spine."],
      ["Cascara motion", "Repeated high percussion makes the groove feel continuous while accents move around it."],
      ["Turnaround", "The last bar can become more active without hiding the clave."]
    ]
  },
  afrobeat: {
    name: "Afrobeat",
    family: "Clave and African diaspora",
    subtitle: "Layered percussion, cyclical guitar-like motion, patient build",
    tags: ["interlocking", "syncopation", "percussion", "call-response", "long-form", "medium-tempo"],
    tempo: [94, 118],
    swing: 14,
    seed: {
      kick: [0, 7, 10],
      snare: [4, 12],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
      openHat: [6, 14],
      rim: [3, 8, 11, 15],
      tom: [],
      perc: [1, 5, 7, 9, 13, 15],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15]
    },
    principles: [
      ["Layer stack", "Several modest parts create motion together instead of one busy drum line doing everything."],
      ["Cycle", "The pattern is meant to breathe over many bars."],
      ["Response", "Percussion replies to kick placement and keeps the phrase conversational."]
    ]
  },
  european: {
    name: "European dance",
    family: "European and loop-based",
    subtitle: "Stable metricity, repeated loops, controlled energy increase",
    tags: ["straight", "loop", "backbeat", "dance", "stable", "medium-tempo"],
    tempo: [104, 132],
    swing: 4,
    seed: {
      kick: [0, 8],
      snare: [4, 12],
      closedHat: [2, 6, 10, 14],
      openHat: [6, 14],
      rim: [12],
      tom: [],
      perc: [3, 11],
      shaker: [0, 4, 8, 12]
    },
    principles: [
      ["Metric frame", "Backbeat and downbeat are kept obvious so variations read as organized changes."],
      ["Loop logic", "Small repeated cells are developed over the phrase rather than replaced."],
      ["Energy", "Density rises in the second half and resolves at the next downbeat."]
    ]
  },
  disco: {
    name: "Disco",
    family: "European and loop-based",
    subtitle: "Four-on-the-floor lift, open hats, constant dance propulsion",
    tags: ["four-on-floor", "offbeat-hat", "backbeat", "dance", "straight", "medium-tempo"],
    tempo: [108, 126],
    swing: 5,
    seed: {
      kick: [0, 4, 8, 12],
      snare: [4, 12],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
      openHat: [2, 6, 10, 14],
      rim: [12],
      tom: [],
      perc: [3, 7, 11, 15],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15]
    },
    principles: [
      ["Floor", "Every quarter note is anchored by kick, so the body always knows where the pulse is."],
      ["Lift", "Open hats on offbeats create buoyancy between kick hits."],
      ["Phrase sparkle", "Small percussion pushes the phrase forward without breaking the loop."]
    ]
  },
  balkan: {
    name: "Balkan dance",
    family: "European and loop-based",
    subtitle: "Asymmetric accents, grouped pulses, folk-dance momentum",
    tags: ["odd-meter", "accent-cycle", "dance", "folk", "syncopation", "medium-tempo"],
    tempo: [88, 132],
    swing: 8,
    seed: {
      kick: [0, 6, 10, 13],
      snare: [4, 11],
      closedHat: [0, 3, 6, 8, 10, 13, 15],
      openHat: [8, 15],
      rim: [0, 6, 10],
      tom: [],
      perc: [2, 5, 9, 12, 14],
      shaker: [1, 4, 7, 9, 12, 15]
    },
    principles: [
      ["Grouping", "The groove is understood as uneven pulse groups rather than a flat 16-step loop."],
      ["Dance accent", "Strong markers teach where the feet would land."],
      ["Controlled asymmetry", "The pattern feels unstable only if the accents stop repeating clearly."]
    ]
  },
  american: {
    name: "American funk",
    family: "American backbeat and swing",
    subtitle: "Backbeat weight, ghost notes, syncopated kick placement",
    tags: ["backbeat", "ghost-notes", "syncopation", "shuffle", "call-response", "medium-tempo"],
    tempo: [84, 112],
    swing: 22,
    seed: {
      kick: [0, 3, 8, 10],
      snare: [4, 12],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
      openHat: [14],
      rim: [],
      tom: [],
      perc: [5, 11, 15],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15]
    },
    principles: [
      ["Backbeat", "Snare on 2 and 4 is the social contract; ghost notes decorate without replacing it."],
      ["Pocket", "Delayed and anticipated kicks make the pulse move while hats keep the subdivision readable."],
      ["Call and response", "Percussion answers the kick pattern near the end of each bar."]
    ]
  },
  jazzswing: {
    name: "Jazz swing",
    family: "American backbeat and swing",
    subtitle: "Triplet feel, ride-like pulse, light comping accents",
    tags: ["shuffle", "swing", "syncopation", "ghost-notes", "call-response", "medium-tempo"],
    tempo: [92, 168],
    swing: 42,
    seed: {
      kick: [0, 8],
      snare: [4, 12],
      closedHat: [0, 3, 6, 8, 11, 14],
      openHat: [6, 14],
      rim: [2, 7, 10, 15],
      tom: [],
      perc: [5, 13],
      shaker: [0, 3, 6, 8, 11, 14]
    },
    principles: [
      ["Ride pulse", "The subdivision leans toward triplets, so not every eighth is equal."],
      ["Comping", "Snare and rim accents comment on the pulse instead of simply locking every backbeat."],
      ["Elastic time", "Swing is a timing relationship, not just a denser grid."]
    ]
  },
  secondline: {
    name: "New Orleans second line",
    family: "American backbeat and swing",
    subtitle: "Parade pulse, rolling accents, street-band call and response",
    tags: ["backbeat", "shuffle", "syncopation", "call-response", "percussion", "medium-tempo"],
    tempo: [86, 118],
    swing: 28,
    seed: {
      kick: [0, 7, 10],
      snare: [3, 4, 11, 12],
      closedHat: [0, 2, 5, 7, 8, 10, 13, 15],
      openHat: [6, 14],
      rim: [1, 8, 13],
      tom: [],
      perc: [2, 6, 9, 14],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15]
    },
    principles: [
      ["Parade step", "Kick and snare imply a walking body rather than a locked machine loop."],
      ["Roll", "Close snare hits create forward tumble into the next accent."],
      ["Response", "Rim and percussion answer the drumline phrasing."]
    ]
  },
  berlin: {
    name: "Berlin techno",
    family: "Electronic repetition",
    subtitle: "Four-on-the-floor, offbeat hats, long-form micro-mutation",
    tags: ["four-on-floor", "offbeat-hat", "machine", "long-form", "minimal", "fast"],
    tempo: [124, 138],
    swing: 2,
    seed: {
      kick: [0, 4, 8, 12],
      snare: [4, 12],
      closedHat: [2, 6, 10, 14],
      openHat: [2, 6, 10, 14],
      rim: [7, 15],
      tom: [],
      perc: [5, 13],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15]
    },
    principles: [
      ["Machine pulse", "The kick repeats with almost ritual stability so tiny mutations become audible."],
      ["Offbeat lift", "Hats sit between kicks to create propulsion without disturbing the floor."],
      ["Long tension", "The phrase changes by adding and removing few events across 8 or 16 bars."]
    ]
  },
  house: {
    name: "House",
    family: "Electronic repetition",
    subtitle: "Four-on-the-floor warmth, shuffled hats, looped dance release",
    tags: ["four-on-floor", "offbeat-hat", "dance", "loop", "shuffle", "medium-tempo"],
    tempo: [118, 128],
    swing: 12,
    seed: {
      kick: [0, 4, 8, 12],
      snare: [4, 12],
      closedHat: [2, 6, 10, 14],
      openHat: [2, 6, 10, 14],
      rim: [7, 15],
      tom: [],
      perc: [3, 9, 11, 15],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15]
    },
    principles: [
      ["Dance engine", "The kick is stable, while hats and percussion supply lift."],
      ["Shuffle", "A little swing softens the grid and brings the loop closer to a played feel."],
      ["Release", "Phrase endings add small fills without leaving the floor."]
    ]
  },
  electro: {
    name: "Electro",
    family: "Electronic repetition",
    subtitle: "Syncopated machine funk, dry snares, robotic displacement",
    tags: ["machine", "syncopation", "broken", "backbeat", "electronic", "medium-tempo"],
    tempo: [112, 132],
    swing: 6,
    seed: {
      kick: [0, 3, 8, 11],
      snare: [4, 12],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
      openHat: [6, 14],
      rim: [7, 15],
      tom: [],
      perc: [1, 9, 13],
      shaker: [3, 7, 11, 15]
    },
    principles: [
      ["Machine funk", "The pattern borrows funk displacement but keeps timing precise."],
      ["Dry backbeat", "Snare remains a clear reference point while kicks move around it."],
      ["Robotic answer", "Percussion behaves like short programmed replies."]
    ]
  },
  breakbeat: {
    name: "Breakbeat",
    family: "Broken beat and bass",
    subtitle: "Broken kick logic, displaced snares, phrase-ending cuts",
    tags: ["broken", "backbeat", "syncopation", "cuts", "fast", "loop"],
    tempo: [118, 146],
    swing: 10,
    seed: {
      kick: [0, 3, 7, 10],
      snare: [4, 11],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
      openHat: [15],
      rim: [6, 13],
      tom: [],
      perc: [1, 9, 14],
      shaker: [3, 7, 11, 15]
    },
    principles: [
      ["Broken frame", "The backbeat is recognizable but kicks arrive in uneven groups."],
      ["Cuts", "Short rests and phrase-ending fills make repetition feel edited."],
      ["Momentum", "Dense hats and percussion keep continuity through displaced accents."]
    ]
  },
  jungle: {
    name: "Jungle / drum and bass",
    family: "Broken beat and bass",
    subtitle: "Fast breaks, chopped snares, rolling hat pressure",
    tags: ["broken", "backbeat", "cuts", "fast", "syncopation", "dense"],
    tempo: [160, 176],
    swing: 6,
    seed: {
      kick: [0, 3, 10],
      snare: [4, 11, 12],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
      openHat: [7, 15],
      rim: [6, 13],
      tom: [],
      perc: [1, 5, 9, 14],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15]
    },
    principles: [
      ["Chop logic", "The break is recognizable but rearranged into sharper phrase fragments."],
      ["Speed", "Fast tempo makes small placements feel dramatic."],
      ["Return point", "Even wild edits need a clear snare or kick anchor to reset the ear."]
    ]
  },
  halftime: {
    name: "Halftime bass",
    family: "Broken beat and bass",
    subtitle: "Slow-feeling backbeat over fast subdivisions",
    tags: ["broken", "backbeat", "bass", "space", "dense", "fast"],
    tempo: [140, 172],
    swing: 8,
    seed: {
      kick: [0, 7, 10],
      snare: [8],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
      openHat: [14],
      rim: [3, 11, 15],
      tom: [],
      perc: [5, 13],
      shaker: [1, 5, 9, 13]
    },
    principles: [
      ["Half feel", "The snare lands later, so the groove feels slower than the subdivision grid."],
      ["Bass space", "Kick placement leaves room for heavy low-end movement."],
      ["Tension", "Sparse anchors plus fast hats create a wide, suspended pocket."]
    ]
  },
  dub: {
    name: "Reggae and dub",
    family: "Island and spacious",
    subtitle: "Skank-like offbeats, spacious kick, delayed responses",
    tags: ["offbeat-hat", "space", "bass", "syncopation", "slow", "delay"],
    tempo: [68, 92],
    swing: 18,
    seed: {
      kick: [0, 10],
      snare: [8],
      closedHat: [2, 6, 10, 14],
      openHat: [6, 14],
      rim: [4, 12],
      tom: [],
      perc: [3, 7, 11, 15],
      shaker: [1, 5, 9, 13]
    },
    principles: [
      ["Space", "Silence is part of the groove; the pattern leaves room for echoes and bass."],
      ["Offbeat", "Hats and rim hits point between the main pulses."],
      ["Release", "Fills are sparse and usually return quickly to the one-drop center."]
    ]
  },
  dancehall: {
    name: "Dancehall",
    family: "Island and spacious",
    subtitle: "Sparse digital kick, sharp snare answers, syncopated offbeat cells",
    tags: ["space", "bass", "syncopation", "dance", "machine", "medium-tempo"],
    tempo: [88, 112],
    swing: 10,
    seed: {
      kick: [0, 7, 12],
      snare: [4, 10],
      closedHat: [2, 6, 10, 14],
      openHat: [15],
      rim: [3, 8, 13],
      tom: [],
      perc: [1, 6, 11],
      shaker: [5, 9, 13]
    },
    principles: [
      ["Digital space", "Few strong events leave the groove lean and vocal-friendly."],
      ["Offbeat cell", "Short syncopated cells repeat until they become the hook."],
      ["Drum answer", "Snare and rim behave as compact replies to the kick."]
    ]
  },
  oddmeter: {
    name: "Odd meter lab",
    family: "Experimental and odd meter",
    subtitle: "Uneven phrase lengths, accent groups, stable orientation points",
    tags: ["odd-meter", "accent-cycle", "experimental", "syncopation", "stable", "medium-tempo"],
    tempo: [78, 126],
    swing: 6,
    seed: {
      kick: [0, 5, 11],
      snare: [7, 14],
      closedHat: [0, 2, 5, 7, 9, 11, 14],
      openHat: [11],
      rim: [0, 5, 11, 14],
      tom: [],
      perc: [3, 8, 13, 15],
      shaker: [1, 4, 6, 10, 12, 15]
    },
    principles: [
      ["Orientation", "Odd meters need repeated accent groups so the listener can predict the loop."],
      ["Asymmetry", "Uneven spacing is a feature when the return point stays clear."],
      ["Study mode", "Change one accent at a time to hear how the meter bends."]
    ]
  },
  minimalism: {
    name: "Experimental minimalism",
    family: "Experimental and odd meter",
    subtitle: "Sparse cells, repetition, gradual mutation, silence as structure",
    tags: ["minimal", "long-form", "space", "experimental", "loop", "stable"],
    tempo: [72, 128],
    swing: 0,
    seed: {
      kick: [0],
      snare: [12],
      closedHat: [4, 10],
      openHat: [],
      rim: [7],
      tom: [],
      perc: [15],
      shaker: []
    },
    principles: [
      ["Economy", "Few events make each change easy to hear."],
      ["Mutation", "The lesson is not density, but the meaning of tiny changes over time."],
      ["Silence", "Empty steps are structural decisions, not missing information."]
    ]
  }
};

Object.entries(STYLE_LIBRARY).forEach(([, style]) => {
  style.meter = "4-4";
});

Object.assign(STYLE_LIBRARY, {
  march24: {
    name: "March 2/4",
    family: "Duple meter",
    meter: "2-4",
    subtitle: "Direct strong-weak marching pulse with simple snare response",
    tags: ["two-four", "march", "stable", "accent-cycle", "duple", "medium-tempo"],
    tempo: [96, 132],
    swing: 0,
    seed: {
      kick: [0, 4],
      snare: [4],
      closedHat: [0, 2, 4, 6],
      openHat: [6],
      rim: [0],
      tom: [],
      perc: [3, 7],
      shaker: [1, 3, 5, 7]
    },
    principles: [
      ["Strong-weak", "Beat 1 leads and beat 2 answers."],
      ["March clarity", "The rhythm teaches direct duple orientation."],
      ["Small fill", "End-bar pickups should point back to beat 1."]
    ]
  },
  polka24: {
    name: "Polka 2/4",
    family: "Duple meter",
    meter: "2-4",
    subtitle: "Fast bouncing duple dance with light offbeat lift",
    tags: ["two-four", "folk", "dance", "duple", "stable", "fast"],
    tempo: [112, 156],
    swing: 2,
    seed: {
      kick: [0, 4],
      snare: [2, 6],
      closedHat: [0, 2, 4, 6],
      openHat: [2, 6],
      rim: [0, 4],
      tom: [],
      perc: [1, 5, 7],
      shaker: [1, 3, 5, 7]
    },
    principles: [
      ["Bounce", "Offbeat hits lift the simple two-beat frame."],
      ["Dance pulse", "The pattern stays compact and repetitive."],
      ["Energy", "Density can rise without changing the strong-weak shape."]
    ]
  },
  samba24: {
    name: "Samba 2/4",
    family: "Duple meter",
    meter: "2-4",
    subtitle: "Brazilian duple groove with syncopated percussion answers",
    tags: ["two-four", "syncopation", "percussion", "dance", "call-response", "fast"],
    tempo: [92, 132],
    swing: 10,
    seed: {
      kick: [0, 5],
      snare: [4],
      closedHat: [0, 2, 4, 6],
      openHat: [7],
      rim: [0, 3, 6],
      tom: [],
      perc: [1, 3, 4, 7],
      shaker: [1, 3, 5, 7]
    },
    principles: [
      ["Syncopated duple", "The bar is short, but percussion bends around the anchors."],
      ["Surdo-like base", "Kick placement gives a grounded Brazilian pulse."],
      ["Layer response", "Small percussion parts create motion between the two beats."]
    ]
  },
  waltzclassic: {
    name: "Classical waltz",
    family: "Triple meter",
    meter: "3-4",
    subtitle: "Strong first beat, two lighter answers, clear dance rotation",
    tags: ["triple", "dance", "stable", "accent-cycle", "waltz", "medium-tempo"],
    tempo: [84, 132],
    swing: 0,
    seed: {
      kick: [0],
      snare: [4, 8],
      closedHat: [0, 4, 8],
      openHat: [8],
      rim: [0],
      tom: [],
      perc: [2, 6, 10],
      shaker: [2, 4, 6, 8, 10]
    },
    principles: [
      ["One-two-three", "Beat 1 carries weight, while beats 2 and 3 complete the turn."],
      ["Dance clarity", "The pattern avoids too much syncopation so the triple meter is never hidden."],
      ["Phrase lift", "Small ornaments can rise into beat 1 of the next bar."]
    ]
  },
  jazzwaltz: {
    name: "Jazz waltz",
    family: "Triple meter",
    meter: "3-4",
    subtitle: "Swinging triple pulse, ride-like subdivision, comped accents",
    tags: ["triple", "swing", "syncopation", "ghost-notes", "jazz", "medium-tempo"],
    tempo: [104, 168],
    swing: 34,
    seed: {
      kick: [0, 8],
      snare: [4, 10],
      closedHat: [0, 3, 6, 8, 11],
      openHat: [6],
      rim: [2, 7, 10],
      tom: [],
      perc: [5, 9],
      shaker: [0, 3, 6, 8, 11]
    },
    principles: [
      ["Triple swing", "The bar is still 3/4, but subdivision leans into triplet phrasing."],
      ["Comping", "Snare and rim comment around the pulse rather than marking every beat evenly."],
      ["Elastic return", "The listener hears freedom because beat 1 keeps returning clearly."]
    ]
  },
  mazurka: {
    name: "Mazurka",
    family: "Triple meter",
    meter: "3-4",
    subtitle: "Triple folk accent with weight on beat 2 or 3",
    tags: ["triple", "folk", "accent-cycle", "dance", "syncopation", "medium-tempo"],
    tempo: [92, 138],
    swing: 4,
    seed: {
      kick: [0, 8],
      snare: [4, 8],
      closedHat: [0, 4, 8, 10],
      openHat: [10],
      rim: [4],
      tom: [],
      perc: [2, 6, 9],
      shaker: [1, 3, 5, 7, 9, 11]
    },
    principles: [
      ["Shifted weight", "Unlike a plain waltz, a later beat can become the expressive accent."],
      ["Folk step", "The groove teaches triple time as a dance pattern, not just three equal pulses."],
      ["Accent study", "Moving the rim between beats 2 and 3 changes the whole feel."]
    ]
  },
  takefive: {
    name: "Jazz 5/4",
    family: "Quintuple meter",
    meter: "5-4",
    subtitle: "Take Five-like 3+2 grouping with a swinging ride surface",
    tags: ["five", "jazz", "swing", "accent-cycle", "odd-meter", "medium-tempo"],
    tempo: [92, 138],
    swing: 24,
    seed: {
      kick: [0, 12],
      snare: [8, 16],
      closedHat: [0, 3, 6, 8, 11, 14, 16, 19],
      openHat: [6, 16],
      rim: [0, 8, 12, 16],
      tom: [],
      perc: [5, 10, 15, 19],
      shaker: [0, 3, 6, 8, 11, 14, 16, 19]
    },
    principles: [
      ["3+2 map", "The bar feels like a longer group followed by a shorter answer."],
      ["Swing layer", "The ride-like surface prevents the odd meter from feeling stiff."],
      ["Return point", "Beat 1 must stay obvious because the bar is longer than common time."]
    ]
  },
  balkanfive: {
    name: "Balkan 5/4 aksak",
    family: "Quintuple meter",
    meter: "5-4",
    subtitle: "Uneven 2+3 or 3+2 accent cells, folk-dance propulsion",
    tags: ["five", "odd-meter", "accent-cycle", "folk", "dance", "syncopation"],
    tempo: [88, 132],
    swing: 8,
    seed: {
      kick: [0, 8, 14],
      snare: [4, 12, 16],
      closedHat: [0, 2, 4, 8, 10, 12, 14, 16, 18],
      openHat: [10, 18],
      rim: [0, 8, 14],
      tom: [],
      perc: [3, 7, 11, 15, 19],
      shaker: [1, 3, 5, 9, 11, 13, 15, 17, 19]
    },
    principles: [
      ["Aksak grouping", "The groove is learned through long-short groupings, not an even five-count."],
      ["Dance marker", "Rim accents show where the feet reorient."],
      ["Variation limit", "Ornaments can move, but the grouping accents should remain legible."]
    ]
  },
  progfive: {
    name: "Progressive 5/4",
    family: "Quintuple meter",
    meter: "5-4",
    subtitle: "Rock backbeat logic stretched across five quarter pulses",
    tags: ["five", "rock", "backbeat", "odd-meter", "stable", "medium-tempo"],
    tempo: [96, 148],
    swing: 2,
    seed: {
      kick: [0, 6, 12, 18],
      snare: [8, 16],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18],
      openHat: [10, 18],
      rim: [4, 12],
      tom: [],
      perc: [3, 7, 11, 15, 19],
      shaker: [1, 5, 9, 13, 17]
    },
    principles: [
      ["Extended backbeat", "The snare gives rock familiarity while the bar length creates asymmetry."],
      ["Anchor spread", "Kick placements stop the fifth pulse from feeling like an accident."],
      ["Build", "Fills should resolve into beat 1, not blur the five-pulse count."]
    ]
  },
  paidushko58: {
    name: "Paidushko 5/8",
    family: "Aksak five",
    meter: "5-8",
    subtitle: "Bulgarian 2+3 short-long dance grouping",
    tags: ["five-eight", "odd-meter", "folk", "dance", "accent-cycle", "aksak"],
    tempo: [104, 164],
    swing: 3,
    seed: {
      kick: [0, 4],
      snare: [6, 8],
      closedHat: [0, 2, 4, 6, 8],
      openHat: [8],
      rim: [0, 4],
      tom: [],
      perc: [3, 7, 9],
      shaker: [1, 3, 5, 7, 9]
    },
    principles: [
      ["2+3", "The second group is longer, giving the dance its lopsided lift."],
      ["Aksak pulse", "The uneven grouping repeats clearly enough to feel stable."],
      ["Pickup", "Late ornaments pull into the next short group."]
    ]
  },
  greek58: {
    name: "Greek 5/8",
    family: "Aksak five",
    meter: "5-8",
    subtitle: "3+2 phrasing with a broad first gesture",
    tags: ["five-eight", "odd-meter", "folk", "dance", "accent-cycle", "aksak"],
    tempo: [88, 140],
    swing: 4,
    seed: {
      kick: [0, 6],
      snare: [4, 8],
      closedHat: [0, 2, 4, 6, 8],
      openHat: [4],
      rim: [0, 6],
      tom: [],
      perc: [3, 7, 9],
      shaker: [1, 3, 5, 7, 9]
    },
    principles: [
      ["3+2", "The longer group starts the bar and the shorter group answers."],
      ["Contrast", "Compare with paidushko to hear the long group move."],
      ["Folk marker", "Rim accents make the grouping visible on the grid."]
    ]
  },
  prog58: {
    name: "Progressive 5/8",
    family: "Aksak five",
    meter: "5-8",
    subtitle: "Compact rock-like odd loop with a fast turnaround",
    tags: ["five-eight", "rock", "odd-meter", "backbeat", "syncopation", "stable"],
    tempo: [112, 176],
    swing: 0,
    seed: {
      kick: [0, 6],
      snare: [4, 8],
      closedHat: [0, 2, 4, 6, 8],
      openHat: [8],
      rim: [0, 4],
      tom: [],
      perc: [3, 7, 9],
      shaker: [1, 5, 9]
    },
    principles: [
      ["Short odd loop", "The bar turns around quickly, which makes the odd meter obvious."],
      ["Rock memory", "Snare gives a familiar reference inside the shortened cycle."],
      ["Resolution", "Fills must be brief because the bar has only five eighth pulses."]
    ]
  },
  bembe68: {
    name: "Bembe 6/8",
    family: "Compound six",
    meter: "6-8",
    subtitle: "Afro-Cuban bell orientation over two dotted-quarter anchors",
    tags: ["six-eight", "clave", "compound", "percussion", "interlocking", "dance"],
    tempo: [86, 132],
    swing: 10,
    seed: {
      kick: [0, 6],
      snare: [4, 10],
      closedHat: [0, 2, 4, 6, 8, 10],
      openHat: [4, 10],
      rim: [0, 3, 6, 9, 10],
      tom: [],
      perc: [1, 4, 7, 9, 11],
      shaker: [1, 3, 5, 7, 9, 11]
    },
    principles: [
      ["Compound pulse", "Two large beats contain six smaller eighth-note pulses."],
      ["Bell guide", "Rim accents orient the listener through the 3+3 grouping."],
      ["Interlock", "Percussion replies between the anchors rather than duplicating them."]
    ]
  },
  irishjig: {
    name: "Irish jig",
    family: "Compound six",
    meter: "6-8",
    subtitle: "Light 3+3 dance pulse with pickup-like ornaments",
    tags: ["six-eight", "folk", "dance", "compound", "stable", "medium-tempo"],
    tempo: [104, 150],
    swing: 4,
    seed: {
      kick: [0, 6],
      snare: [4, 10],
      closedHat: [0, 2, 4, 6, 8, 10],
      openHat: [10],
      rim: [0, 6],
      tom: [],
      perc: [2, 5, 8, 11],
      shaker: [1, 3, 5, 7, 9, 11]
    },
    principles: [
      ["3+3 lift", "The bar is not six equal stresses; it has two buoyant groups."],
      ["Pickup feel", "Late ornaments pull into the next large beat."],
      ["Dance economy", "The pattern stays light so the compound pulse remains clear."]
    ]
  },
  blues68: {
    name: "Blues 6/8",
    family: "Compound six",
    meter: "6-8",
    subtitle: "Slow triplet lilt, backbeat-like second large pulse",
    tags: ["six-eight", "blues", "compound", "swing", "backbeat", "space"],
    tempo: [60, 100],
    swing: 18,
    seed: {
      kick: [0, 6, 10],
      snare: [6],
      closedHat: [0, 2, 4, 6, 8, 10],
      openHat: [4, 10],
      rim: [3, 9],
      tom: [],
      perc: [5, 11],
      shaker: [1, 3, 5, 7, 9, 11]
    },
    principles: [
      ["Lilt", "The groove leans through triplet groups instead of straight eighths."],
      ["Second-pulse weight", "Snare on the second large beat creates a bluesy backbeat feeling."],
      ["Space", "Sparse kick placement leaves room for bass and vocal phrasing."]
    ]
  },
  tarantella: {
    name: "Tarantella 6/8",
    family: "Compound six",
    meter: "6-8",
    subtitle: "Fast Mediterranean 6/8 spin with bright repeated accents",
    tags: ["six-eight", "folk", "dance", "compound", "fast", "accent-cycle"],
    tempo: [120, 172],
    swing: 2,
    seed: {
      kick: [0, 6],
      snare: [4, 8, 10],
      closedHat: [0, 2, 4, 6, 8, 10],
      openHat: [2, 8],
      rim: [0, 4, 6, 10],
      tom: [],
      perc: [1, 3, 5, 7, 9, 11],
      shaker: [1, 3, 5, 7, 9, 11]
    },
    principles: [
      ["Spin", "Repeated small pulses make the compound meter feel circular."],
      ["Bright accents", "Short rim and snare events keep the dance moving."],
      ["Release", "End-bar ornaments should still point back to the first large beat."]
    ]
  },
  rachenitsa78: {
    name: "Rachenitsa 7/8",
    family: "Aksak seven",
    meter: "7-8",
    subtitle: "Bulgarian 2+2+3 grouping with a long final step",
    tags: ["seven-eight", "odd-meter", "folk", "dance", "accent-cycle", "aksak"],
    tempo: [96, 154],
    swing: 4,
    seed: {
      kick: [0, 8],
      snare: [4, 12],
      closedHat: [0, 2, 4, 6, 8, 10, 12],
      openHat: [10],
      rim: [0, 4, 8],
      tom: [],
      perc: [2, 6, 9, 13],
      shaker: [1, 3, 5, 7, 9, 11, 13]
    },
    principles: [
      ["2+2+3", "The last group is longer, so the bar feels like short-short-long."],
      ["Folk anchor", "Rim accents teach the grouping before ornaments are added."],
      ["Return", "The final long group should lead clearly back to step 1."]
    ]
  },
  kalamatianos78: {
    name: "Kalamatianos 7/8",
    family: "Aksak seven",
    meter: "7-8",
    subtitle: "Greek 3+2+2 grouping with a broad opening gesture",
    tags: ["seven-eight", "odd-meter", "folk", "dance", "accent-cycle", "aksak"],
    tempo: [88, 138],
    swing: 5,
    seed: {
      kick: [0, 6, 10],
      snare: [6, 12],
      closedHat: [0, 2, 4, 6, 8, 10, 12],
      openHat: [4, 12],
      rim: [0, 6, 10],
      tom: [],
      perc: [3, 7, 11, 13],
      shaker: [1, 3, 5, 7, 9, 11, 13]
    },
    principles: [
      ["3+2+2", "The long group comes first, then two shorter answers."],
      ["Broad opening", "The first group gives the rhythm its recognizable shape."],
      ["Comparison", "Switch to rachenitsa to hear how moving the long group changes the meter."]
    ]
  },
  progseven: {
    name: "Progressive 7/8",
    family: "Aksak seven",
    meter: "7-8",
    subtitle: "Rock accents stretched through seven eighth pulses",
    tags: ["seven-eight", "rock", "odd-meter", "backbeat", "stable", "syncopation"],
    tempo: [108, 164],
    swing: 0,
    seed: {
      kick: [0, 6, 10],
      snare: [8, 12],
      closedHat: [0, 2, 4, 6, 8, 10, 12],
      openHat: [6, 12],
      rim: [0, 4, 10],
      tom: [],
      perc: [3, 7, 11, 13],
      shaker: [1, 5, 9, 13]
    },
    principles: [
      ["Rock memory", "A backbeat-like snare makes seven feel playable instead of abstract."],
      ["Odd loop", "The bar turns around sooner than common time expects."],
      ["Fill discipline", "Fills need to respect the shortened bar length."]
    ]
  },
  karsilama98: {
    name: "Karsilama 9/8",
    family: "Aksak nine",
    meter: "9-8",
    subtitle: "Turkish 2+2+2+3 grouping with a stretched final cell",
    tags: ["nine-eight", "odd-meter", "folk", "dance", "accent-cycle", "aksak"],
    tempo: [86, 132],
    swing: 4,
    seed: {
      kick: [0, 8, 12],
      snare: [4, 14],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14, 16],
      openHat: [10, 16],
      rim: [0, 4, 8, 12],
      tom: [],
      perc: [3, 7, 11, 15, 17],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15, 17]
    },
    principles: [
      ["2+2+2+3", "Three short groups prepare the longer final group."],
      ["Aksak identity", "The asymmetry must repeat predictably to become danceable."],
      ["Turnaround", "The last group carries extra tension into the next downbeat."]
    ]
  },
  balkan98: {
    name: "Balkan 9/8",
    family: "Aksak nine",
    meter: "9-8",
    subtitle: "Alternative 3+2+2+2 grouping with early long weight",
    tags: ["nine-eight", "odd-meter", "folk", "dance", "accent-cycle", "aksak"],
    tempo: [88, 138],
    swing: 5,
    seed: {
      kick: [0, 6, 10, 14],
      snare: [6, 12, 16],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14, 16],
      openHat: [4, 12],
      rim: [0, 6, 10, 14],
      tom: [],
      perc: [3, 7, 11, 15, 17],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15, 17]
    },
    principles: [
      ["3+2+2+2", "The long group starts the bar, making the phrase feel front-loaded."],
      ["Group contrast", "Compare with karsilama to hear where the long cell sits."],
      ["Stable accents", "The accent map is the rhythm's grammar."]
    ]
  },
  turkish108: {
    name: "Turkish 10/8 aksak",
    family: "Aksak ten",
    meter: "10-8",
    subtitle: "3+2+3+2 extended uneven dance cycle",
    tags: ["ten-eight", "odd-meter", "folk", "dance", "accent-cycle", "aksak"],
    tempo: [82, 128],
    swing: 4,
    seed: {
      kick: [0, 6, 10, 16],
      snare: [6, 14, 18],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18],
      openHat: [8, 18],
      rim: [0, 6, 10, 16],
      tom: [],
      perc: [3, 7, 11, 15, 19],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
    },
    principles: [
      ["3+2+3+2", "Long and short cells alternate across the bar."],
      ["Extended aksak", "The cycle is long, so repeated accents are essential."],
      ["Dance return", "The final short cell should clearly lead back to beat 1."]
    ]
  },
  balkan108: {
    name: "Balkan 10/8",
    family: "Aksak ten",
    meter: "10-8",
    subtitle: "2+3+2+3 grouping with two long cells",
    tags: ["ten-eight", "odd-meter", "folk", "dance", "accent-cycle", "aksak"],
    tempo: [88, 136],
    swing: 5,
    seed: {
      kick: [0, 4, 10, 14],
      snare: [4, 12, 18],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18],
      openHat: [8, 18],
      rim: [0, 4, 10, 14],
      tom: [],
      perc: [3, 7, 11, 15, 19],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
    },
    principles: [
      ["2+3+2+3", "The long cells arrive second and fourth."],
      ["Group contrast", "This is a useful contrast to Turkish 10/8."],
      ["Folk clarity", "Rim accents are the listener's map."]
    ]
  },
  prog108: {
    name: "Progressive 10/8",
    family: "Aksak ten",
    meter: "10-8",
    subtitle: "Two five-eighth cells joined into a longer rock cycle",
    tags: ["ten-eight", "rock", "odd-meter", "backbeat", "syncopation", "stable"],
    tempo: [104, 156],
    swing: 0,
    seed: {
      kick: [0, 6, 10, 16],
      snare: [8, 18],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18],
      openHat: [8, 18],
      rim: [0, 10],
      tom: [],
      perc: [3, 7, 13, 17, 19],
      shaker: [1, 5, 9, 11, 15, 19]
    },
    principles: [
      ["Double five", "The groove can be heard as two linked 5/8 bars."],
      ["Rock anchor", "Snare placements make the long cycle easier to feel."],
      ["Phrase logic", "Mutations should preserve the two-cell shape."]
    ]
  },
  kopanitsa118: {
    name: "Kopanitsa 11/8",
    family: "Aksak eleven",
    meter: "11-8",
    subtitle: "Bulgarian 2+2+3+2+2 long odd cycle",
    tags: ["eleven-eight", "odd-meter", "folk", "dance", "accent-cycle", "aksak"],
    tempo: [82, 132],
    swing: 4,
    seed: {
      kick: [0, 8, 14],
      snare: [4, 12, 18],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
      openHat: [12, 20],
      rim: [0, 4, 8, 14, 18],
      tom: [],
      perc: [3, 7, 11, 15, 19, 21],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21]
    },
    principles: [
      ["2+2+3+2+2", "A central long cell gives the bar its identity."],
      ["Dance map", "The accents must be visible before ornaments are added."],
      ["Long return", "The ear needs a clear path back to the first cell."]
    ]
  },
  prog118: {
    name: "Progressive 11/8",
    family: "Aksak eleven",
    meter: "11-8",
    subtitle: "Rock-oriented 11-pulse cycle with asymmetric backbeat",
    tags: ["eleven-eight", "rock", "odd-meter", "backbeat", "syncopation", "stable"],
    tempo: [96, 152],
    swing: 0,
    seed: {
      kick: [0, 6, 14, 20],
      snare: [8, 18],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
      openHat: [10, 20],
      rim: [0, 8, 14],
      tom: [],
      perc: [3, 7, 11, 15, 19, 21],
      shaker: [1, 5, 9, 13, 17, 21]
    },
    principles: [
      ["Asymmetric backbeat", "Snare gives rock weight while the bar stays uneven."],
      ["Long cycle", "The pattern should be learned as a phrase, not counted mechanically."],
      ["Stability", "Kick anchors stop the 11/8 loop from feeling random."]
    ]
  },
  gankino118: {
    name: "Gankino 11/8",
    family: "Aksak eleven",
    meter: "11-8",
    subtitle: "Balkan 2+2+3+2+2 dance accent pattern",
    tags: ["eleven-eight", "odd-meter", "folk", "dance", "accent-cycle", "aksak"],
    tempo: [88, 144],
    swing: 5,
    seed: {
      kick: [0, 4, 8, 14, 18],
      snare: [8, 16, 20],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
      openHat: [12, 20],
      rim: [0, 4, 8, 14, 18],
      tom: [],
      perc: [3, 7, 11, 15, 19, 21],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21]
    },
    principles: [
      ["Repeated accents", "The same aksak map repeats until it becomes bodily."],
      ["Folk drive", "Percussion fills the spaces between group markers."],
      ["Comparison", "Compare with progressive 11/8 to hear dance versus rock logic."]
    ]
  },
  blues128: {
    name: "Blues 12/8",
    family: "Compound twelve",
    meter: "12-8",
    subtitle: "Four triplet-feel beats with heavy backbeat release",
    tags: ["twelve-eight", "blues", "compound", "swing", "backbeat", "space"],
    tempo: [58, 96],
    swing: 20,
    seed: {
      kick: [0, 12, 18],
      snare: [6, 18],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
      openHat: [4, 10, 16, 22],
      rim: [6, 18],
      tom: [],
      perc: [5, 11, 17, 23],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]
    },
    principles: [
      ["Four big beats", "12/8 is felt as four triplet groups, not as twelve equal accents."],
      ["Backbeat release", "Snare on the second and fourth large beats gives blues weight."],
      ["Triplet surface", "Hats reveal the rolling subdivision."]
    ]
  },
  gospel128: {
    name: "Gospel 12/8",
    family: "Compound twelve",
    meter: "12-8",
    subtitle: "Rolling worship pocket with strong triplet subdivision",
    tags: ["twelve-eight", "gospel", "compound", "swing", "backbeat", "build"],
    tempo: [62, 104],
    swing: 18,
    seed: {
      kick: [0, 10, 12, 20],
      snare: [6, 18],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
      openHat: [10, 22],
      rim: [4, 16],
      tom: [],
      perc: [5, 11, 17, 23],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]
    },
    principles: [
      ["Rolling pocket", "Subdivision stays active while the large beats remain broad."],
      ["Lift", "Late kicks lead into snare and phrase returns."],
      ["Build", "Density can rise gradually without changing the compound feel."]
    ]
  },
  afrocuban128: {
    name: "Afro-Cuban 12/8",
    family: "Compound twelve",
    meter: "12-8",
    subtitle: "12/8 bell cycle with layered percussion responses",
    tags: ["twelve-eight", "clave", "compound", "interlocking", "percussion", "call-response"],
    tempo: [78, 124],
    swing: 10,
    seed: {
      kick: [0, 12],
      snare: [6, 18],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
      openHat: [10, 22],
      rim: [0, 3, 6, 10, 12, 15, 18, 22],
      tom: [],
      perc: [2, 5, 8, 11, 14, 17, 20, 23],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]
    },
    principles: [
      ["Bell cycle", "The rim track gives a 12/8 reference pattern."],
      ["Layered response", "Percussion answers inside the compound pulse."],
      ["Orientation", "The bell keeps the listener grounded while syncopation grows."]
    ]
  },
  balkan138: {
    name: "Balkan 13/8",
    family: "Aksak thirteen",
    meter: "13-8",
    subtitle: "Large 3+3+2+2+3 asymmetric folk cycle",
    tags: ["thirteen-eight", "odd-meter", "folk", "dance", "accent-cycle", "aksak"],
    tempo: [76, 126],
    swing: 4,
    seed: {
      kick: [0, 6, 12, 20],
      snare: [12, 18, 24],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
      openHat: [10, 18, 24],
      rim: [0, 6, 12, 16, 20],
      tom: [],
      perc: [3, 7, 11, 15, 19, 23, 25],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25]
    },
    principles: [
      ["3+3+2+2+3", "The bar combines two long cells, two short cells, and a final long return."],
      ["Large map", "The accent cycle is the main lesson."],
      ["Phrase memory", "The listener learns the cycle by repeated landmarks."]
    ]
  },
  prog138: {
    name: "Progressive 13/8",
    family: "Aksak thirteen",
    meter: "13-8",
    subtitle: "Long odd rock phrase with grouped accent islands",
    tags: ["thirteen-eight", "rock", "odd-meter", "backbeat", "syncopation", "long-form"],
    tempo: [88, 148],
    swing: 0,
    seed: {
      kick: [0, 6, 14, 20, 24],
      snare: [12, 22],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
      openHat: [10, 18, 24],
      rim: [0, 12, 20],
      tom: [],
      perc: [3, 7, 11, 15, 19, 23, 25],
      shaker: [1, 5, 9, 13, 17, 21, 25]
    },
    principles: [
      ["Grouped islands", "The long bar is felt through accent islands, not one long count."],
      ["Rock reference", "Snare and kick make the odd cycle playable."],
      ["Resolution", "The final group needs a clear return to the opening kick."]
    ]
  },
  carnatic138: {
    name: "Carnatic 13/8 study",
    family: "Aksak thirteen",
    meter: "13-8",
    subtitle: "South-Indian-inspired additive 13-pulse study pattern",
    tags: ["thirteen-eight", "additive", "odd-meter", "accent-cycle", "percussion", "experimental"],
    tempo: [72, 132],
    swing: 0,
    seed: {
      kick: [0, 12, 20],
      snare: [6, 16, 24],
      closedHat: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
      openHat: [10, 24],
      rim: [0, 6, 12, 16, 20],
      tom: [],
      perc: [2, 5, 8, 11, 14, 17, 20, 23, 25],
      shaker: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25]
    },
    principles: [
      ["Additive thinking", "The meter is built from smaller counted cells."],
      ["Percussion grammar", "Rim and percussion show the phrase skeleton."],
      ["Study pattern", "Change one accent group to hear how the cycle rebalances."]
    ]
  }
});

// Reasonable region defaults for built-in styles (used only when a style omits one).
const FAMILY_REGIONS = {
  "Clave and African diaspora": "Afro-Caribbean",
  "European dance": "Europe",
  "American groove": "United States",
  "Electronic": "Global",
  "Breakbeat lineage": "United Kingdom",
  "Caribbean": "Caribbean",
  "Duple meter": "Europe",
  "Triple meter": "Europe",
  "Latin American": "Latin America",
  "Balkan & aksak": "Balkans",
  "Compound meter": "Global",
  "Odd meter": "Balkans",
  "Indian classical": "India",
  "West African": "West Africa"
};

// Merges window.EXTRA_RHYTHMS (from rhythm-packs.js) into STYLE_LIBRARY, then
// backfills region/difficulty defaults so every style is safe to display.
function mergeExternalRhythmPacks() {
  const external = (typeof window !== "undefined" && window.EXTRA_RHYTHMS)
    ? window.EXTRA_RHYTHMS
    : (typeof globalThis !== "undefined" && globalThis.EXTRA_RHYTHMS) || {};
  Object.entries(external).forEach(([key, style]) => {
    STYLE_LIBRARY[key] = {
      region: "Global",
      difficulty: "medium",
      ...style,
      meter: style.meter || "4-4",
      tags: style.tags || [],
      principles: style.principles || []
    };
  });
  // Backfill defaults on every style (covers built-ins that predate these fields).
  Object.values(STYLE_LIBRARY).forEach((style) => {
    if (!style.meter) style.meter = "4-4";
    if (!style.region) style.region = FAMILY_REGIONS[style.family] || "Global";
    if (!style.difficulty) {
      const odd = /[57]|11|13/.test(style.meter);
      style.difficulty = odd ? "advanced" : "medium";
    }
  });
}

mergeExternalRhythmPacks();

const PRESET_KEY = "ggl.presets.v1";

const state = {
  pattern: null,
  previousPattern: null,
  isPlaying: false,
  currentStep: -1,
  timerId: null,
  rafId: null,
  audio: null,
  master: null,
  trackGains: {},
  nextStepTime: 0,
  schedStep: 0,
  playheadQueue: [],
  masterVolume: 0.72,
  mixer: Object.fromEntries(TRACKS.map((track) => [track.id, { volume: 0.85, mute: false, solo: false }])),
  // Sample engine
  sampleBuffers: {},     // sound → AudioBuffer (live context)
  sampleRawBuffers: {},  // sound → ArrayBuffer (raw bytes, kept for offline re-decode)
  samplesReady: false,
  activeChoke: {}        // groupId → { source, gain } — for choke logic
};

const els = {
  style: document.getElementById("styleSelect"),
  bars: document.getElementById("barsSelect"),
  meter: document.getElementById("meterSelect"),
  tempo: document.getElementById("tempoRange"),
  complexity: document.getElementById("complexityRange"),
  density: document.getElementById("densityRange"),
  swing: document.getElementById("swingRange"),
  human: document.getElementById("humanRange"),
  generate: document.getElementById("generateButton"),
  mutate: document.getElementById("mutateButton"),
  analyze: document.getElementById("analyzeButton"),
  compare: document.getElementById("compareButton"),
  play: document.getElementById("playButton"),
  playIcon: document.getElementById("playIcon"),
  masterVol: document.getElementById("masterRange"),
  sampleStatus: document.getElementById("sampleStatus"),
  mixer: document.getElementById("mixer"),
  presetSelect: document.getElementById("presetSelect"),
  save: document.getElementById("saveButton"),
  load: document.getElementById("loadButton"),
  delete: document.getElementById("deleteButton"),
  midi: document.getElementById("midiButton"),
  wav: document.getElementById("wavButton"),
  share: document.getElementById("shareButton"),
  grid: document.getElementById("grid"),
  title: document.getElementById("grooveTitle"),
  subtitle: document.getElementById("grooveSubtitle"),
  styleInfo: document.getElementById("styleInfo"),
  stats: document.getElementById("statsStrip"),
  explanation: document.getElementById("explanation"),
  phraseMap: document.getElementById("phraseMap"),
  affinityMap: document.getElementById("affinityMap"),
  toggles: {
    core: document.getElementById("coreToggle"),
    ornament: document.getElementById("ornamentToggle"),
    fill: document.getElementById("fillToggle"),
    texture: document.getElementById("textureToggle"),
    accent: document.getElementById("accentToggle")
  }
};

function populateStyleOptions() {
  const currentValue = els.style.value || "afrocuban";
  const meterKey = els.meter.value || "4-4";
  const availableStyles = Object.entries(STYLE_LIBRARY).filter(([, style]) => style.meter === meterKey);
  const families = availableStyles.reduce((acc, [key, style]) => {
    if (!acc[style.family]) acc[style.family] = [];
    acc[style.family].push([key, style.name]);
    return acc;
  }, {});

  els.style.innerHTML = Object.entries(families).map(([family, styles]) => {
    const options = styles.map(([key, name]) => `<option value="${key}">${name}</option>`).join("");
    return `<optgroup label="${family}">${options}</optgroup>`;
  }).join("");

  const fallback = availableStyles[0] ? availableStyles[0][0] : "afrocuban";
  els.style.value = STYLE_LIBRARY[currentValue] && STYLE_LIBRARY[currentValue].meter === meterKey ? currentValue : fallback;
}

function getMeterInfo(meterKey) {
  return METER_LIBRARY[meterKey] || METER_LIBRARY["4-4"];
}

function applyStyleDefaults() {
  const style = STYLE_LIBRARY[els.style.value];
  if (!style) return;
  els.tempo.value = Math.round((style.tempo[0] + style.tempo[1]) / 2);
  els.swing.value = style.swing;
  updateOutputs();
}

function getSettings() {
  const meter = getMeterInfo(els.meter.value);
  return {
    style: els.style.value,
    bars: Number(els.bars.value),
    meter: els.meter.value,
    meterLabel: meter.label,
    stepsPerBar: meter.stepsPerBar,
    tempo: Number(els.tempo.value),
    complexity: Number(els.complexity.value),
    density: Number(els.density.value),
    swing: Number(els.swing.value),
    human: Number(els.human.value),
    layers: Object.fromEntries(Object.entries(els.toggles).map(([key, input]) => [key, input.checked]))
  };
}

function event(track, step, bar, layer, velocity, reason, flags = {}, stepsPerBar = DEFAULT_STEPS_PER_BAR) {
  const localStep = wrapStep(step, stepsPerBar);
  return {
    id: `${track}-${bar}-${step}-${layer}-${Math.random().toString(16).slice(2)}`,
    track,
    step: bar * stepsPerBar + localStep,
    bar,
    localStep,
    layer,
    velocity,
    reason,
    ghost: Boolean(flags.ghost),
    accent: Boolean(flags.accent),
    fill: layer === "fill" || Boolean(flags.fill)
  };
}

function wrapStep(step, stepsPerBar = DEFAULT_STEPS_PER_BAR) {
  return ((step % stepsPerBar) + stepsPerBar) % stepsPerBar;
}

function pushUnique(events, next) {
  const duplicate = events.find((item) => item.track === next.track && item.step === next.step);
  if (!duplicate) {
    events.push(next);
    return;
  }
  if (next.velocity > duplicate.velocity) {
    Object.assign(duplicate, next);
  }
}

function seededChoice(values, index) {
  return values[index % values.length];
}

function createPattern(settings, mode = "new") {
  const style = STYLE_LIBRARY[settings.style];
  const meter = getMeterInfo(settings.meter);
  const stepsPerBar = meter.stepsPerBar;
  const totalSteps = settings.bars * stepsPerBar;
  const events = [];
  const density = settings.density / 100;
  const complexity = settings.complexity / 100;
  const fillBars = new Set([settings.bars - 1]);
  if (settings.bars >= 8) fillBars.add(Math.floor(settings.bars / 2) - 1);
  if (settings.bars >= 16) fillBars.add(11);

  for (let bar = 0; bar < settings.bars; bar += 1) {
    const phase = getPhase(bar, settings.bars);
    const barEnergy = 0.82 + phase.energy * 0.26;
    const isFillBar = fillBars.has(bar);

    Object.entries(style.seed).forEach(([track, steps]) => {
      steps.forEach((step, index) => {
        const trackInfo = TRACKS.find((item) => item.id === track);
        if (!settings.layers[trackInfo.layer]) return;
        const shouldThin = trackInfo.layer !== "core" && density < 0.52 && (bar + index) % 3 === 0;
        if (shouldThin) return;
        const shifted = applyStyleDisplacement(settings.style, track, step, bar, complexity, mode, stepsPerBar);
        const layer = trackInfo.layer;
        const reason = getReason(style.name, track, shifted, phase.name, layer);
        const accent = meter.accentSteps.includes(shifted) || track === "rim";
        pushUnique(events, event(track, shifted, bar, layer, Math.min(1, 0.62 * barEnergy + (accent ? 0.18 : 0)), reason, { accent }, stepsPerBar));
      });
    });

    if (settings.layers.ornament) {
      addOrnaments(events, settings, style, bar, phase, density, complexity);
    }
    if (settings.layers.accent) {
      addAccents(events, settings, style, bar, phase, complexity);
    }
    if (settings.layers.fill && isFillBar) {
      addFill(events, settings, style, bar, phase, complexity);
    }
  }

  if (settings.layers.texture) {
    addHumanTexture(events, settings, style, totalSteps);
  }

  return {
    id: Date.now(),
    styleKey: settings.style,
    styleName: style.name,
    subtitle: style.subtitle,
    settings,
    meter,
    events: events.sort((a, b) => a.step - b.step || a.track.localeCompare(b.track)),
    phases: buildPhases(settings.bars),
    principles: style.principles,
    totalSteps
  };
}

function getPhase(bar, bars) {
  const position = bar / Math.max(1, bars - 1);
  if (position < 0.25) return { name: "foundation", energy: 0.05 };
  if (position < 0.5) return { name: "variation", energy: 0.32 };
  if (position < 0.78) return { name: "build", energy: 0.62 };
  if (bar === bars - 1) return { name: "release", energy: 0.72 };
  return { name: "peak", energy: 0.85 };
}

function applyStyleDisplacement(styleKey, track, step, bar, complexity, mode, stepsPerBar = DEFAULT_STEPS_PER_BAR) {
  let shift = 0;
  if (complexity > 0.35 && ["kick", "perc", "rim"].includes(track)) {
    if (styleKey === "american" && (bar + step) % 5 === 0) shift = -1;
    if (styleKey === "afrocuban" && track === "perc" && bar % 2 === 1) shift = 1;
    if (styleKey === "salsa" && track === "rim" && bar % 2 === 1) shift = 1;
    if (styleKey === "afrobeat" && track === "perc" && (bar + step) % 4 === 2) shift = 1;
    if (styleKey === "breakbeat" && track === "kick" && bar % 2 === 1) shift = seededChoice([-1, 1], bar + step);
    if (styleKey === "jungle" && track === "snare" && bar % 2 === 1) shift = seededChoice([-1, 1], bar + step);
    if (styleKey === "halftime" && track === "kick" && (bar + step) % 3 === 0) shift = -1;
    if (styleKey === "dub" && track === "rim" && bar % 3 === 2) shift = 1;
    if (styleKey === "dancehall" && track === "perc" && bar % 2 === 0) shift = 1;
    if (styleKey === "electro" && track === "kick" && bar % 2 === 0) shift = -1;
    if (styleKey === "balkan" && track === "rim" && bar % 2 === 1) shift = seededChoice([-1, 1], step);
    if (styleKey === "oddmeter" && ["kick", "rim"].includes(track) && bar % 2 === 1) shift = 1;
  }
  if (mode === "mutate" && track !== "closedHat" && (bar + step) % 4 === 1) {
    shift += seededChoice([-1, 1], bar);
  }
  return wrapStep(step + shift, stepsPerBar);
}

function addOrnaments(events, settings, style, bar, phase, density, complexity) {
  const ornamentCount = Math.round(1 + density * 3 + complexity * 2 + phase.energy * 2);
  const meter = getMeterInfo(settings.meter);
  const stepsPerBar = meter.stepsPerBar;
  const genericOrnaments = [...new Set([
    ...meter.pulseSteps.map((step) => wrapStep(step + 1, stepsPerBar)),
    ...meter.accentSteps.map((step) => wrapStep(step - 1, stepsPerBar)),
    stepsPerBar - 1
  ])].sort((a, b) => a - b);
  const pools = {
    afrocuban: [1, 4, 7, 9, 13, 15],
    salsa: [1, 4, 7, 9, 11, 14],
    afrobeat: [1, 5, 7, 9, 13, 15],
    european: [3, 7, 11, 15],
    disco: [3, 7, 11, 15],
    balkan: [2, 5, 9, 12, 14],
    american: [2, 5, 7, 11, 13, 15],
    jazzswing: [2, 5, 7, 10, 13, 15],
    secondline: [1, 3, 6, 9, 13, 15],
    berlin: [1, 5, 9, 13, 15],
    house: [1, 3, 7, 9, 11, 15],
    electro: [1, 5, 9, 13, 15],
    breakbeat: [1, 6, 9, 13, 14],
    jungle: [1, 5, 9, 13, 14, 15],
    halftime: [3, 5, 11, 13, 15],
    dub: [3, 7, 11, 15],
    dancehall: [1, 6, 8, 11, 13],
    oddmeter: [3, 5, 8, 11, 14],
    minimalism: [7, 11, 15]
  };
  const choices = pools[settings.style] || genericOrnaments;
  for (let i = 0; i < ornamentCount; i += 1) {
    const step = wrapStep(seededChoice(choices, bar + i * 2), stepsPerBar);
    const track = i % 2 === 0 ? "perc" : "openHat";
    pushUnique(events, event(track, step, bar, "ornament", 0.48 + phase.energy * 0.18, `${style.name}: ornament answers the core pulse during ${phase.name}.`, {
      accent: meter.accentSteps.includes(step) || step === stepsPerBar - 1
    }, stepsPerBar));
  }
}

function addAccents(events, settings, style, bar, phase, complexity) {
  const meter = getMeterInfo(settings.meter);
  const stepsPerBar = meter.stepsPerBar;
  const wantsExtra = complexity > 0.42 || phase.energy > 0.5;
  const extraSteps = meter.accentSteps.map((step) => wrapStep(step - 1, stepsPerBar));
  const steps = wantsExtra ? [...new Set([...meter.accentSteps, ...extraSteps, stepsPerBar - 1])] : meter.accentSteps;
  steps.forEach((step, index) => {
    if ((bar + index) % 2 === 0 || phase.energy > 0.65) {
      pushUnique(events, event("rim", step, bar, "accent", 0.56 + phase.energy * 0.24, `${style.name}: accent marker clarifies the ${meter.label} phrase grid.`, { accent: true }, stepsPerBar));
    }
  });
}

function addFill(events, settings, style, bar, phase, complexity) {
  const stepsPerBar = settings.stepsPerBar;
  const fillLength = complexity > 0.55 ? Math.min(6, stepsPerBar) : Math.min(4, stepsPerBar);
  const start = Math.max(0, stepsPerBar - fillLength);
  const fillSteps = Array.from({ length: fillLength }, (_, index) => start + index)
    .filter((step, index) => complexity > 0.55 || index % 2 === 0 || step === stepsPerBar - 1);
  fillSteps.forEach((step, index) => {
    const track = index % 3 === 0 ? "tom" : index % 3 === 1 ? "snare" : "perc";
    pushUnique(events, event(track, step, bar, "fill", 0.68 + index * 0.04, `${style.name}: fill creates release before the next downbeat.`, {
      fill: true,
      accent: index === fillSteps.length - 1
    }, stepsPerBar));
  });
}

function addHumanTexture(events, settings, style, totalSteps) {
  const stepsPerBar = settings.stepsPerBar;
  const ghostEvery = settings.style === "american" ? Math.max(4, Math.round(stepsPerBar / 2)) : stepsPerBar;
  for (let step = ghostEvery - 1; step < totalSteps; step += ghostEvery) {
    const bar = Math.floor(step / stepsPerBar);
    const local = step % stepsPerBar;
    if (settings.human > 10 && settings.layers.core) {
      pushUnique(events, event("snare", local, bar, "texture", 0.24, `${style.name}: ghost note adds motion without changing the main backbeat.`, { ghost: true }, stepsPerBar));
    }
    if (settings.density > 62) {
      pushUnique(events, event("shaker", wrapStep(local + 2, stepsPerBar), bar, "texture", 0.31, `${style.name}: texture keeps subdivision audible through the phrase.`, { ghost: true }, stepsPerBar));
    }
  }
}

function getReason(styleName, track, step, phaseName, layer) {
  const names = {
    kick: "grounds the pulse",
    snare: "defines the backbeat or response point",
    closedHat: "shows subdivision",
    openHat: "opens energy between anchors",
    rim: "marks accent hierarchy",
    tom: "signals transition",
    perc: "adds interlocking motion",
    shaker: "keeps fine-grain time"
  };
  return `${styleName}: ${names[track]} at step ${step + 1} during ${phaseName}; layer is ${layer}.`;
}

function buildPhases(bars) {
  return Array.from({ length: bars }, (_, bar) => {
    const phase = getPhase(bar, bars);
    const descriptions = {
      foundation: "Establish pulse and style grammar.",
      variation: "Add small displacement or ornament.",
      build: "Increase density while preserving anchors.",
      peak: "Hold tension with controlled mutation.",
      release: "Use fill or subtraction to return to bar 1."
    };
    return {
      bar: bar + 1,
      name: phase.name,
      description: descriptions[phase.name]
    };
  });
}

function render(pattern) {
  els.title.textContent = `${pattern.styleName} ${pattern.settings.bars}-bar phrase`;
  els.subtitle.textContent = pattern.subtitle;
  renderStyleInfo(pattern);
  renderStats(pattern);
  renderGrid(pattern);
  renderExplanation(pattern);
  renderPhraseMap(pattern);
  renderAffinityMap(pattern);
  // MELOS-інтеграція: повідомити підписників
  if (typeof window !== "undefined" && window.__MELOS_GGL_PATTERN_LISTENERS__) {
    for (const cb of window.__MELOS_GGL_PATTERN_LISTENERS__) {
      try { cb(pattern); } catch (e) { console.warn("GGL listener:", e); }
    }
  }
}

function renderStyleInfo(pattern) {
  const style = STYLE_LIBRARY[pattern.styleKey];
  const tags = style.tags.slice(0, 4).map((tag) => `<span>${tag}</span>`).join("");
  els.styleInfo.innerHTML = `<article class="style-info-card">
    <strong>${style.name}</strong>
    <p>${style.subtitle}</p>
    <dl>
      <div><dt>Meter</dt><dd>${pattern.meter.label} · ${pattern.meter.feel}</dd></div>
      <div><dt>Family</dt><dd>${style.family}</dd></div>
      <div><dt>Region</dt><dd>${style.region || "Global"}</dd></div>
      <div><dt>Difficulty</dt><dd>${style.difficulty || "medium"}</dd></div>
      <div><dt>Grouping</dt><dd>${pattern.meter.groupText}</dd></div>
    </dl>
    <div class="affinity-tags">${tags}</div>
  </article>`;
}

function renderStats(pattern) {
  const eventCount = pattern.events.length;
  const fillCount = pattern.events.filter((item) => item.fill).length;
  const ghostCount = pattern.events.filter((item) => item.ghost).length;
  const accents = pattern.events.filter((item) => item.accent).length;
  const activeTracks = new Set(pattern.events.map((item) => item.track)).size;
  const stats = [
    ["Meter", `${pattern.meter.label} / ${pattern.meter.feel}`],
    ["Tempo", `${pattern.settings.tempo} BPM`],
    ["Events", eventCount],
    ["Active tracks", activeTracks],
    ["Ghost / fill", `${ghostCount} / ${fillCount}`],
    ["Accents", accents]
  ];
  els.stats.innerHTML = stats.map(([label, value]) => `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`).join("");
}

function renderGrid(pattern) {
  const stepsPerBar = pattern.settings.stepsPerBar;
  const columns = `132px repeat(${pattern.totalSteps}, 24px)`;
  const byTrackStep = new Map(pattern.events.map((item) => [`${item.track}:${item.step}`, item]));
  const barHeaders = Array.from({ length: pattern.totalSteps }, (_, step) => {
    const bar = Math.floor(step / stepsPerBar) + 1;
    const isStart = step % stepsPerBar === 0;
    return `<div class="bar-cell">${isStart ? `Bar ${bar}` : ""}</div>`;
  }).join("");

  const rows = TRACKS.map((track) => {
    const cells = Array.from({ length: pattern.totalSteps }, (_, step) => {
      const hit = byTrackStep.get(`${track.id}:${step}`);
      const local = step % stepsPerBar;
      const bar = Math.floor(step / stepsPerBar);
      const isBeat = pattern.meter.pulseSteps.includes(local);
      const isGroup = pattern.meter.accentSteps.includes(local);
      const isPhraseStart = local === 0;
      const fillZone = bar === pattern.settings.bars - 1 || (pattern.settings.bars >= 8 && bar === Math.floor(pattern.settings.bars / 2) - 1);
      const fillStart = Math.max(0, stepsPerBar - Math.min(6, stepsPerBar));
      const classes = ["step-cell", isBeat ? "beat" : "", isGroup ? "group-boundary" : "", isPhraseStart ? "phrase-start" : "", fillZone && local >= fillStart ? "fill-zone" : ""].filter(Boolean).join(" ");
      const hitMarkup = hit ? `<span class="hit ${hit.layer} ${hit.ghost ? "ghost-note" : ""} ${hit.accent ? "accent-note" : ""}" title="${hit.reason}"></span>` : "";
      return `<div class="${classes}" data-track="${track.id}" data-step="${step}">${hitMarkup}</div>`;
    }).join("");
    return `<div class="row"><div class="label-cell">${track.name}</div>${cells}</div>`;
  }).join("");

  els.grid.innerHTML = `<div class="grid-table" style="grid-template-columns: ${columns}"><div class="row"><div class="label-cell bar-cell corner">Track</div>${barHeaders}</div>${rows}</div>`;
}

function renderExplanation(pattern) {
  const layerCounts = pattern.events.reduce((acc, item) => {
    acc[item.layer] = (acc[item.layer] || 0) + 1;
    return acc;
  }, {});
  const topReasons = summarizeReasons(pattern);
  const principles = pattern.principles.map(([title, text]) => ({ title, text }));
  const items = [
    {
      title: `${pattern.meter.label} meter grammar`,
      text: `${pattern.meter.groupText} This changes the bar length to ${pattern.settings.stepsPerBar} grid steps, so style choices and fills are generated for this meter instead of being squeezed into 4/4.`
    },
    ...principles,
    {
      title: "Phrase development",
      text: `Bars 1-2 establish the grammar, middle bars add variation, and the final bar uses ${layerCounts.fill || 0} fill events to release tension.`
    },
    {
      title: "Layer thinking",
      text: `Core: ${layerCounts.core || 0}, ornaments: ${layerCounts.ornament || 0}, texture: ${layerCounts.texture || 0}, accents: ${layerCounts.accent || 0}, fills: ${layerCounts.fill || 0}.`
    },
    {
      title: "Why it works",
      text: topReasons
    }
  ];
  els.explanation.innerHTML = `<div class="explain-list">${items.map((item) => `<article class="explain-item"><strong>${item.title}</strong><p>${item.text}</p></article>`).join("")}</div>`;
}

function summarizeReasons(pattern) {
  const samples = pattern.events.filter((item) => item.accent || item.fill || item.ghost).slice(0, 4);
  if (!samples.length) return "The pattern keeps anchors readable and uses repetition before variation.";
  return samples.map((item) => item.reason).join(" ");
}

function renderPhraseMap(pattern) {
  els.phraseMap.innerHTML = pattern.phases.map((phase) => (
    `<div class="phase"><div class="phase-number">Bar ${phase.bar}</div><p><strong>${phase.name}</strong><br>${phase.description}</p></div>`
  )).join("");
}

function renderAffinityMap(pattern) {
  const related = getAffinityScores(pattern.styleKey).slice(0, 7);
  const activeTags = STYLE_LIBRARY[pattern.styleKey].tags.slice(0, 6).map((tag) => `<span>${tag}</span>`).join("");
  const items = related.map((item) => {
    const sharedTags = item.sharedTags.slice(0, 4).map((tag) => `<span>${tag}</span>`).join("");
    return `<button class="affinity-style" type="button" data-style="${item.key}" title="${item.reason}">
      <span class="affinity-topline"><strong>${item.name}</strong><em>${item.score}%</em></span>
      <span class="affinity-meter-label">${item.meterLabel}</span>
      <span class="affinity-meter"><i style="width: ${item.score}%"></i></span>
      <span class="affinity-tags">${sharedTags || "<span>contrast</span>"}</span>
      <small>${item.reason}</small>
    </button>`;
  }).join("");

  els.affinityMap.innerHTML = `<div class="affinity-origin">
    <strong>${pattern.styleName}</strong>
    <p>${STYLE_LIBRARY[pattern.styleKey].family} / ${pattern.meter.label}</p>
    <div class="affinity-tags">${activeTags}</div>
  </div>
  <div class="affinity-list">${items}</div>`;
}

function getAffinityScores(styleKey) {
  const source = STYLE_LIBRARY[styleKey];
  const sourceTags = new Set(source.tags);
  const sourceTempo = average(source.tempo);

  return Object.entries(STYLE_LIBRARY)
    .filter(([key]) => key !== styleKey)
    .map(([key, target]) => {
      const sharedTags = target.tags.filter((tag) => sourceTags.has(tag));
      const tagScore = sharedTags.length * 12;
      const familyScore = target.family === source.family ? 18 : 0;
      const meterScore = target.meter === source.meter ? 18 : 0;
      const tempoGap = Math.abs(average(target.tempo) - sourceTempo);
      const tempoScore = Math.max(0, 18 - Math.round(tempoGap / 4));
      const contrastBonus = sharedTags.length === 0 ? 4 : 0;
      const score = Math.min(96, 18 + tagScore + familyScore + meterScore + tempoScore + contrastBonus);

      return {
        key,
        name: target.name,
        meterLabel: getMeterInfo(target.meter).label,
        score,
        sharedTags,
        reason: buildAffinityReason(source, target, sharedTags, tempoGap)
      };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

function buildAffinityReason(source, target, sharedTags, tempoGap) {
  if (target.meter === source.meter && sharedTags.length >= 2) {
    return `Same meter, shared grammar: ${sharedTags.slice(0, 3).join(", ")}.`;
  }
  if (sharedTags.length >= 3) {
    return `Shared grammar: ${sharedTags.slice(0, 3).join(", ")}.`;
  }
  if (target.family === source.family) {
    return `Same family, different accent strategy.`;
  }
  if (tempoGap < 10) {
    return `Similar tempo zone, useful for comparison.`;
  }
  return `Contrast study: different pulse logic.`;
}

function average(range) {
  return (range[0] + range[1]) / 2;
}

function updateOutputs() {
  ["tempo", "complexity", "density", "swing", "human"].forEach((key) => {
    document.getElementById(`${key}Out`).textContent = els[key].value;
  });
  document.getElementById("masterOut").textContent = els.masterVol.value;
}

function generate(mode = "new") {
  state.previousPattern = state.pattern ? structuredClone(state.pattern) : null;
  state.pattern = createPattern(getSettings(), mode);
  render(state.pattern);
}

function comparePatterns() {
  if (!state.previousPattern || !state.pattern) {
    const settings = getSettings();
    const fallbackStyle = getAffinityScores(settings.style).find((item) => STYLE_LIBRARY[item.key].meter === settings.meter) || getAffinityScores(settings.style)[0];
    state.previousPattern = createPattern({ ...settings, style: fallbackStyle ? fallbackStyle.key : settings.style }, "new");
  }
  const current = state.pattern;
  const previous = state.previousPattern;
  const currentSet = new Set(current.events.map((item) => `${item.track}:${item.step}`));
  const previousSet = new Set(previous.events.map((item) => `${item.track}:${item.step}`));
  const shared = [...currentSet].filter((key) => previousSet.has(key)).length;
  const changed = currentSet.size + previousSet.size - shared * 2;
  els.explanation.innerHTML = `<div class="explain-list">
    <article class="explain-item"><strong>Comparison</strong><p>${previous.styleName} and ${current.styleName} share ${shared} exact track-step events. ${changed} events changed, which is where style identity and phrase motion live.</p></article>
    <article class="explain-item"><strong>Pulse difference</strong><p>${previous.subtitle} Compared with: ${current.subtitle}</p></article>
    <article class="explain-item"><strong>Study prompt</strong><p>Listen for anchors first, then ask whether the changed events alter pulse, density, syncopation, or release.</p></article>
  </div>`;
}

function analyzeCurrent() {
  if (!state.pattern) return;
  const pattern = state.pattern;
  const downbeats = pattern.events.filter((item) => pattern.meter.accentSteps.includes(item.localStep)).length;
  const offbeats = pattern.events.filter((item) => pattern.meter.pulseSteps.includes(item.localStep) && !pattern.meter.accentSteps.includes(item.localStep)).length;
  const lateSteps = pattern.events.filter((item) => pattern.meter.accentSteps.some((accent) => item.localStep === wrapStep(accent - 1, pattern.settings.stepsPerBar))).length;
  const fillEvents = pattern.events.filter((item) => item.fill).length;
  const ghostEvents = pattern.events.filter((item) => item.ghost).length;
  const trackSummary = TRACKS.map((track) => {
    const count = pattern.events.filter((item) => item.track === track.id).length;
    return `${track.name}: ${count}`;
  }).join(", ");

  els.explanation.innerHTML = `<div class="explain-list">
    <article class="explain-item"><strong>Current groove analysis</strong><p>${pattern.styleName} in ${pattern.meter.label} has ${pattern.events.length} events across ${pattern.settings.bars} bars. Meter accents: ${downbeats}. Secondary pulse points: ${offbeats}. Lead-in syncopations: ${lateSteps}.</p></article>
    <article class="explain-item"><strong>Meter map</strong><p>${pattern.meter.groupText}</p></article>
    <article class="explain-item"><strong>Function map</strong><p>${trackSummary}.</p></article>
    <article class="explain-item"><strong>Risk zones</strong><p>${fillEvents} fill events and ${ghostEvents} ghost notes are present. If the groove feels crowded, remove ornaments before removing kick or snare anchors.</p></article>
  </div>`;
}

function toggleStep(trackId, step) {
  if (!state.pattern) return;
  const existingIndex = state.pattern.events.findIndex((item) => item.track === trackId && item.step === step);
  if (existingIndex >= 0) {
    state.pattern.events.splice(existingIndex, 1);
  } else {
    const track = TRACKS.find((item) => item.id === trackId);
    const stepsPerBar = state.pattern.settings.stepsPerBar;
    const bar = Math.floor(step / stepsPerBar);
    const localStep = step % stepsPerBar;
    const accent = state.pattern.meter.accentSteps.includes(localStep);
    pushUnique(state.pattern.events, event(trackId, localStep, bar, track.layer, accent ? 0.86 : 0.58, `User edit: ${track.name} added to study layer interaction.`, {
      accent,
      ghost: track.layer === "texture"
    }, stepsPerBar));
  }
  state.pattern.events.sort((a, b) => a.step - b.step || a.track.localeCompare(b.track));
  render(state.pattern);
}

const LOOKAHEAD = 0.12;
const SCHEDULER_INTERVAL = 25;

function initAudio() {
  if (state.audio) return;
  // MELOS PoC: використати спільний AudioContext, якщо переданий через window-hook.
  state.audio = (typeof window !== "undefined" && window.__MELOS_GGL_AUDIO_CTX__)
    ? window.__MELOS_GGL_AUDIO_CTX__
    : new (window.AudioContext || window.webkitAudioContext)();
  state.master = state.audio.createGain();
  state.master.connect(state.audio.destination);
  buildAudioGraph(state.audio, state.master);
  state.trackGains = state.liveTrackGains;
  applyMixer();
  // Kick off sample loading in the background; synthesis is the immediate fallback.
  loadSamples(state.audio).then(updateSampleStatus).catch(() => updateSampleStatus());
  updateSampleStatus();
}

// Fetches and decodes all drum samples for the given AudioContext.
// Keeps raw ArrayBuffers so they can be re-decoded for OfflineAudioContext (WAV export).
async function loadSamples(ctx) {
  const entries = Object.entries(SAMPLE_MAP);
  await Promise.allSettled(entries.map(async ([sound, url]) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.arrayBuffer();
    state.sampleRawBuffers[sound] = raw;
    state.sampleBuffers[sound] = await ctx.decodeAudioData(raw.slice());
  }));
  state.samplesReady = Object.keys(state.sampleBuffers).length === entries.length;
}

function updateSampleStatus() {
  if (!els.sampleStatus) return;
  const loaded = Object.keys(state.sampleBuffers).length;
  const total = Object.keys(SAMPLE_MAP).length;
  if (loaded === total) {
    els.sampleStatus.textContent = "● samples";
    els.sampleStatus.dataset.state = "ready";
  } else if (loaded > 0) {
    els.sampleStatus.textContent = `▲ ${loaded}/${total}`;
    els.sampleStatus.dataset.state = "partial";
  } else {
    els.sampleStatus.textContent = "◌ synth";
    els.sampleStatus.dataset.state = "synth";
  }
}

// Plays a drum sound using a pre-loaded sample with choke-group support.
// Falls back to synthesis if the sample is not yet loaded.
function playSample(ctx, sound, time, velocity, dest) {
  const buffer = state.sampleBuffers[sound];
  if (!buffer) {
    createVoice(ctx, sound, time, velocity, dest);
    return;
  }
  const group = CHOKE_GROUP[sound];
  // Cut off any ringing source in the same choke group (e.g. closed hat stops open hat).
  if (group && state.activeChoke[group]) {
    const prev = state.activeChoke[group];
    try {
      prev.gain.gain.cancelScheduledValues(time);
      prev.gain.gain.setTargetAtTime(0.0001, time, 0.004);
    } catch (e) { /* source already ended */ }
    state.activeChoke[group] = null;
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(Math.max(0.0001, velocity), time);
  src.connect(gain).connect(dest);
  src.start(time);
  if (group) {
    state.activeChoke[group] = { source: src, gain };
    src.onended = () => {
      if (state.activeChoke[group] && state.activeChoke[group].source === src) {
        state.activeChoke[group] = null;
      }
    };
  }
}

// Builds master -> per-track gain nodes for a context. Returns the track gain map.
function buildAudioGraph(ctx, master) {
  const gains = {};
  TRACKS.forEach((track) => {
    const gain = ctx.createGain();
    gain.connect(master);
    gains[track.id] = gain;
  });
  if (ctx === state.audio) state.liveTrackGains = gains;
  return gains;
}

// Computes effective per-track gain given volume, mute, and any active solo.
function trackLevel(trackId) {
  const mix = state.mixer[trackId];
  const soloActive = Object.values(state.mixer).some((m) => m.solo);
  if (mix.mute) return 0;
  if (soloActive && !mix.solo) return 0;
  return mix.volume;
}

function applyMixer() {
  if (state.master) state.master.gain.value = state.masterVolume;
  if (!state.trackGains) return;
  TRACKS.forEach((track) => {
    const node = state.trackGains[track.id];
    if (node) node.gain.value = trackLevel(track.id);
  });
}

function whiteNoise(ctx, duration) {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

// Synthesizes a single drum voice into `dest` at time `t`. Context-agnostic so it
// works for both live (AudioContext) and offline (OfflineAudioContext) rendering.
function createVoice(ctx, sound, t, velocity, dest) {
  const v = Math.max(0.001, velocity);

  if (sound === "kick") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(155, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.11);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.95 * v, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    osc.connect(gain).connect(dest);
    osc.start(t);
    osc.stop(t + 0.28);
    // attack click
    const click = ctx.createBufferSource();
    click.buffer = whiteNoise(ctx, 0.02);
    const clickFilter = ctx.createBiquadFilter();
    clickFilter.type = "highpass";
    clickFilter.frequency.value = 1200;
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.5 * v, t);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
    click.connect(clickFilter).connect(clickGain).connect(dest);
    click.start(t);
    click.stop(t + 0.03);
    return;
  }

  if (sound === "snare") {
    const noise = ctx.createBufferSource();
    noise.buffer = whiteNoise(ctx, 0.2);
    const nf = ctx.createBiquadFilter();
    nf.type = "highpass";
    nf.frequency.value = 1500;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(0.6 * v, t + 0.003);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    noise.connect(nf).connect(ng).connect(dest);
    noise.start(t);
    noise.stop(t + 0.2);
    // tonal body
    [185, 278].forEach((freq) => {
      const osc = ctx.createOscillator();
      const og = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);
      og.gain.setValueAtTime(0.0001, t);
      og.gain.exponentialRampToValueAtTime(0.28 * v, t + 0.004);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      osc.connect(og).connect(dest);
      osc.start(t);
      osc.stop(t + 0.1);
    });
    return;
  }

  if (sound === "hat" || sound === "openHat" || sound === "shaker") {
    const decay = sound === "openHat" ? 0.3 : sound === "shaker" ? 0.06 : 0.045;
    const noise = ctx.createBufferSource();
    noise.buffer = whiteNoise(ctx, decay + 0.05);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = sound === "shaker" ? 5200 : 7800;
    const peak = sound === "openHat" ? 0.26 : sound === "shaker" ? 0.2 : 0.24;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(peak * v, t + 0.004);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    noise.connect(hp).connect(ng).connect(dest);
    noise.start(t);
    noise.stop(t + decay + 0.05);
    return;
  }

  if (sound === "rim") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 1700;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.32 * v, t + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    osc.connect(gain).connect(dest);
    osc.start(t);
    osc.stop(t + 0.05);
    return;
  }

  if (sound === "tom") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.16);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.5 * v, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(gain).connect(dest);
    osc.start(t);
    osc.stop(t + 0.22);
    return;
  }

  // perc (conga-like)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(420, t);
  osc.frequency.exponentialRampToValueAtTime(300, t + 0.06);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.34 * v, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  osc.connect(gain).connect(dest);
  osc.start(t);
  osc.stop(t + 0.14);
}

// Swing offset for a 16th-note step, scaled so max slider approaches a triplet feel.
function swingOffset(localStep, secondsPerStep, swing) {
  return localStep % 2 === 1 ? secondsPerStep * (swing / 100) * 0.55 : 0;
}

function startPlayback() {
  if (!state.pattern) generate();
  initAudio();
  // resume() MUST be called synchronously inside the user-gesture handler.
  // This is the critical requirement for iOS Safari.
  state.audio.resume();
  applyMixer();
  state.isPlaying = true;
  els.playIcon.textContent = "Stop";
  state.schedStep = 0;
  state.nextStepTime = state.audio.currentTime + 0.1;
  state.playheadQueue = [];
  state.timerId = setInterval(scheduler, SCHEDULER_INTERVAL);
  scheduler();
  state.rafId = requestAnimationFrame(drawPlayhead);
}

function stopPlayback() {
  state.isPlaying = false;
  els.playIcon.textContent = "Play";
  clearInterval(state.timerId);
  cancelAnimationFrame(state.rafId);
  state.currentStep = -1;
  state.playheadQueue = [];
  highlightStep(-1);
}

// Lookahead scheduler: queues every step that falls inside the lookahead window,
// using precise AudioContext clock times instead of setTimeout drift.
function scheduler() {
  if (!state.isPlaying || !state.pattern) return;
  // Auto-resume if the AudioContext was suspended (common on Android after tab switch).
  if (state.audio && state.audio.state === "suspended") {
    state.audio.resume();
    return; // reschedule on next interval tick once context is running
  }
  const pattern = state.pattern;
  const secondsPerStep = 60 / pattern.settings.tempo / 4;
  state.schedStep %= pattern.totalSteps; // guard against pattern length changes mid-play
  while (state.nextStepTime < state.audio.currentTime + LOOKAHEAD) {
    scheduleStepAt(state.schedStep, state.nextStepTime, secondsPerStep);
    state.nextStepTime += secondsPerStep;
    state.schedStep = (state.schedStep + 1) % pattern.totalSteps;
  }
}

function scheduleStepAt(step, time, secondsPerStep) {
  const pattern = state.pattern;
  const local = step % pattern.settings.stepsPerBar;
  const swing = swingOffset(local, secondsPerStep, pattern.settings.swing);
  pattern.events.forEach((item) => {
    if (item.step !== step) return;
    const track = TRACKS.find((entry) => entry.id === item.track);
    const drift = (Math.random() - 0.5) * (pattern.settings.human / 1000);
    const dest = state.trackGains[item.track] || state.master;
    playSample(state.audio, track.sound, time + swing + drift, item.velocity * (item.ghost ? 0.55 : 1), dest);
  });
  state.playheadQueue.push({ step, time });
}

// Visual playhead, decoupled from audio scheduling and driven by the audio clock.
function drawPlayhead() {
  if (!state.isPlaying) return;
  const now = state.audio.currentTime;
  while (state.playheadQueue.length && state.playheadQueue[0].time <= now) {
    state.currentStep = state.playheadQueue.shift().step;
    highlightStep(state.currentStep);
  }
  state.rafId = requestAnimationFrame(drawPlayhead);
}

function highlightStep(step) {
  els.grid.querySelectorAll(".current").forEach((cell) => cell.classList.remove("current"));
  if (step < 0) return;
  els.grid.querySelectorAll(`[data-step="${step}"]`).forEach((cell) => cell.classList.add("current"));
}

/* ---------- Mixer UI ---------- */

function buildMixer() {
  els.mixer.innerHTML = TRACKS.map((track) => {
    const mix = state.mixer[track.id];
    return `<div class="mixer-row" data-track="${track.id}">
      <span class="mix-name" title="${track.name}">${track.name}</span>
      <input type="range" min="0" max="100" value="${Math.round(mix.volume * 100)}" aria-label="${track.name} volume" />
      <button type="button" class="mix-btn ${mix.mute ? "active" : ""}" data-kind="mute" title="Mute ${track.name}">M</button>
      <button type="button" class="mix-btn ${mix.solo ? "active" : ""}" data-kind="solo" title="Solo ${track.name}">S</button>
    </div>`;
  }).join("");
}

function refreshMixerButtons() {
  els.mixer.querySelectorAll(".mixer-row").forEach((row) => {
    const mix = state.mixer[row.dataset.track];
    row.querySelector('[data-kind="mute"]').classList.toggle("active", mix.mute);
    row.querySelector('[data-kind="solo"]').classList.toggle("active", mix.solo);
  });
}

/* ---------- Presets (localStorage) ---------- */

function getPresets() {
  try {
    return JSON.parse(localStorage.getItem(PRESET_KEY) || "{}");
  } catch (err) {
    return {};
  }
}

function setPresets(presets) {
  localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
}

function refreshPresetOptions(selected = "") {
  const presets = getPresets();
  const names = Object.keys(presets).sort((a, b) => a.localeCompare(b));
  els.presetSelect.innerHTML = `<option value="">Saved patterns…</option>` +
    names.map((name) => `<option value="${name}">${name}</option>`).join("");
  els.presetSelect.value = selected;
}

function snapshot() {
  return {
    settings: getSettings(),
    masterVolume: state.masterVolume,
    mixer: structuredClone(state.mixer),
    events: state.pattern ? state.pattern.events.map((e) => ({ ...e })) : []
  };
}

function savePreset() {
  const name = (window.prompt("Pattern name", `${state.pattern.styleName} ${state.pattern.settings.bars}-bar`) || "").trim();
  if (!name) return;
  const presets = getPresets();
  presets[name] = snapshot();
  setPresets(presets);
  refreshPresetOptions(name);
}

function applySnapshot(snap, { keepEvents = true } = {}) {
  const s = snap.settings;
  els.meter.value = s.meter;
  populateStyleOptions();
  els.style.value = s.style;
  els.bars.value = String(s.bars);
  els.tempo.value = s.tempo;
  els.complexity.value = s.complexity;
  els.density.value = s.density;
  els.swing.value = s.swing;
  els.human.value = s.human;
  Object.entries(s.layers).forEach(([key, on]) => {
    if (els.toggles[key]) els.toggles[key].checked = on;
  });
  if (typeof snap.masterVolume === "number") {
    state.masterVolume = snap.masterVolume;
    els.masterVol.value = Math.round(snap.masterVolume * 100);
  }
  if (snap.mixer) {
    state.mixer = { ...state.mixer, ...structuredClone(snap.mixer) };
  }
  buildMixer();
  updateOutputs();
  applyMixer();
  state.pattern = createPattern(getSettings(), "new");
  if (keepEvents && snap.events && snap.events.length) {
    state.pattern.events = snap.events.map((e) => ({ ...e }))
      .sort((a, b) => a.step - b.step || a.track.localeCompare(b.track));
  }
  render(state.pattern);
}

function loadPreset() {
  const name = els.presetSelect.value;
  if (!name) return;
  const preset = getPresets()[name];
  if (preset) applySnapshot(preset);
}

function deletePreset() {
  const name = els.presetSelect.value;
  if (!name) return;
  const presets = getPresets();
  delete presets[name];
  setPresets(presets);
  refreshPresetOptions();
}

/* ---------- Share link ---------- */

function copyShareLink() {
  const payload = { settings: getSettings(), masterVolume: state.masterVolume, mixer: state.mixer };
  const hash = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const url = `${location.origin}${location.pathname}#g=${hash}`;
  const done = () => {
    els.share.textContent = "Copied!";
    setTimeout(() => { els.share.textContent = "Copy link"; }, 1400);
  };
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(done, () => window.prompt("Copy link", url));
  } else {
    window.prompt("Copy link", url);
  }
}

function applyShareHash() {
  if (!location.hash.startsWith("#g=")) return false;
  try {
    const json = decodeURIComponent(escape(atob(location.hash.slice(3))));
    applySnapshot(JSON.parse(json), { keepEvents: false });
    return true;
  } catch (err) {
    return false;
  }
}

/* ---------- Download helper ---------- */

function download(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeFileName() {
  const p = state.pattern;
  return `${p.styleKey}-${p.settings.meter}-${p.settings.bars}bar`.replace(/[^a-z0-9-]/gi, "");
}

/* ---------- MIDI export (Standard MIDI File, type 0) ---------- */

const MIDI_NOTES = {
  kick: 36, snare: 38, closedHat: 42, openHat: 46, rim: 37, tom: 45, perc: 64, shaker: 70
};
const MIDI_PPQ = 480;

function variableLength(value) {
  const bytes = [value & 0x7f];
  value >>= 7;
  while (value > 0) {
    bytes.unshift((value & 0x7f) | 0x80);
    value >>= 7;
  }
  return bytes;
}

function exportMIDI() {
  const p = state.pattern;
  const ticksPerStep = MIDI_PPQ / 4; // every grid step is a 16th note
  const noteEvents = [];
  p.events.forEach((item) => {
    const note = MIDI_NOTES[item.track];
    if (note == null) return;
    const start = item.step * ticksPerStep;
    const velocity = Math.max(1, Math.min(127, Math.round(item.velocity * (item.ghost ? 0.55 : 1) * 127)));
    noteEvents.push({ tick: start, on: true, note, velocity });
    noteEvents.push({ tick: start + Math.round(ticksPerStep * 0.5), on: false, note, velocity: 0 });
  });
  noteEvents.sort((a, b) => a.tick - b.tick || (a.on === b.on ? 0 : a.on ? 1 : -1));

  const track = [];
  // tempo meta
  const usPerBeat = Math.round(60000000 / p.settings.tempo);
  track.push(...variableLength(0), 0xff, 0x51, 0x03, (usPerBeat >> 16) & 0xff, (usPerBeat >> 8) & 0xff, usPerBeat & 0xff);
  // track name meta
  const name = `Groove Grammar Lab - ${p.styleName}`.split("").map((c) => c.charCodeAt(0) & 0x7f);
  track.push(...variableLength(0), 0xff, 0x03, ...variableLength(name.length), ...name);

  let last = 0;
  noteEvents.forEach((ev) => {
    const delta = ev.tick - last;
    last = ev.tick;
    track.push(...variableLength(delta), ev.on ? 0x99 : 0x89, ev.note, ev.velocity); // channel 10 (index 9)
  });
  track.push(...variableLength(0), 0xff, 0x2f, 0x00); // end of track

  const header = [
    0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06,
    0x00, 0x00, // format 0
    0x00, 0x01, // one track
    (MIDI_PPQ >> 8) & 0xff, MIDI_PPQ & 0xff
  ];
  const trackHeader = [0x4d, 0x54, 0x72, 0x6b,
    (track.length >> 24) & 0xff, (track.length >> 16) & 0xff, (track.length >> 8) & 0xff, track.length & 0xff];
  const bytes = new Uint8Array([...header, ...trackHeader, ...track]);
  download(`${safeFileName()}.mid`, new Blob([bytes], { type: "audio/midi" }));
}

/* ---------- WAV export (offline render of one phrase cycle) ---------- */

async function exportWAV() {
  const p = state.pattern;
  const sampleRate = 44100;
  const secondsPerStep = 60 / p.settings.tempo / 4;
  const duration = p.totalSteps * secondsPerStep + 0.6;
  const ctx = new OfflineAudioContext(2, Math.ceil(duration * sampleRate), sampleRate);
  const master = ctx.createGain();
  master.gain.value = state.masterVolume;
  master.connect(ctx.destination);
  const gains = buildAudioGraph(ctx, master);
  TRACKS.forEach((track) => { gains[track.id].gain.value = trackLevel(track.id); });

  // Re-decode raw sample buffers for the offline context (AudioBuffers are context-specific).
  const offlineSamples = {};
  await Promise.allSettled(
    Object.entries(state.sampleRawBuffers).map(async ([sound, raw]) => {
      offlineSamples[sound] = await ctx.decodeAudioData(raw.slice());
    })
  );

  p.events.forEach((item) => {
    const track = TRACKS.find((entry) => entry.id === item.track);
    const local = item.step % p.settings.stepsPerBar;
    const time = item.step * secondsPerStep + swingOffset(local, secondsPerStep, p.settings.swing);
    const vel = item.velocity * (item.ghost ? 0.55 : 1);
    const dest = gains[item.track];
    const buf = offlineSamples[track.sound];
    if (buf) {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(Math.max(0.0001, vel), time);
      src.connect(gain).connect(dest);
      src.start(time);
    } else {
      createVoice(ctx, track.sound, time, vel, dest);
    }
  });

  els.wav.textContent = "Rendering…";
  const buffer = await ctx.startRendering();
  download(`${safeFileName()}.wav`, encodeWav(buffer));
  els.wav.textContent = "Export WAV";
}

function encodeWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const frames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = frames * blockAlign;
  const arr = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arr);
  const writeStr = (offset, str) => { for (let i = 0; i < str.length; i += 1) view.setUint8(offset + i, str.charCodeAt(i)); };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 8 * bytesPerSample, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  const channels = Array.from({ length: numChannels }, (_, c) => buffer.getChannelData(c));
  let offset = 44;
  for (let i = 0; i < frames; i += 1) {
    for (let c = 0; c < numChannels; c += 1) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([arr], { type: "audio/wav" });
}

function installHandlers() {
  document.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", () => {
      updateOutputs();
      if (input.id === "masterRange") {
        state.masterVolume = Number(els.masterVol.value) / 100;
        applyMixer();
        return;
      }
      if (input.id === "meterSelect") {
        populateStyleOptions();
        applyStyleDefaults();
        generate("new");
        return;
      }
      if (input.id === "styleSelect") {
        applyStyleDefaults();
        generate("new");
        return;
      }
      if (input.id === "barsSelect") {
        generate("new");
      }
    });
  });
  els.generate.addEventListener("click", () => generate("new"));
  els.mutate.addEventListener("click", () => generate("mutate"));
  els.analyze.addEventListener("click", analyzeCurrent);
  els.compare.addEventListener("click", comparePatterns);
  els.play.addEventListener("click", () => {
    if (state.isPlaying) stopPlayback();
    else startPlayback();
  });
  els.grid.addEventListener("click", (event) => {
    const cell = event.target.closest(".step-cell");
    if (!cell || !cell.dataset.track) return;
    toggleStep(cell.dataset.track, Number(cell.dataset.step));
  });
  // Mobile: unlock AudioContext on any touch (covers very old iOS and Android Chrome quirks).
  document.addEventListener("touchstart", () => {
    if (state.audio && state.audio.state === "suspended") state.audio.resume();
  }, { passive: true, once: false });

  // Resume AudioContext when the tab regains visibility (e.g. user switches back on Android).
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && state.audio && state.audio.state === "suspended") {
      state.audio.resume();
    }
  });

  els.affinityMap.addEventListener("click", (event) => {
    const button = event.target.closest("[data-style]");
    if (!button) return;
    const targetStyle = STYLE_LIBRARY[button.dataset.style];
    if (!targetStyle) return;
    els.meter.value = targetStyle.meter;
    populateStyleOptions();
    els.style.value = button.dataset.style;
    applyStyleDefaults();
    generate("new");
  });

  els.mixer.addEventListener("input", (event) => {
    const row = event.target.closest(".mixer-row");
    if (!row || event.target.type !== "range") return;
    state.mixer[row.dataset.track].volume = Number(event.target.value) / 100;
    applyMixer();
  });
  els.mixer.addEventListener("click", (event) => {
    const btn = event.target.closest(".mix-btn");
    if (!btn) return;
    const trackId = btn.closest(".mixer-row").dataset.track;
    state.mixer[trackId][btn.dataset.kind] = !state.mixer[trackId][btn.dataset.kind];
    refreshMixerButtons();
    applyMixer();
  });

  els.save.addEventListener("click", savePreset);
  els.load.addEventListener("click", loadPreset);
  els.delete.addEventListener("click", deletePreset);
  els.midi.addEventListener("click", exportMIDI);
  els.wav.addEventListener("click", () => { exportWAV().catch(() => { els.wav.textContent = "Export WAV"; }); });
  els.share.addEventListener("click", copyShareLink);
  els.presetSelect.addEventListener("change", loadPreset);
}

// MELOS-інтеграція: bootstrap винесено у функцію, щоб re-mount після dispose() працював.
// На першому import модуль регіструє mount у window-hook. createGroove() викликає його
// після того, як skeleton (із потрібними DOM-id) уже в документі.
function mountGroove() {
  // Скинути state, якщо повторно монтуємось після dispose().
  if (state.isPlaying) stopPlayback();
  state.pattern = null;
  state.previousPattern = null;
  state.audio = state.audio || null;     // лишаємо створений ctx живим
  // Перебудувати посилання на DOM-елементи (skeleton щойно вставлений).
  for (const key of Object.keys(els)) {
    if (key === "toggles") {
      els.toggles.core = document.getElementById("coreToggle");
      els.toggles.ornament = document.getElementById("ornamentToggle");
      els.toggles.fill = document.getElementById("fillToggle");
      els.toggles.texture = document.getElementById("textureToggle");
      els.toggles.accent = document.getElementById("accentToggle");
    } else {
      const id = els[key]?.id || idForKey(key);
      if (id) els[key] = document.getElementById(id);
    }
  }
  populateStyleOptions();
  buildMixer();
  installHandlers();
  refreshPresetOptions();
  applyStyleDefaults();
  updateOutputs();
  if (!applyShareHash()) {
    generate("new");
  }
}

// Мапа ключів els → DOM-id (для повторного перерезолву).
function idForKey(key) {
  const map = {
    style: "styleSelect", bars: "barsSelect", meter: "meterSelect",
    tempo: "tempoRange", complexity: "complexityRange", density: "densityRange",
    swing: "swingRange", human: "humanRange", generate: "generateButton",
    mutate: "mutateButton", analyze: "analyzeButton", compare: "compareButton",
    play: "playButton", playIcon: "playIcon", masterVol: "masterRange",
    sampleStatus: "sampleStatus", mixer: "mixer", presetSelect: "presetSelect",
    save: "saveButton", load: "loadButton", delete: "deleteButton",
    midi: "midiButton", wav: "wavButton", share: "shareButton",
    grid: "grid", title: "grooveTitle", subtitle: "grooveSubtitle",
    styleInfo: "styleInfo", stats: "statsStrip", explanation: "explanation",
    phraseMap: "phraseMap", affinityMap: "affinityMap",
  };
  return map[key];
}

if (typeof window !== "undefined") {
  window.__MELOS_GGL_MOUNT__ = mountGroove;
  // Pattern API для двостороннього обміну з MELOS.
  window.__MELOS_GGL_PATTERN_LISTENERS__ = window.__MELOS_GGL_PATTERN_LISTENERS__ || new Set();
  window.__MELOS_GGL_GET_PATTERN__ = () => state.pattern;
  window.__MELOS_GGL_ON_PATTERN__ = (cb) => {
    window.__MELOS_GGL_PATTERN_LISTENERS__.add(cb);
    if (state.pattern) cb(state.pattern); // одразу подати поточний
    return () => window.__MELOS_GGL_PATTERN_LISTENERS__.delete(cb);
  };
}


# MELOS — Melody Composition Mentor

> **Pedagogy-first melody composition trainer.** Desktop app (Tauri+React+Tone.js) for learning how to write melodies with real-time analysis, harmonic guidance, and interactive ear training.

🎵 **[Live demo](https://rafthouse.github.io/MELOS/)** | 📘 [Architecture](./docs/ARCHITECTURE.md)

## What is MELOS?

MELOS is an interactive music education platform built around **composition as pedagogy**. Rather than generating melodies, it teaches *you* to write them—with structured guidance, real-time feedback, and deep musical analysis.

### Core Features

#### 🎼 **Mode Explorer** (`M1`)
- All 7 modes (Ionian, Dorian, Phrygian, etc.) in all 12 tonics
- Voice leading rules, melodic contours, and mode-specific idioms
- Interactive reference library with curated musical citations

#### 🎹 **Composer's Lab** (`M2` / `M8`)
- Piano-roll editor (48 PPQ tick resolution)
- Measure editor, time signature control
- Real-time harmonic analysis & cliché detection
- Variation panel (style-based transformations)
- MIDI import/export, project persistence

#### 🎯 **Motif Workshop** (`M3`)
- Extract and analyze melodic DNA
- Rhythm DNA, contour DNA, intervallic DNA
- Theme + variation framework

#### 🥁 **Rhythm Designer** (`M5`)
- Percussion synthesis + drum pattern editor
- 8-sound kit (kick, snare, tom, hihat, rim, perc, shaker)
- Groove library integration

#### 🎸 **Groove Lab** (`GGL`)
- Interactive drum machine with 16-step sequencer
- Swing, syncopation, feel manipulation
- Pattern-to-bass linking via Groove-Bass Lab

#### 🎙️ **Ear Training** (`M4`)
- Spaced repetition system (ts-fsrs) for interval recognition
- Mode recognition, cadence listening, harmonic progression ear training
- Customizable practice sets

#### 📚 **Reference Library** (`M9`)
- Searchable database of musical examples
- Links to pedagogical analysis and music theory principles

---

## Tech Stack

- **Framework:** Tauri (Rust) + React 18 + TypeScript
- **Audio Engine:** Tone.js, smplr (sampler)
- **Music Theory:** Tonal.js, Vexflow (notation)
- **Scheduling:** ts-fsrs (spaced repetition)
- **Data Persistence:** localStorage (projects), IndexedDB (soundfont cache)
- **Build:** Vite, pnpm monorepo

### Monorepo Structure

```
MELOS/
├── apps/
│   └── web/                    # React SPA (Vite)
├── packages/
│   ├── data/                   # Mode data, scale lookups
│   ├── core-theory/            # Music theory fundamentals
│   ├── core-analysis/          # Harmonic analysis, voice leading
│   ├── core-pedagogy/          # Learning objectives, assessment
│   ├── motif/                  # Melodic DNA extraction
│   ├── harmony/                # Chord generation, harmonization
│   ├── variation/              # Style-based transformations
│   ├── groove-lab/             # Drum sequencer (GGL integration)
│   ├── groove-bass/            # Bass + groove synchronization
│   ├── audio/                  # Tone.js wrappers, synthesis
│   ├── srs/                    # Spaced repetition (ts-fsrs)
│   └── ui/                     # Shared React components, theming
└── docs/                       # GitHub Pages (built from apps/web/dist)
```

---

## Quick Start

### Development

```bash
# Install dependencies
cd apps/web
npm install

# Start dev server (localhost:5173)
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

### Deployment

Build is automatically pushed to `docs/` and deployed to GitHub Pages:

```bash
npm run build
cp -r apps/web/dist/* docs/
git add docs/ && git commit -m "Deploy MELOS"
git push origin master
```

Live at: **[https://rafthouse.github.io/MELOS/](https://rafthouse.github.io/MELOS/)**

---

## Features by Module

| Module | Status | Description |
|--------|--------|-------------|
| **Mode Explorer (M1)** | ✅ | 7 modes × 12 tonics + idiom reference |
| **Composer's Lab (M2)** | ✅ | Piano-roll, harmonic analysis, MIDI I/O |
| **Motif Workshop (M3)** | ✅ | Melodic DNA extraction & analysis |
| **Ear Training (M4)** | ✅ | Spaced repetition + interval/mode practice |
| **Rhythm Designer (M5)** | ✅ | 8-voice percussion synth + pattern editor |
| **Harmony Advisor (M8)** | ✅ | Real-time chord suggestions + voice leading |
| **Anti-Banality** | ✅ | Cliché detection & predictability scoring |
| **Groove Lab (GGL)** | ✅ | 16-step drum sequencer + swing control |
| **Groove-Bass Lab** | ✅ | Synchronized bass + groove interaction |
| **Project Persistence** | ✅ | localStorage (sessions), export MIDI/MusicXML |
| **Variation Panel** | ✅ | Style-based melodic transformations |

---

## Performance Notes

- **Bundle size:** 2020 kB (615 kB gzip)
- **Modules:** 2373 transformed (Vite)
- **Audio:** Tone.js + Web Audio lookahead for sample-accurate playback
- **Soundfont cache:** IndexedDB for offline use

Chunk size warnings are suppressed; the single large bundle trades code splitting for instant interaction in a learning context.

---

## Documentation

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — System design, pedagogical principles, data flow
- **[GROOVE-BASS-LAB.md](./docs/GROOVE-BASS-LAB.md)** — Groove-Bass synchronization deep dive
- **[GROOVE-BASS-TAXONOMY.md](./docs/GROOVE-BASS-TAXONOMY.md)** — Bass line classification system

---

## Supported Tonics & Modes

**Tonics (equal temperament):**
- C, C#/Db, D, D#/Eb, E, F, F#/Gb, G, G#/Ab, A, A#/Bb, B

**Modes:**
1. Ionian (Major)
2. Dorian
3. Phrygian
4. Lydian
5. Mixolydian
6. Aeolian (Natural Minor)
7. Locrian

---

## License

Educational software. Built with ❤️ for music learners.

---

## Author

[Rafthouse](https://github.com/Rafthouse) — Irish bouzouki player, music pedagogy enthusiast.

---

**Last updated:** June 4, 2026

import { useState, useMemo } from "react";
import { MODES, getMode, getCitation } from "@melos/data";
import {
  createScale,
  pitchFromMidi,
  melodyFromEvents,
  type Melody,
} from "@melos/core-theory";
import { generateVariants } from "@melos/motif";
import { TonicSelector } from "./TonicSelector";
import { MeterControls } from "./MeterControls";
import { PianoRoll, type PRNote, type Meter, PPQ, ticksPerBeat } from "./PianoRoll";
import { playMelodyTimed } from "../playTimed";
import { INSTRUMENTS, type InstrumentName } from "../player";

export interface LabSeed {
  notes: PRNote[];
  modeId: string;
  tonic: string;
  meter: Meter;
  bars: number;
}

interface Props {
  onCiteClick?: (id: string) => void;
  onSendToLab?: (seed: LabSeed) => void;
}

export function MotifWorkshop({ onCiteClick, onSendToLab }: Props) {
  const [modeId, setModeId] = useState("ionian");
  const [tonic, setTonic] = useState("C");
  const [motifNotes, setMotifNotes] = useState<PRNote[]>([]);
  const [bars, setBars] = useState(2);
  const [meter, setMeter] = useState<Meter>({ num: 4, den: 4 });
  const [instrument, setInstrument] = useState<InstrumentName>("piano");
  const [bpm, setBpm] = useState(100);

  const mode = getMode(modeId) ?? MODES[0]!;
  const scale = useMemo(
    () => createScale(mode.id, mode.formula, tonic),
    [mode.id, mode.formula, tonic],
  );
  const scaleChromas = useMemo(() => new Set(scale.chromas), [scale]);
  const beatsPerBar = (meter.num * ticksPerBeat(meter.den)) / PPQ;

  const motif = useMemo(
    () =>
      melodyFromEvents(
        motifNotes.map((n) => ({
          pitch: pitchFromMidi(n.midi),
          onset: n.startTick / PPQ,
          duration: n.lenTick / PPQ,
        })),
        beatsPerBar,
      ),
    [motifNotes, beatsPerBar],
  );

  const variants = useMemo(
    () => (motif.notes.length >= 2 ? generateVariants(motif, scale) : []),
    [motif, scale],
  );

  const toSeed = (m: Melody): LabSeed => {
    const notes: PRNote[] = m.notes.map((n) => ({
      midi: n.pitch.midi,
      startTick: Math.round(n.onset * PPQ),
      lenTick: Math.max(1, Math.round(n.duration * PPQ)),
    }));
    const maxTick = notes.reduce((mx, n) => Math.max(mx, n.startTick + n.lenTick), 0);
    const ticksBar = meter.num * ticksPerBeat(meter.den);
    return { notes, modeId, tonic, meter, bars: Math.max(1, Math.ceil(maxTick / ticksBar)) };
  };

  return (
    <div className="motif">
      <header className="lab__header">
        <h1 className="lab__title">Motif Workshop</h1>
        <p className="text-secondary lab__subtitle">
          Намалюйте короткий мотив — MELOS розвине його різними техніками, кожну з
          поясненням і джерелом. Будь-який варіант можна відкрити в Composer's Lab.
        </p>
      </header>

      <div className="lab__context">
        <select className="select" value={modeId} onChange={(e) => setModeId(e.target.value)}>
          {MODES.map((m) => (
            <option key={m.id} value={m.id}>{m.names.uk}</option>
          ))}
        </select>
        <TonicSelector value={tonic} onChange={setTonic} />
        <MeterControls bars={bars} meter={meter} onBars={setBars} onMeter={setMeter} />
      </div>

      <PianoRoll
        scaleChromas={scaleChromas}
        tonicChroma={scale.tonicChroma}
        bars={bars}
        meter={meter}
        notes={motifNotes}
        onChange={setMotifNotes}
      />

      <div className="lab__transport">
        <button
          className="btn btn--play"
          onClick={() => playMelodyTimed(motif, bpm, instrument)}
          disabled={motif.notes.length === 0}
        >
          ▶ Мотив
        </button>
        <label className="toggle">
          BPM
          <input
            type="number"
            className="lab__bpm"
            min={40}
            max={220}
            value={bpm}
            onChange={(e) => setBpm(Math.max(40, Math.min(220, Number(e.target.value) || 100)))}
          />
        </label>
        <select
          className="select"
          value={instrument}
          onChange={(e) => setInstrument(e.target.value as InstrumentName)}
        >
          {INSTRUMENTS.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
        </select>
        <span className="text-secondary lab__count">{motif.notes.length} нот у мотиві</span>
      </div>

      <section className="motif__variants">
        <h3 className="info-block__title">
          Розвинені варіанти {variants.length > 0 ? `(${variants.length})` : ""}
        </h3>
        {motif.notes.length < 2 ? (
          <p className="text-secondary">Намалюйте мотив із принаймні двох нот.</p>
        ) : (
          <ul className="variant-list">
            {variants.map((v) => (
              <li key={v.technique} className="variant">
                <div className="variant__head">
                  <button
                    className="btn btn--small variant__play"
                    onClick={() => playMelodyTimed(v.melody, bpm, instrument)}
                  >▶</button>
                  <span className="variant__label">{v.label.uk}</span>
                  <code className="variant__tech text-secondary">{v.technique}</code>
                  {onSendToLab && (
                    <button
                      className="btn btn--small variant__tolab"
                      onClick={() => onSendToLab(toSeed(v.melody))}
                      title="Відкрити цей варіант у Composer's Lab"
                    >→ Lab</button>
                  )}
                </div>
                <div className="variant__expl">{v.explanation.uk}</div>
                <div className="critique__cites">
                  {v.citationIds.map((id) => {
                    const c = getCitation(id);
                    if (!c) return null;
                    return (
                      <button
                        key={id}
                        className="cite-chip cite-chip--link"
                        title={`${c.authors.join(", ")} (${c.year}). ${c.title}`}
                        onClick={() => onCiteClick?.(id)}
                      >
                        {c.authors[0]?.split(" ").slice(-1)[0]} {c.year}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

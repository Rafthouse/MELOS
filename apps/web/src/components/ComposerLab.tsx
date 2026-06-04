import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { MODES, getMode } from "@melos/data";
import {
  createScale,
  pitchFromMidi,
  melodyFromEvents,
} from "@melos/core-theory";
import { analyzeMelody, analyzeBanality, analyzeEarworm } from "@melos/core-analysis";
import { explainAll, type ExplainedFinding } from "@melos/core-pedagogy";
import { TonicSelector } from "./TonicSelector";
import { PianoRoll, type PRNote, type Meter, PPQ, ticksPerBeat } from "./PianoRoll";
import { NotationView } from "./NotationView";
import { MeterControls } from "./MeterControls";
import { HarmonizationPanel } from "./HarmonizationPanel";
import { VariationPanel } from "./VariationPanel";
import { HitDnaCard } from "./HitDnaCard";
import type { Melody } from "@melos/core-theory";
import type { LabSeed } from "./MotifWorkshop";
import type { GroovePattern } from "@melos/groove-lab";
import { downloadMidi, downloadMusicXML } from "../export";
import { midiFileToMelody } from "../import";
import { listProjects, saveProject, loadProject, deleteProject } from "../projects";
import {
  playMelody, stopAll, isPlaying, getPlayheadSeconds,
  INSTRUMENTS, type InstrumentName,
} from "../player";

const SEVERITY_LABEL: Record<string, string> = {
  warning: "увага",
  suggestion: "порада",
  info: "довідка",
};

interface Props {
  onCiteClick?: (id: string) => void;
  seed?: LabSeed | null;
  onSeedConsumed?: () => void;
  /** Поточний drum-pattern із GrooveLab (поза-Composer стан). */
  drumPattern?: GroovePattern | null;
}

export function ComposerLab({ onCiteClick, seed, onSeedConsumed, drumPattern }: Props) {
  const [modeId, setModeId] = useState("ionian");
  const [tonic, setTonic] = useState("C");
  const [prNotes, setPrNotes] = useState<PRNote[]>([]);
  const [bpm, setBpm] = useState(100);
  const [bars, setBars] = useState(4);
  const [meter, setMeter] = useState<Meter>({ num: 4, den: 4 });
  const [editorView, setEditorView] = useState<"roll" | "score">("roll");
  const [instrument, setInstrument] = useState<InstrumentName>("piano");
  const [metronome, setMetronome] = useState(false);
  const [projName, setProjName] = useState("");
  const [projects, setProjects] = useState<string[]>([]);
  const [selectedProj, setSelectedProj] = useState("");
  const [playheadTick, setPlayheadTick] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  // Завантажити мелодію, передану з Motif Workshop.
  useEffect(() => {
    if (!seed) return;
    setPrNotes(seed.notes);
    setModeId(seed.modeId);
    setTonic(seed.tonic);
    setMeter(seed.meter);
    setBars(seed.bars);
    onSeedConsumed?.();
  }, [seed, onSeedConsumed]);

  const mode = getMode(modeId) ?? MODES[0]!;
  const scale = useMemo(
    () => createScale(mode.id, mode.formula, tonic),
    [mode.id, mode.formula, tonic],
  );

  const scaleChromas = useMemo(() => new Set(scale.chromas), [scale]);

  // Доль (чвертей) у такті для аналізу/нотації.
  const beatsPerBar = (meter.num * ticksPerBeat(meter.den)) / PPQ;

  // Мелодія з тіків: onset/duration у долях = тіки / PPQ.
  const melody = useMemo(() => {
    return melodyFromEvents(
      prNotes.map((n) => ({
        pitch: pitchFromMidi(n.midi),
        onset: n.startTick / PPQ,
        duration: n.lenTick / PPQ,
      })),
      beatsPerBar,
    );
  }, [prNotes, beatsPerBar]);

  const findings: ExplainedFinding[] = useMemo(() => {
    if (melody.notes.length < 2) return [];
    const earworm = analyzeEarworm(melody);
    return explainAll([
      ...analyzeMelody(melody, { scale, subdivision: PPQ }),
      ...analyzeBanality(melody, scale),
      ...(earworm ? [earworm] : []),
    ]);
  }, [melody, scale]);

  // Проєкти (localStorage).
  useEffect(() => setProjects(listProjects()), []);

  const handleSaveProject = useCallback(() => {
    const name = projName.trim();
    if (!name) return;
    saveProject(name, { modeId, tonic, meter, bars, bpm, instrument, notes: prNotes });
    setProjects(listProjects());
    setSelectedProj(name);
  }, [projName, modeId, tonic, meter, bars, bpm, instrument, prNotes]);

  const handleLoadProject = useCallback(() => {
    if (!selectedProj) return;
    const p = loadProject(selectedProj);
    if (!p) return;
    setModeId(p.modeId);
    setTonic(p.tonic);
    setMeter(p.meter);
    setBars(p.bars);
    setBpm(p.bpm);
    setInstrument(p.instrument);
    setPrNotes(p.notes);
    setProjName(selectedProj);
  }, [selectedProj]);

  const handleDeleteProject = useCallback(() => {
    if (!selectedProj) return;
    deleteProject(selectedProj);
    setProjects(listProjects());
    setSelectedProj("");
  }, [selectedProj]);

  const applyVariation = useCallback((mel: Melody) => {
    setPrNotes(
      mel.notes.map((n) => ({
        midi: n.pitch.midi,
        startTick: Math.round(n.onset * PPQ),
        lenTick: Math.max(1, Math.round(n.duration * PPQ)),
      })),
    );
  }, []);

  const [importMsg, setImportMsg] = useState<string | null>(null);
  const handleImportMidi = useCallback(async (file: File) => {
    try {
      const buf = await file.arrayBuffer();
      const parsed = midiFileToMelody(new Uint8Array(buf));
      const notes = parsed.melody.notes.map((n) => ({
        midi: n.pitch.midi,
        startTick: Math.round(n.onset * PPQ),
        lenTick: Math.max(1, Math.round(n.duration * PPQ)),
      }));
      setPrNotes(notes);
      setBpm(parsed.bpm);
      // підлаштувати кількість тактів
      const maxTick = notes.reduce((mx, n) => Math.max(mx, n.startTick + n.lenTick), 0);
      const ticksBar = meter.num * (PPQ * 4 / meter.den);
      setBars(Math.max(1, Math.ceil(maxTick / ticksBar)));
      setImportMsg(`Імпортовано ${notes.length} нот · ${parsed.bpm} BPM${parsed.voices > 1 ? " · моно-редукція з ≥2 голосів" : ""}`);
      setTimeout(() => setImportMsg(null), 4000);
    } catch (err) {
      setImportMsg(`Помилка імпорту: ${(err as Error).message}`);
      setTimeout(() => setImportMsg(null), 4000);
    }
  }, [meter]);

  const stopRaf = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setPlayheadTick(null);
  }, []);

  const handlePlay = useCallback(async () => {
    if (melody.notes.length === 0) return;
    await playMelody(melody, { bpm, instrument, metronome, beatsPerBar });
    const tick = () => {
      if (!isPlaying()) { stopRaf(); return; }
      setPlayheadTick(getPlayheadSeconds() * (bpmRef.current / 60) * PPQ);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [melody, bpm, instrument, metronome, beatsPerBar, stopRaf]);

  const handleStop = useCallback(() => {
    stopAll();
    stopRaf();
  }, [stopRaf]);

  useEffect(() => stopRaf, [stopRaf]);

  return (
    <div className="lab">
      <header className="lab__header">
        <h1 className="lab__title">Composer's Lab</h1>
        <p className="text-secondary lab__subtitle">
          Малюйте ноти в піано-ролі — задавайте і висоту, і тривалість. Критика
          (зокрема ритм) оновлюється в реальному часі.
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

      <div className="project-bar">
        <span className="text-secondary">Проєкт:</span>
        <input
          className="meter__input project-bar__name"
          placeholder="назва"
          value={projName}
          onChange={(e) => setProjName(e.target.value)}
        />
        <button className="btn btn--small" onClick={handleSaveProject} disabled={!projName.trim()}>Зберегти</button>
        <select className="select" value={selectedProj} onChange={(e) => setSelectedProj(e.target.value)}>
          <option value="">— збережені —</option>
          {projects.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button className="btn btn--small" onClick={handleLoadProject} disabled={!selectedProj}>Завантажити</button>
        <button className="btn btn--small" onClick={handleDeleteProject} disabled={!selectedProj}>Видалити</button>
      </div>

      <div className="editor-switch">
        <button
          className={"editor-switch__btn" + (editorView === "roll" ? " editor-switch__btn--active" : "")}
          onClick={() => setEditorView("roll")}
        >Піано-рол</button>
        <button
          className={"editor-switch__btn" + (editorView === "score" ? " editor-switch__btn--active" : "")}
          onClick={() => setEditorView("score")}
        >Ноти</button>
      </div>

      {editorView === "roll" ? (
        <PianoRoll
          scaleChromas={scaleChromas}
          tonicChroma={scale.tonicChroma}
          bars={bars}
          meter={meter}
          notes={prNotes}
          onChange={setPrNotes}
          playheadTick={playheadTick}
        />
      ) : melody.notes.length > 0 ? (
        <NotationView melody={melody} scale={scale} meter={meter} />
      ) : (
        <p className="text-secondary editor-empty">Намалюйте мелодію в піано-ролі — тут з'явиться нотний стан.</p>
      )}

      <div className="lab__transport">
        <button className="btn btn--play" onClick={handlePlay} disabled={melody.notes.length === 0}>
          ▶ Програти
        </button>
        <button className="btn" onClick={handleStop}>■ Стоп</button>
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
          title="Інструмент (саундфонт)"
        >
          {INSTRUMENTS.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
        </select>
        <label className="toggle">
          <input type="checkbox" checked={metronome} onChange={(e) => setMetronome(e.target.checked)} />
          Метроном
        </label>
        <span className="text-secondary lab__count">{melody.notes.length} нот</span>
      </div>

      <div className="lab__export">
        <span className="text-secondary">Експорт:</span>
        <button className="btn btn--small" onClick={() => downloadMidi(melody, bpm)} disabled={melody.notes.length === 0}>MIDI</button>
        <button className="btn btn--small" onClick={() => downloadMusicXML(melody, scale, meter)} disabled={melody.notes.length === 0}>MusicXML</button>
        <span className="text-secondary" style={{ marginLeft: "auto" }}>Імпорт:</span>
        <label className="btn btn--small" style={{ cursor: "pointer" }}>
          MIDI
          <input
            type="file"
            accept=".mid,.midi,audio/midi"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImportMidi(f);
              e.target.value = "";
            }}
          />
        </label>
        {importMsg && <span className="text-stable" style={{ fontSize: "var(--text-xs)" }}>{importMsg}</span>}
      </div>

      <section className="lab__critique">
        <h3 className="info-block__title">Аналіз ({findings.length})</h3>
        {melody.notes.length < 2 ? (
          <p className="text-secondary">Додайте принаймні дві ноти для аналізу.</p>
        ) : (
          <ul className="critique-list">
            {findings.map((f, i) => (
              <li key={i} className={`critique critique--${f.severity}`}>
                <div className="critique__head">
                  <span className="critique__sev">{SEVERITY_LABEL[f.severity]}</span>
                  <span className="critique__kind text-secondary">{f.kind}</span>
                </div>
                <div className="critique__msg">{f.message.uk}</div>
                <div className="critique__cites">
                  {f.citations.map((c) => (
                    <button
                      key={c.id}
                      className="cite-chip cite-chip--link"
                      title={`${c.authors.join(", ")} (${c.year}). ${c.title}`}
                      onClick={() => onCiteClick?.(c.id)}
                    >
                      {c.authors[0]?.split(" ").slice(-1)[0]} {c.year}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <HitDnaCard melody={melody} scale={scale} meter={meter} drumPattern={drumPattern} onCiteClick={onCiteClick} />

      <HarmonizationPanel
        melody={melody}
        scale={scale}
        beatsPerBar={beatsPerBar}
        bpm={bpm}
        instrument={instrument}
        onCiteClick={onCiteClick}
      />

      <VariationPanel
        melody={melody}
        scale={scale}
        bpm={bpm}
        instrument={instrument}
        onApply={applyVariation}
      />
    </div>
  );
}

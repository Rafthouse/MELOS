import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { RHYTHMIC_CELLS, getCitation } from "@melos/data";
import { melodyFromEvents, pitch } from "@melos/core-theory";
import { analyzeSyncopation, syncopationIndex } from "@melos/core-analysis";
import { playRhythm, stopAll, getPlayheadSeconds, isPlaying } from "../player";

const BEATS_PER_BAR = 4;

interface Props {
  onCiteClick?: (id: string) => void;
}

export function RhythmDesigner({ onCiteClick }: Props) {
  const [steps, setSteps] = useState<number[]>(() => new Array(16).fill(0));
  const [swing, setSwing] = useState(0);
  const [bpm, setBpm] = useState(100);
  const [playStep, setPlayStep] = useState(-1);
  const rafRef = useRef<number | null>(null);

  const sub = steps.length / BEATS_PER_BAR; // 16→4, 32→8

  const melody = useMemo(() => {
    const active = steps.map((v, i) => ({ v, i })).filter((x) => x.v > 0);
    if (active.length === 0) return null;
    const events = active.map((x, k) => {
      const next = active[k + 1];
      const endStep = next ? next.i : steps.length;
      return { pitch: pitch("C4"), onset: x.i / sub, duration: Math.max(1, endStep - x.i) / sub };
    });
    return melodyFromEvents(events, BEATS_PER_BAR);
  }, [steps, sub]);

  const index = melody ? syncopationIndex(melody, sub) : 0;
  const groove = melody ? analyzeSyncopation(melody, sub) : null;
  const activeCount = steps.filter((s) => s > 0).length;
  const density = activeCount > 0 ? index / activeCount : 0;
  const zone = index === 0 ? "straight" : density <= 1.6 ? "groove" : "high";

  const cycle = (i: number) =>
    setSteps((s) => s.map((v, j) => (j === i ? (v + 1) % 3 : v)));

  const loadCell = (cellSteps: number[]) => {
    stopAll();
    setPlayStep(-1);
    setSteps([...cellSteps]);
  };

  const setLength = (len: number) => {
    stopAll();
    setPlayStep(-1);
    setSteps(new Array(len).fill(0));
  };

  const stopRaf = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setPlayStep(-1);
  }, []);

  const handlePlay = useCallback(async () => {
    if (!melody) return;
    await playRhythm(steps, bpm, sub, BEATS_PER_BAR, swing, 4);
    const stepSec = 60 / bpm / sub;
    const tick = () => {
      if (!isPlaying()) { stopRaf(); return; }
      setPlayStep(Math.floor(getPlayheadSeconds() / stepSec) % steps.length);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [steps, bpm, sub, swing, melody, stopRaf]);

  const handleStop = useCallback(() => { stopAll(); stopRaf(); }, [stopRaf]);
  useEffect(() => stopRaf, [stopRaf]);

  return (
    <div className="rd">
      <header className="lab__header">
        <h1 className="lab__title">Rhythm Designer</h1>
        <p className="text-secondary lab__subtitle">
          Намалюйте ритм (клік: пауза → удар → акцент) — MELOS оцінює грувність у
          реальному часі (зона Vuust «Goldilocks»). Завантажте класичну фігуру з бібліотеки.
        </p>
      </header>

      <div className="rd__controls">
        <div className="rd__len">
          <button className={"pr__chip" + (steps.length === 16 ? " pr__chip--active" : "")} onClick={() => setLength(16)}>16</button>
          <button className={"pr__chip" + (steps.length === 32 ? " pr__chip--active" : "")} onClick={() => setLength(32)}>32</button>
        </div>
        <button className="btn btn--play" onClick={handlePlay} disabled={!melody}>▶ Програти</button>
        <button className="btn" onClick={handleStop}>■ Стоп</button>
        <label className="toggle">BPM
          <input type="number" className="lab__bpm" min={40} max={220} value={bpm}
            onChange={(e) => setBpm(Math.max(40, Math.min(220, Number(e.target.value) || 100)))} />
        </label>
        <label className="rd__swing">Свінг
          <input type="range" min={0} max={60} value={Math.round(swing * 100)}
            onChange={(e) => setSwing(Number(e.target.value) / 100)} />
          <span className="text-secondary">{Math.round(swing * 100)}%</span>
        </label>
      </div>

      <div className="rd__grid" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
        {steps.map((v, i) => (
          <button
            key={i}
            className={
              "rd__cell" +
              (v === 1 ? " rd__cell--hit" : v === 2 ? " rd__cell--accent" : "") +
              (i % sub === 0 ? " rd__cell--beat" : "") +
              (i === playStep ? " rd__cell--play" : "")
            }
            onClick={() => cycle(i)}
          />
        ))}
      </div>

      {/* Грувність */}
      <section className={"rd__groove rd__groove--" + zone}>
        <div className="rd__groove-row">
          <span className="rd__groove-index">Синкопованість: {index}</span>
          <span className="rd__groove-zone">
            {zone === "straight" ? "рівно (без синкопи)" : zone === "groove" ? "зона грувності ✓" : "надсинкоповано"}
          </span>
        </div>
        {groove && <div className="rd__groove-msg">{groove.message.uk}</div>}
        {groove && (
          <div className="critique__cites">
            {groove.citationIds.map((id) => {
              const c = getCitation(id);
              if (!c) return null;
              return (
                <button key={id} className="cite-chip cite-chip--link"
                  title={`${c.authors.join(", ")} (${c.year}). ${c.title}`}
                  onClick={() => onCiteClick?.(id)}>
                  {c.authors[0]?.split(" ").slice(-1)[0]} {c.year}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Бібліотека */}
      <section className="rd__library">
        <h3 className="info-block__title">Бібліотека ритмічних фігур</h3>
        <ul className="rd__cells">
          {RHYTHMIC_CELLS.map((cell) => (
            <li key={cell.id} className="rd__cellbtn">
              <button className="btn btn--small" onClick={() => loadCell(cell.steps)}>{cell.names.uk}</button>
              <span className="rd__cell-region text-secondary">{cell.region.uk}</span>
              <div className="rd__cell-note text-secondary">{cell.note.uk}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

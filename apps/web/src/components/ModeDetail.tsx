import { useState, useCallback } from "react";
import type { ModeDefinition } from "@melos/data";
import { createScale } from "@melos/core-theory";
import { initAudio, playScale, playNote, stopPlayback, type ScaleDirection } from "@melos/audio";
import { TonicSelector } from "./TonicSelector";
import { ScaleView } from "./ScaleView";
import { CADENCE_LABELS } from "../labels";

interface Props {
  mode: ModeDefinition;
  tonic: string;
  onTonicChange: (t: string) => void;
}

export function ModeDetail({ mode, tonic, onTonicChange }: Props) {
  const [playing, setPlaying] = useState(false);
  const [drone, setDrone] = useState(false);
  const [direction, setDirection] = useState<ScaleDirection>("ascending-descending");

  const handlePlayScale = useCallback(async () => {
    await initAudio();
    const scale = createScale(mode.id, mode.formula, tonic);
    setPlaying(true);
    playScale(scale, 4, {
      direction,
      drone,
      onComplete: () => setPlaying(false),
    });
  }, [mode, tonic, direction, drone]);

  const handleStop = useCallback(() => {
    stopPlayback();
    setPlaying(false);
  }, []);

  const handlePlayDegree = useCallback(async (noteName: string, octave: number) => {
    await initAudio();
    playNote(`${noteName}${octave}`, "4n", { instrument: "bell" });
  }, []);

  return (
    <article className="mode-detail">
      <header className="mode-detail__header">
        <h1 className="mode-detail__title">{mode.names.uk}</h1>
        <p className="mode-detail__en text-secondary">{mode.names.en}</p>
        {mode.aliases.length > 0 && (
          <p className="mode-detail__aliases text-secondary">
            також: {mode.aliases.join(" · ")}
          </p>
        )}
      </header>

      {/* Тоніка + транспорт */}
      <div className="mode-detail__controls">
        <div className="control-row">
          <span className="control-label text-secondary">Тоніка</span>
          <TonicSelector value={tonic} onChange={onTonicChange} />
        </div>

        <div className="control-row">
          <button
            className="btn btn--play"
            onClick={playing ? handleStop : handlePlayScale}
          >
            {playing ? "■ Стоп" : "▶ Програти гаму"}
          </button>

          <label className="toggle">
            <input
              type="checkbox"
              checked={drone}
              onChange={(e) => setDrone(e.target.checked)}
            />
            Дрон тоніки
          </label>

          <select
            className="select"
            value={direction}
            onChange={(e) => setDirection(e.target.value as ScaleDirection)}
          >
            <option value="ascending-descending">Вгору і вниз</option>
            <option value="ascending">Тільки вгору</option>
            <option value="descending">Тільки вниз</option>
          </select>
        </div>
      </div>

      {/* Ноти гами */}
      <ScaleView mode={mode} tonic={tonic} onPlayDegree={handlePlayDegree} />

      {/* Характеристичні ступені */}
      {mode.characteristicDegrees.length > 0 && (
        <section className="info-block info-block--analysis">
          <h3 className="info-block__title">Характеристичні ступені</h3>
          <ul className="info-block__list">
            {mode.characteristicDegrees.map((cd) => (
              <li key={cd.degree}>
                <span className="degree-badge">{cd.degree}</span>
                {cd.label.uk}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Контекст */}
      <section className="info-block">
        <h3 className="info-block__title">Контекст</h3>
        <dl className="context-grid">
          <dt>Емоційний</dt>
          <dd>{mode.context.emotional.uk}</dd>
          <dt>Географічний</dt>
          <dd>{mode.context.geographic.uk}</dd>
          <dt>Історичний</dt>
          <dd>{mode.context.historical.uk}</dd>
        </dl>
      </section>

      {/* Гармонія + каденції */}
      <div className="info-row">
        {mode.typicalHarmony.length > 0 && (
          <section className="info-block">
            <h3 className="info-block__title">Типова гармонія</h3>
            <ul className="info-block__list">
              {mode.typicalHarmony.map((h, i) => (
                <li key={i}>
                  <code className="font-mono roman">{h.roman}</code>
                  <span className="text-secondary"> — {h.label.uk}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {mode.typicalCadences.length > 0 && (
          <section className="info-block">
            <h3 className="info-block__title">Типові каденції</h3>
            <ul className="info-block__list">
              {mode.typicalCadences.map((c, i) => (
                <li key={i}>
                  <span className="text-stable">{CADENCE_LABELS[c.kind] ?? c.kind}</span>
                  <span className="text-secondary"> — {c.label.uk}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Канонічні приклади */}
      {mode.canonicalExamples.length > 0 && (
        <section className="info-block">
          <h3 className="info-block__title">Канонічні приклади</h3>
          <ul className="examples">
            {mode.canonicalExamples.map((ex, i) => (
              <li key={i} className="example">
                <span className="example__title">{ex.title}</span>
                <span className="text-secondary"> — {ex.source.uk}</span>
                {ex.year && <span className="text-secondary"> ({ex.year})</span>}
                <div className="example__note text-secondary">{ex.note.uk}</div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

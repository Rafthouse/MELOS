import { useMemo } from "react";
import type { Melody, Scale } from "@melos/core-theory";
import { generateVariations } from "@melos/variation";
import { playMelodyTimed } from "../playTimed";
import type { InstrumentName } from "../player";

interface Props {
  melody: Melody;
  scale: Scale;
  bpm: number;
  instrument: InstrumentName;
  onApply: (melody: Melody) => void;
}

export function VariationPanel({ melody, scale, bpm, instrument, onApply }: Props) {
  const variations = useMemo(
    () => (melody.notes.length >= 2 ? generateVariations(melody, scale) : []),
    [melody, scale],
  );

  return (
    <section className="harm">
      <h3 className="info-block__title">Варіації за стилями {variations.length > 0 ? `(${variations.length})` : ""}</h3>
      {melody.notes.length < 2 ? (
        <p className="text-secondary">Додайте мелодію (≥2 ноти) — MELOS запропонує стильові варіації.</p>
      ) : (
        <ul className="harm-list">
          {variations.map((v) => (
            <li key={v.id} className="variation-row">
              <div className="harm-style__head">
                <button
                  className="btn btn--small harm-style__play"
                  onClick={() => playMelodyTimed(v.melody, bpm, instrument)}
                  title="Програти варіацію"
                >▶</button>
                <span className="harm-style__label">{v.label.uk}</span>
                <span className="harm-style__desc text-secondary">{v.markers.uk}</span>
                <button
                  className="btn btn--small variant__tolab"
                  onClick={() => onApply(v.melody)}
                  title="Завантажити варіацію в піано-рол"
                >→ редактор</button>
              </div>
              <div className="harm-style__expl">{v.changes.uk}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

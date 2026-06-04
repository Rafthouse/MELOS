import { useMemo } from "react";
import type { Melody, Scale } from "@melos/core-theory";
import { harmonize } from "@melos/harmony";
import { getCitation } from "@melos/data";
import { playChords, type InstrumentName } from "../player";

interface Props {
  melody: Melody;
  scale: Scale;
  beatsPerBar: number;
  bpm: number;
  instrument: InstrumentName;
  onCiteClick?: (id: string) => void;
}

export function HarmonizationPanel({ melody, scale, beatsPerBar, bpm, instrument, onCiteClick }: Props) {
  const harmonizations = useMemo(
    () => (melody.notes.length >= 2 ? harmonize(melody, scale, beatsPerBar) : []),
    [melody, scale, beatsPerBar],
  );

  if (melody.notes.length < 2) {
    return (
      <section className="harm">
        <h3 className="info-block__title">Гармонізація</h3>
        <p className="text-secondary">Додайте мелодію (≥2 ноти) — MELOS запропонує гармонізації.</p>
      </section>
    );
  }
  if (scale.cardinality < 7) {
    return (
      <section className="harm">
        <h3 className="info-block__title">Гармонізація</h3>
        <p className="text-secondary">Гармонізація доступна для 7-нотних ладів.</p>
      </section>
    );
  }

  return (
    <section className="harm">
      <h3 className="info-block__title">Гармонізація ({harmonizations.length} стилі)</h3>
      <ul className="harm-list">
        {harmonizations.map((h) => (
          <li key={h.id} className="harm-style">
            <div className="harm-style__head">
              <button
                className="btn btn--small harm-style__play"
                onClick={() => playChords(h.chords, bpm, instrument, beatsPerBar)}
                title="Програти акорди"
              >▶</button>
              <span className="harm-style__label">{h.label.uk}</span>
              <span className="harm-style__desc text-secondary">{h.description.uk}</span>
            </div>
            <div className="harm-style__chords">
              {h.chords.map((c, i) => (
                <span key={i} className="harm-chord" title={`ступінь ${c.degree} · ${c.quality}`}>
                  {c.roman}
                </span>
              ))}
            </div>
            <div className="harm-style__expl">{h.explanation.uk}</div>
            <div className="critique__cites">
              {h.citationIds.map((id) => {
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
    </section>
  );
}

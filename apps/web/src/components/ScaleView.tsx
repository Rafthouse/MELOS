import { useMemo } from "react";
import type { ModeDefinition } from "@melos/data";
import { createScale, intervalFromSemitones } from "@melos/core-theory";

interface Props {
  mode: ModeDefinition;
  tonic: string;
  onPlayDegree?: (noteName: string, octave: number) => void;
}

/**
 * Показує ноти гами як ряд «клавіш».
 * Характеристичні ступені підсвічені бурштиновим (Dusty Amber).
 * Під кожною нотою — інтервал від тоніки (affect-тег у tooltip).
 */
export function ScaleView({ mode, tonic, onPlayDegree }: Props) {
  const scale = useMemo(
    () => createScale(mode.id, mode.formula, tonic),
    [mode.id, mode.formula, tonic],
  );

  const charDegrees = new Set(mode.characteristicDegrees.map((c) => c.degree));

  return (
    <div className="scale-view">
      <div className="scale-view__notes">
        {scale.noteNames.map((note, i) => {
          const degree = i + 1;
          const isChar = charDegrees.has(degree);
          const iv = intervalFromSemitones(mode.formula[i]!);
          return (
            <button
              key={`${note}-${i}`}
              className={
                "scale-note" + (isChar ? " scale-note--characteristic" : "")
              }
              title={`Ступінь ${degree} · ${iv.name} від тоніки · ${iv.affect.uk}`}
              onClick={() => onPlayDegree?.(note, 4)}
            >
              <span className="scale-note__degree">{degree}</span>
              <span className="scale-note__name">{note}</span>
              <span className="scale-note__interval">{iv.name}</span>
            </button>
          );
        })}
      </div>
      <div className="scale-view__formula">
        <span className="text-secondary">Формула (семітони): </span>
        <code className="font-mono">{mode.formula.join(" · ")}</code>
      </div>
    </div>
  );
}

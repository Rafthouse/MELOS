import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import {
  createGroove, type GrooveInstance, type GroovePattern,
} from "@melos/groove-lab";
import "@melos/groove-lab/styles.css";

/**
 * Groove Grammar Lab — повна інтеграція (C-варіант).
 *  C1: re-mountable mountGroove()
 *  C2: CSS scoped під .ggl-root
 *  C3: pattern API (onPatternChange) проброшено в MELOS
 *  C4/C5: pattern → DrumDna → HitDnaCard
 */
interface Props {
  /** Колбек у App: оновити glob-стан барабанного pattern. */
  onPatternChange?: (pattern: GroovePattern) => void;
}

export function GrooveLab({ onPatternChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const instRef = useRef<GrooveInstance | null>(null);
  const cbRef = useRef(onPatternChange);
  cbRef.current = onPatternChange;
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const div = ref.current;
    if (!div) return;
    let cancelled = false;
    (async () => {
      try {
        const ctx = Tone.getContext().rawContext as unknown as AudioContext;
        const inst = await createGroove(div, {
          audioContext: ctx,
          onPatternChange: (p) => cbRef.current?.(p),
        });
        if (!cancelled) instRef.current = inst;
      } catch (e) {
        if (!cancelled) setErr(String((e as Error).message ?? e));
      }
    })();
    return () => {
      cancelled = true;
      instRef.current?.dispose();
      instRef.current = null;
    };
  }, []);

  return (
    <div className="groove-host">
      <div className="groove-host__intro">
        <h1 className="lab__title">Groove Grammar Lab</h1>
        <p className="text-secondary lab__subtitle">
          Освітня драм-машина. Спільний AudioContext із MELOS · pattern автоматично
          стікає в Hit DNA картку Composer's Lab.
        </p>
      </div>
      {err && <div className="groove-host__err">Помилка завантаження: {err}</div>}
      <div ref={ref} className="groove-host__mount" />
    </div>
  );
}

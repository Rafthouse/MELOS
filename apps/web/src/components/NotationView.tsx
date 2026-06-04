import { useEffect, useRef } from "react";
import {
  Renderer, Stave, StaveNote, Voice, Formatter, Accidental, Dot, Beam, StaveTie,
} from "vexflow";
import { pitchFromMidi, type Melody, type Scale } from "@melos/core-theory";
import type { Meter } from "./PianoRoll";

/**
 * Нотний стан (VexFlow) як альтернативний вигляд мелодії.
 * v3: розбивка на ТАКТИ з тактовими рисками за розміром, ЛІГИ через межу,
 * паузи для проміжків, написання за ладом. Тривалості округлено до найближчих.
 */

const DUR_TABLE: { beats: number; dur: string; dots: number }[] = [
  { beats: 4, dur: "w", dots: 0 },
  { beats: 3, dur: "h", dots: 1 },
  { beats: 2, dur: "h", dots: 0 },
  { beats: 1.5, dur: "q", dots: 1 },
  { beats: 1, dur: "q", dots: 0 },
  { beats: 0.75, dur: "8", dots: 1 },
  { beats: 0.5, dur: "8", dots: 0 },
  { beats: 0.375, dur: "16", dots: 1 },
  { beats: 0.25, dur: "16", dots: 0 },
  { beats: 0.1875, dur: "32", dots: 1 },
  { beats: 0.125, dur: "32", dots: 0 },
];

function nearestDur(beats: number): { dur: string; dots: number } {
  let best = DUR_TABLE[4]!;
  let bd = Infinity;
  for (const e of DUR_TABLE) {
    const d = Math.abs(beats - e.beats);
    if (d < bd) { bd = d; best = e; }
  }
  return { dur: best.dur, dots: best.dots };
}

function keyForMidi(midi: number, scale: Scale): { key: string; accidental: string | null } {
  const pc = ((midi % 12) + 12) % 12;
  const idx = scale.chromas.indexOf(pc);
  const name = idx >= 0 ? scale.noteNames[idx]! : pitchFromMidi(midi).name;
  const octave = Math.floor(midi / 12) - 1;
  const accidental = name.includes("#") ? "#" : name.includes("b") ? "b" : null;
  return { key: `${name.toLowerCase()}/${octave}`, accidental };
}

interface Piece {
  rest: boolean;
  midi: number;
  beats: number;
  tieStart: boolean;
  tieEnd: boolean;
}

/** Розкласти мелодію на ноти+паузи за часом (контігуально від 0). */
function timeline(melody: Melody): { rest: boolean; midi: number; beats: number }[] {
  const sorted = [...melody.notes].sort((a, b) => a.onset - b.onset);
  const out: { rest: boolean; midi: number; beats: number }[] = [];
  let cursor = 0;
  const EPS = 1e-3;
  for (const n of sorted) {
    if (n.onset > cursor + EPS) out.push({ rest: true, midi: 0, beats: n.onset - cursor });
    out.push({ rest: false, midi: n.pitch.midi, beats: n.duration });
    cursor = Math.max(cursor, n.onset + n.duration);
  }
  return out;
}

/** Розбити на такти за measureBeats; події, що перетинають межу — розділити з лігою. */
function splitToMeasures(
  items: { rest: boolean; midi: number; beats: number }[],
  measureBeats: number,
): Piece[][] {
  const measures: Piece[][] = [];
  let pos = 0;
  for (const it of items) {
    let remaining = it.beats;
    let continuation = false;
    while (remaining > 1e-6) {
      const mi = Math.floor(pos / measureBeats + 1e-9);
      const barEnd = (mi + 1) * measureBeats;
      const take = Math.min(remaining, barEnd - pos);
      while (measures.length <= mi) measures.push([]);
      const willContinue = remaining - take > 1e-6;
      measures[mi]!.push({
        rest: it.rest,
        midi: it.midi,
        beats: take,
        tieStart: !it.rest && willContinue,
        tieEnd: !it.rest && continuation,
      });
      pos += take;
      remaining -= take;
      continuation = true;
    }
  }
  return measures;
}

interface Props {
  melody: Melody;
  scale: Scale;
  meter: Meter;
}

export function NotationView({ melody, scale, meter }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.innerHTML = "";
    if (melody.notes.length === 0) return;

    const measureBeats = (meter.num * 4) / meter.den; // у чвертях
    const measures = splitToMeasures(timeline(melody), measureBeats);

    const widths = measures.map((pieces, mi) =>
      Math.max(120, pieces.length * 42 + (mi === 0 ? 70 : 24)),
    );
    const totalW = widths.reduce((a, b) => a + b, 0) + 16;
    const height = 150;

    try {
      const renderer = new Renderer(host, Renderer.Backends.SVG);
      renderer.resize(totalW, height);
      const ctx = renderer.getContext();

      // Плоский список нот із прапорцями ліг (для зв'язування).
      const flat: { note: StaveNote; tieStart: boolean; tieEnd: boolean }[] = [];
      let x = 8;

      measures.forEach((pieces, mi) => {
        const w = widths[mi]!;
        const stave = new Stave(x, 18, w);
        if (mi === 0) stave.addClef("treble").addTimeSignature(`${meter.num}/${meter.den}`);
        stave.setContext(ctx).draw();

        const notes = pieces.map((p) => {
          const { dur, dots } = nearestDur(p.beats);
          let sn: StaveNote;
          if (p.rest) {
            sn = new StaveNote({ keys: ["b/4"], duration: dur + "r" });
          } else {
            const { key, accidental } = keyForMidi(p.midi, scale);
            sn = new StaveNote({ keys: [key], duration: dur, clef: "treble" });
            if (accidental) sn.addModifier(new Accidental(accidental), 0);
          }
          if (dots > 0) Dot.buildAndAttach([sn], { all: true });
          flat.push({ note: sn, tieStart: p.tieStart, tieEnd: p.tieEnd });
          return sn;
        });

        const voice = new Voice({ num_beats: meter.num, beat_value: meter.den });
        voice.setStrict(false);
        voice.addTickables(notes);
        new Formatter().joinVoices([voice]).format([voice], w - (mi === 0 ? 78 : 30));
        voice.draw(ctx, stave);
        Beam.generateBeams(notes).forEach((b) => b.setContext(ctx).draw());

        x += w;
      });

      // Ліги між сусідніми шматками однієї розділеної ноти.
      for (let i = 0; i < flat.length - 1; i++) {
        if (flat[i]!.tieStart && flat[i + 1]!.tieEnd) {
          new StaveTie({ first_note: flat[i]!.note, last_note: flat[i + 1]!.note })
            .setContext(ctx)
            .draw();
        }
      }
    } catch (err) {
      host.innerHTML = `<div class="notation__err">Не вдалося відрендерити нотний стан</div>`;
      // eslint-disable-next-line no-console
      console.warn("NotationView:", err);
    }
  }, [melody, scale, meter]);

  return (
    <div className="notation">
      <div className="notation__scroll">
        <div ref={hostRef} className="notation__host" />
      </div>
      <p className="notation__note text-secondary">
        Такти з тактовими рисками, паузи, ліги через межу; написання за ладом. Тривалості округлено.
      </p>
    </div>
  );
}

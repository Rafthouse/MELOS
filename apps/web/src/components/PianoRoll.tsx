import { useState, useCallback, useRef, useEffect, useMemo } from "react";

/** Тіків на чверть. 48 дає цілі: 32-та=6, тріоль-8=16, тріоль-16=8, точка ×1.5. */
export const PPQ = 48;

/** Розмір такту. */
export interface Meter {
  num: number; // чисельник (доль у такті)
  den: number; // знаменник (4 = чверть, 8 = восьма)
}

/** Нота піано-рола: абсолютна висота (MIDI) + позиція й довжина в тіках. */
export interface PRNote {
  midi: number;
  startTick: number;
  lenTick: number;
}

const KEY_W = 56;
const RULER_H = 22;
const ROW_H = 13;
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.5, 2, 3];

const LOW_MIDI = 21; // A0
const HIGH_MIDI = 108; // C8

const BLACK = new Set([1, 3, 6, 8, 10]);
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const DRAG_THRESHOLD = 3;

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
function pcOf(midi: number): number {
  return ((midi % 12) + 12) % 12;
}
function midiName(midi: number): { name: string; octave: number; black: boolean } {
  const pc = pcOf(midi);
  return { name: NOTE_NAMES[pc]!, octave: Math.floor(midi / 12) - 1, black: BLACK.has(pc) };
}

/** Тіків на одну долю за знаменником розміру. */
export function ticksPerBeat(den: number): number {
  return (PPQ * 4) / den;
}

const BASE_TICKS: Record<number, number> = {
  1: PPQ * 4, 2: PPQ * 2, 4: PPQ, 8: PPQ / 2, 16: PPQ / 4, 32: PPQ / 8,
};
const BASE_OPTIONS: { d: number; label: string }[] = [
  { d: 1, label: "1" }, { d: 2, label: "½" }, { d: 4, label: "¼" },
  { d: 8, label: "⅛" }, { d: 16, label: "1⁄16" }, { d: 32, label: "1⁄32" },
];
const SNAP_OPTIONS: { ticks: number; label: string }[] = [
  { ticks: PPQ, label: "¼" },
  { ticks: PPQ / 2, label: "⅛" },
  { ticks: PPQ / 4, label: "1⁄16" },
  { ticks: PPQ / 8, label: "1⁄32" },
  { ticks: PPQ / 3, label: "⅛T" },
  { ticks: PPQ / 6, label: "1⁄16T" },
];

interface DragState {
  index: number;
  mode: "move" | "resize";
  sx: number;
  sy: number;
  orig: PRNote;
  origRow: number;
}

interface Props {
  scaleChromas: ReadonlySet<number>;
  tonicChroma: number;
  bars: number;
  meter: Meter;
  notes: PRNote[];
  onChange: (notes: PRNote[]) => void;
  playheadTick?: number | null;
}

export function PianoRoll({ scaleChromas, tonicChroma, bars, meter, notes, onChange, playheadTick }: Props) {
  const [base, setBase] = useState(8);
  const [dotted, setDotted] = useState(false);
  const [triplet, setTriplet] = useState(false);
  const [snapTicks, setSnapTicks] = useState(PPQ / 4);
  const [zoomIdx, setZoomIdx] = useState(2);
  const [fold, setFold] = useState(false);
  const [draft, setDraft] = useState<PRNote[] | null>(null);

  const pxPerTick = ZOOM_LEVELS[zoomIdx]!;

  // Рядки висот: усі хроматичні або лише тони ладу (fold), згори вниз.
  const { rows, rowIndexByMidi } = useMemo(() => {
    const list: number[] = [];
    for (let m = HIGH_MIDI; m >= LOW_MIDI; m--) {
      if (!fold || scaleChromas.has(pcOf(m))) list.push(m);
    }
    const map = new Map<number, number>();
    list.forEach((m, i) => map.set(m, i));
    return { rows: list, rowIndexByMidi: map };
  }, [fold, scaleChromas]);

  const rowOf = useCallback(
    (midi: number): number => {
      const exact = rowIndexByMidi.get(midi);
      if (exact != null) return exact;
      // не в рядках (fold + хроматична нота) → найближчий рядок
      let best = 0;
      let bd = Infinity;
      for (let i = 0; i < rows.length; i++) {
        const d = Math.abs(rows[i]! - midi);
        if (d < bd) { bd = d; best = i; }
      }
      return best;
    },
    [rows, rowIndexByMidi],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const draftRef = useRef<PRNote[] | null>(null);
  const notesRef = useRef(notes);
  const snapRef = useRef(snapTicks);
  const pxRef = useRef(pxPerTick);
  const rowsRef = useRef(rows);
  notesRef.current = notes;
  snapRef.current = snapTicks;
  pxRef.current = pxPerTick;
  rowsRef.current = rows;

  const tpb = ticksPerBeat(meter.den);
  const ticksPerBar = meter.num * tpb;
  const totalTicks = bars * ticksPerBar;
  const gridW = totalTicks * pxPerTick;
  const rowCount = rows.length;
  const gridH = rowCount * ROW_H;

  const durTicks = useMemo(() => {
    let t = BASE_TICKS[base]!;
    if (dotted) t = Math.round(t * 1.5);
    if (triplet) t = Math.round((t * 2) / 3);
    return Math.max(1, t);
  }, [base, dotted, triplet]);

  // Центруємо на C5 (рядок), коли змінюється набір рядків.
  useEffect(() => {
    if (scrollRef.current) {
      const target = rowOf(72);
      scrollRef.current.scrollTop = Math.max(0, target * ROW_H - 140);
    }
  }, [fold, rowOf]);

  const midiToTop = (midi: number) => rowOf(midi) * ROW_H;

  const placeNote = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const row = Math.floor((e.clientY - rect.top) / ROW_H);
      const midi = rows[row];
      if (midi == null) return;
      let startTick = Math.round((e.clientX - rect.left) / pxPerTick / snapTicks) * snapTicks;
      startTick = clamp(startTick, 0, totalTicks - durTicks);
      if (notes.some((n) => n.midi === midi && n.startTick === startTick)) return;
      onChange([...notes, { midi, startTick, lenTick: durTicks }]);
    },
    [notes, onChange, snapTicks, durTicks, totalTicks, pxPerTick, rows],
  );

  const beginDrag = useCallback(
    (index: number, mode: "move" | "resize", e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const orig = notes[index]!;
      dragRef.current = { index, mode, sx: e.clientX, sy: e.clientY, orig, origRow: rowOf(orig.midi) };
      setDraftBoth([...notes]);
    },
    [notes, rowOf],
  );

  const setDraftBoth = (v: PRNote[] | null) => {
    draftRef.current = v;
    setDraft(v);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dxTicks = (e.clientX - d.sx) / pxRef.current;
      const dyRows = Math.round((e.clientY - d.sy) / ROW_H);
      const snap = snapRef.current;
      const next = [...notesRef.current];
      const o = d.orig;
      if (d.mode === "move") {
        const start = clamp(Math.round((o.startTick + dxTicks) / snap) * snap, 0, totalTicks - o.lenTick);
        const rlist = rowsRef.current;
        const ri = clamp(d.origRow + dyRows, 0, rlist.length - 1);
        next[d.index] = { ...o, startTick: start, midi: rlist[ri]! };
      } else {
        const len = clamp(Math.round((o.lenTick + dxTicks) / snap) * snap, snap, totalTicks - o.startTick);
        next[d.index] = { ...o, lenTick: len };
      }
      setDraftBoth(next);
    };
    const onUp = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const moved = Math.abs(e.clientX - d.sx) >= DRAG_THRESHOLD || Math.abs(e.clientY - d.sy) >= DRAG_THRESHOLD;
      if (d.mode === "move" && !moved) {
        onChange(notesRef.current.filter((_, i) => i !== d.index));
      } else if (draftRef.current) {
        onChange(draftRef.current);
      }
      dragRef.current = null;
      setDraftBoth(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [onChange, totalTicks]);

  const beatPx = tpb * pxPerTick;
  const barPx = ticksPerBar * pxPerTick;
  const snapPx = snapTicks * pxPerTick;
  const lanesBg = `
    repeating-linear-gradient(90deg, var(--color-border) 0 1px, transparent 1px ${snapPx}px),
    repeating-linear-gradient(90deg, var(--color-border-hover) 0 1px, transparent 1px ${beatPx}px),
    repeating-linear-gradient(90deg, var(--color-accent-blue-a30) 0 2px, transparent 2px ${barPx}px)
  `;

  const renderNotes = draft ?? notes;

  return (
    <div className="pr">
      <div className="pr__toolbar">
        <span className="pr__tool-label">Нота</span>
        {BASE_OPTIONS.map((o) => (
          <button key={o.d} className={"pr__chip" + (o.d === base ? " pr__chip--active" : "")} onClick={() => setBase(o.d)}>{o.label}</button>
        ))}
        <button className={"pr__chip" + (dotted ? " pr__chip--active" : "")} onClick={() => setDotted((v) => !v)} title="З крапкою (×1.5)">•</button>
        <button className={"pr__chip" + (triplet ? " pr__chip--active" : "")} onClick={() => setTriplet((v) => !v)} title="Тріоль (×2/3)">3</button>

        <span className="pr__tool-label pr__tool-label--gap">Прив'язка</span>
        {SNAP_OPTIONS.map((o) => (
          <button key={o.label} className={"pr__chip" + (o.ticks === snapTicks ? " pr__chip--active" : "")} onClick={() => setSnapTicks(o.ticks)}>{o.label}</button>
        ))}

        <button className={"pr__chip pr__chip--wide" + (fold ? " pr__chip--active" : "")} onClick={() => setFold((v) => !v)} title="Показати лише ноти ладу">⊟ Лад</button>

        <span className="pr__tool-label pr__tool-label--gap">Zoom</span>
        <button className="pr__chip" onClick={() => setZoomIdx((i) => Math.max(0, i - 1))} disabled={zoomIdx === 0}>−</button>
        <span className="pr__zoom-val">{pxPerTick}×</span>
        <button className="pr__chip" onClick={() => setZoomIdx((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1))} disabled={zoomIdx === ZOOM_LEVELS.length - 1}>+</button>

        <button className="btn btn--small pr__clear" onClick={() => onChange([])} disabled={notes.length === 0}>Очистити</button>
      </div>

      <div className="pr__scroll" ref={scrollRef} style={{ height: 360 }}>
        <div className="pr__layout" style={{ gridTemplateColumns: `${KEY_W}px ${gridW}px`, gridTemplateRows: `${RULER_H}px ${gridH}px` }}>
          <div className="pr__corner" />

          <div className="pr__ruler" style={{ width: gridW }}>
            {Array.from({ length: bars }, (_, b) => (
              <div key={b} className="pr__bar-mark" style={{ left: b * barPx, width: barPx }}>
                <span className="pr__bar-num">{b + 1}</span>
                {Array.from({ length: meter.num }, (_, bt) => (
                  <span key={bt} className={"pr__beat-tick" + (bt === 0 ? " pr__beat-tick--strong" : "")} style={{ left: bt * beatPx }} />
                ))}
              </div>
            ))}
          </div>

          <div className="pr__keys" style={{ height: gridH }}>
            {rows.map((midi) => {
              const { name, octave, black } = midiName(midi);
              const pc = pcOf(midi);
              const inScale = scaleChromas.has(pc);
              const isTonic = pc === tonicChroma;
              return (
                <div key={midi} className={"pr__key" + (black ? " pr__key--black" : "") + (isTonic ? " pr__key--tonic" : inScale ? " pr__key--scale" : "")} style={{ height: ROW_H }}>
                  {name === "C" || isTonic ? <span className="pr__key-label">{name}{octave}</span> : null}
                </div>
              );
            })}
          </div>

          <div className="pr__lanes" style={{ width: gridW, height: gridH, backgroundImage: lanesBg }} onMouseDown={placeNote}>
            {rows.map((midi, r) => {
              const pc = pcOf(midi);
              const cls =
                "pr__lane-stripe" +
                (pc === tonicChroma ? " pr__lane-stripe--tonic" : scaleChromas.has(pc) ? " pr__lane-stripe--scale" : BLACK.has(pc) ? " pr__lane-stripe--black" : "");
              return <div key={midi} className={cls} style={{ top: r * ROW_H, height: ROW_H }} />;
            })}

            {renderNotes.map((n, i) => (
              <div
                key={i}
                className="pr__note"
                style={{ left: n.startTick * pxPerTick, top: midiToTop(n.midi) + 1, width: Math.max(3, n.lenTick * pxPerTick - 1), height: ROW_H - 2 }}
                onMouseDown={(e) => beginDrag(i, "move", e)}
                title="Тягнути — рух · за край — довжина · клік — видалити"
              >
                <div className="pr__note-handle" onMouseDown={(e) => beginDrag(i, "resize", e)} />
              </div>
            ))}

            {playheadTick != null && (
              <div className="pr__playhead" style={{ left: playheadTick * pxPerTick, height: gridH }} />
            )}
          </div>
        </div>
      </div>
      <p className="pr__hint text-secondary">
        Клік — додати · тягнути ноту — рух · за правий край — довжина · клік на ноті — видалити · «⊟ Лад» — лише ноти ладу
      </p>
    </div>
  );
}

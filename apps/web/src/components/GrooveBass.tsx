// GrooveBass — вкладка Groove-Bass Lab. Читає живий патерн GrooveLab і виводить басові архетипи.
// Движок: @melos/groove-bass. Нотація: VexFlow. Звук: smplr (саундфонти). Стиль: токени MELOS.

import { useEffect, useMemo, useRef, useState } from "react";
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from "vexflow";
import { Soundfont } from "smplr";
import {
  recommendBass, realizeBass, neighbors, CATALOG, songContext, barTicks, STYLES,
} from "@melos/groove-bass";
import type { Groove, BassPattern, Meter, BassNote } from "@melos/groove-bass";
import type { GroovePattern } from "@melos/groove-lab";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FALLBACK: Groove = STYLES.afrocuban_son ?? { name: "—", family: "", meter: "4-4", seed: { kick: [0, 8] } };

// 3 баси через смуглфонти MusyngKite (GM-назви).
const INSTRUMENTS: { gm: string; label: string }[] = [
  { gm: "electric_bass_pick", label: "Бас-гітара (пікінг)" },
  { gm: "acoustic_bass", label: "Контрабас (дабл-бас)" },
  { gm: "rock_organ", label: "Орган-бас" },
];

type Sf = ReturnType<typeof Soundfont>;

function grooveFromPattern(p: GroovePattern): Groove {
  const seed: Record<string, number[]> = {};
  for (const e of p.events) {
    if (e.bar !== 0) continue;
    (seed[e.track] ??= []).push(e.localStep);
  }
  return { name: p.styleName, family: p.styleName, meter: p.settings.meter, seed, tempo: [p.settings.tempo, p.settings.tempo] };
}
function parseMeter(s: string): Meter {
  const p = s.split("-");
  return { num: Number(p[0]) || 4, den: Number(p[1]) || 4 };
}
function parseProg(text: string, bt: number) {
  const syms = text.trim().split(/\s+/).filter(Boolean);
  return (syms.length ? syms : ["C"]).map((symbol, i) => ({ tick: i * bt, durTicks: bt, symbol }));
}

export function GrooveBass({ drumPattern }: { drumPattern: GroovePattern | null }) {
  const [tonic, setTonic] = useState("A");
  const [prog, setProg] = useState("Am Dm E7 Am");
  const [archId, setArchId] = useState<string | null>(null);
  const [editor, setEditor] = useState<"roll" | "notation">("roll");
  const [instrument, setInstrument] = useState(INSTRUMENTS[0]!.gm);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const notationRef = useRef<HTMLDivElement>(null);

  const groove = useMemo(() => (drumPattern ? grooveFromPattern(drumPattern) : FALLBACK), [drumPattern]);
  const meter = parseMeter(groove.meter);
  const bt = barTicks(meter, 480);
  const tempo = drumPattern?.settings.tempo ?? 95;

  const { rec, top, arch, patterns } = useMemo(() => {
    const chords = parseProg(prog, bt);
    const ctx = songContext({ tempo, meter, ppq: 480, key: { tonic, mode: "minor" }, chords, lengthBars: chords.length });
    const rec = recommendBass(groove, ctx);
    const top = rec.candidates.slice(0, 8);
    const arch = CATALOG.find((a) => a.id === archId && a.meters.includes(groove.meter)) ?? top[0]?.archetype ?? null;
    const patterns: BassPattern[] = [];
    if (arch) for (let b = 0; b < ctx.lengthBars; b++) patterns.push(realizeBass(groove, arch, ctx, b));
    return { rec, top, arch, patterns };
  }, [groove, archId, prog, tonic, tempo, bt, meter.num, meter.den]);

  const nbrs = arch ? neighbors(arch, CATALOG, 6) : [];
  const chordSyms = prog.trim().split(/\s+/).filter(Boolean);

  // ---- audio (smplr) ----
  const acRef = useRef<AudioContext | null>(null);
  const cacheRef = useRef<Map<string, Sf>>(new Map());
  const instRef = useRef<Sf | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const nextRef = useRef(0);
  const playingRef = useRef(false);
  const liveRef = useRef<{ patterns: BassPattern[]; groove: Groove; tempo: number }>({ patterns, groove, tempo });
  liveRef.current = { patterns, groove, tempo };

  function ensureCtx(): AudioContext {
    if (!acRef.current) acRef.current = new AudioContext();
    return acRef.current;
  }
  async function getInstrument(gm: string): Promise<Sf> {
    const ac = ensureCtx();
    let inst = cacheRef.current.get(gm);
    if (!inst) {
      inst = Soundfont(ac, { instrument: gm, kit: "MusyngKite", volume: 100 });
      cacheRef.current.set(gm, inst);
    }
    await inst.ready;
    return inst;
  }
  function kickClick(ac: AudioContext, t: number) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.08);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    o.connect(g); g.connect(ac.destination);
    o.start(t); o.stop(t + 0.15);
  }
  function scheduleLoop(ac: AudioContext, inst: Sf, t0: number): number {
    const { patterns: ps, groove: gr, tempo: bpm } = liveRef.current;
    const spb = ps[0]?.spb ?? 16;
    const secPerStep = (60 / bpm) / 4;
    const kicks = gr.seed.kick ?? [];
    ps.forEach((p, b) => {
      for (const s of kicks) kickClick(ac, t0 + (b * spb + s) * secPerStep);
      for (const n of p.notes) inst.start({ note: n.midi, time: t0 + (b * spb + n.step) * secPerStep, duration: 0.26, velocity: n.accent ? 112 : 82 });
    });
    return ps.length * spb * secPerStep;
  }
  function pump() {
    if (!playingRef.current) return;
    const ac = acRef.current, inst = instRef.current;
    if (ac && inst) {
      while (nextRef.current < ac.currentTime + 0.3) nextRef.current += scheduleLoop(ac, inst, nextRef.current);
    }
    timerRef.current = window.setTimeout(pump, 60);
  }
  async function play() {
    if (loading) return;
    if (playingRef.current) { stop(); return; }
    setLoading(true);
    try {
      const ac = ensureCtx();
      await ac.resume();
      const inst = await getInstrument(instrument);
      instRef.current = inst;
      playingRef.current = true;
      setPlaying(true);
      nextRef.current = ac.currentTime + 0.15;
      pump();
    } finally {
      setLoading(false);
    }
  }
  function stop() {
    playingRef.current = false;
    setPlaying(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    instRef.current?.stop();
  }
  async function changeInstrument(gm: string) {
    setInstrument(gm);
    if (playingRef.current) {
      const inst = await getInstrument(gm);
      instRef.current?.stop();
      instRef.current = inst;
    }
  }
  useEffect(() => () => {
    playingRef.current = false;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    void acRef.current?.close();
  }, []);

  // ---- VexFlow нотація ----
  useEffect(() => {
    if (editor !== "notation" || !notationRef.current || !arch) return;
    const host = notationRef.current;
    host.innerHTML = "";
    try {
      const renderer = new Renderer(host, Renderer.Backends.SVG);
      const barW = 230;
      renderer.resize(Math.max(380, patterns.length * barW + 30), 130);
      const ctx = renderer.getContext();
      patterns.forEach((p, b) => {
        const stave = new Stave(10 + b * barW, 8, barW);
        if (b === 0) stave.addClef("bass").addTimeSignature(`${meter.num}/${meter.den}`);
        stave.setContext(ctx).draw();
        const onsets = [...p.notes].sort((a, c) => a.step - c.step);
        const staveNotes = onsets.map((n, i) => buildNote(n, (i + 1 < onsets.length ? onsets[i + 1]!.step : p.spb) - n.step));
        if (staveNotes.length) {
          const voice = new Voice({ num_beats: meter.num, beat_value: meter.den }).setMode(Voice.Mode.SOFT);
          voice.addTickables(staveNotes);
          new Formatter().joinVoices([voice]).format([voice], barW - 55);
          voice.draw(ctx, stave);
        }
      });
    } catch (err) {
      host.innerHTML = `<div class="notation__err">Нотація недоступна: ${String(err)}</div>`;
    }
  }, [editor, patterns, arch, meter.num, meter.den]);

  return (
    <div className="gb">
      <header className="lab__header">
        <h2 className="lab__title">Groove-Bass Lab</h2>
        <p className="lab__subtitle text-secondary">
          {drumPattern
            ? `Грув із Groove Lab: ${drumPattern.styleName} · ${groove.meter}`
            : `Приклад: ${groove.name} · ${groove.meter} — відкрий вкладку Groove Lab, щоб керувати басом із барабанів`}
        </p>
      </header>

      <div className="lab__transport">
        <button className="btn btn--play" onClick={() => void play()} disabled={loading || !arch}>
          {loading ? "Завантаження…" : playing ? "■ Стоп" : "▶ Грати"}
        </button>
        <label className="control-label">Звук</label>
        <select className="select" value={instrument} onChange={(e) => void changeInstrument(e.target.value)}>
          {INSTRUMENTS.map((it) => <option key={it.gm} value={it.gm}>{it.label}</option>)}
        </select>
        <span className="lab__count text-secondary">{tempo} BPM · {groove.meter}</span>
      </div>

      <div className="lab__context">
        <label className="control-label">Тоніка</label>
        <select className="select" value={tonic} onChange={(e) => setTonic(e.target.value)}>
          {NOTE_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <label className="control-label">Акорди</label>
        <input className="meter__input" style={{ width: 170 }} value={prog} onChange={(e) => setProg(e.target.value)} />
        <div className="editor-switch">
          <button className={"editor-switch__btn" + (editor === "roll" ? " editor-switch__btn--active" : "")} onClick={() => setEditor("roll")}>Піано-рол</button>
          <button className={"editor-switch__btn" + (editor === "notation" ? " editor-switch__btn--active" : "")} onClick={() => setEditor("notation")}>Ноти</button>
        </div>
      </div>

      <div className="dna-badges">
        <DnaBadge label="meter" val={groove.meter} />
        <DnaBadge label="sync" val={rec.grooveDNA.syncopation.toFixed(2)} ok={rec.grooveDNA.grooveZone > 0.4} />
        <DnaBadge label="kick align" val={rec.grooveDNA.kickAlignment.toFixed(2)} />
        <DnaBadge label="offbeat" val={rec.grooveDNA.offbeatRatio.toFixed(2)} />
        <DnaBadge label="four-on-floor" val={String(rec.grooveDNA.fourOnFloor)} warn={rec.grooveDNA.fourOnFloor} />
        <DnaBadge label="groove zone" val={rec.grooveDNA.grooveZone.toFixed(2)} ok={rec.grooveDNA.grooveZone > 0.5} />
      </div>

      {!arch ? (
        <div className="editor-empty">Немає архетипів для метра {groove.meter} у каталозі (backlog).</div>
      ) : (
        <>
          {editor === "roll" ? (
            <div className="pr__scroll gb-roll" dangerouslySetInnerHTML={{ __html: rollSvg(groove, patterns, meter, chordSyms, tonic) }} />
          ) : (
            <div className="notation__scroll"><div ref={notationRef} className="notation__host" /></div>
          )}
          <p className="pr__hint text-secondary"># — онсет кіка (видно lock); акцент яскравіший. Бас читає акордовий трек (анте на сильну долю).</p>

          <div className="info-row">
            <div className="info-block">
              <div className="info-block__title">Рекомендовані архетипи</div>
              <div className="gb-cands">
                {top.map((c) => (
                  <button key={c.archetype.id}
                    className={"gb-cand " + (c.verdict === "✓" ? "gb-cand--ok" : "gb-cand--warn") + (c.archetype.id === arch.id ? " gb-cand--sel" : "")}
                    onClick={() => setArchId(c.archetype.id)}>
                    <span className="gb-cand__v">{c.verdict}</span> <b>{c.archetype.names.uk}</b>
                    <span className="gb-cand__fit">fit {c.score.toFixed(2)}</span>
                    <div className="gb-cand__why">{c.findings.map((f) => f.text.uk).join(" ")}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="info-block">
              <div className="info-block__title">{arch.names.uk} · {arch.grooveLock}</div>
              {arch.principles.map((p, i) => (
                <p key={i} className="harm-style__expl"><b className="roman">{p.title.uk}</b> — {p.text.uk}</p>
              ))}
              <div className="critique__cites">
                {arch.sources.map((s, i) => <span key={i} className="cite-chip">{s}</span>)}
              </div>
              <div className="info-block__title" style={{ marginTop: 14 }}>ДНК-сусіди (крос-жанр)</div>
              <div className="gb-nbrs">
                {nbrs.map((n) => (
                  <span key={n.archetype.id} className="gb-nbr">{n.archetype.names.uk} <em>{n.affinity.toFixed(2)}</em></span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DnaBadge({ label, val, ok, warn }: { label: string; val: string; ok?: boolean; warn?: boolean }) {
  return (
    <div className={"dna-badge" + (warn ? " dna-badge--warn" : ok ? " dna-badge--ok" : "")}>
      <span>{label}</span><strong>{val}</strong>
    </div>
  );
}

// ---- VexFlow note builder ----
const VEX_NAMES = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
function buildNote(n: BassNote, gapSteps: number): StaveNote {
  const pc = ((n.midi % 12) + 12) % 12;
  const oct = Math.floor(n.midi / 12) - 1;
  const nm = VEX_NAMES[pc]!;
  const dur = gapSteps <= 1 ? "16" : gapSteps <= 2 ? "8" : gapSteps <= 4 ? "q" : gapSteps <= 8 ? "h" : "w";
  const note = new StaveNote({ keys: [`${nm}/${oct}`], duration: dur, clef: "bass" });
  if (nm.includes("#")) note.addModifier(new Accidental("#"), 0);
  return note;
}

// ---- SVG piano-roll (рядок) ----
function rollSvg(groove: Groove, patterns: BassPattern[], meter: Meter, chordSyms: string[], tonic: string): string {
  const p0 = patterns[0];
  if (!p0) return "";
  const spb = p0.spb, bars = patterns.length, cols = spb * bars;
  const bStep = 16 / meter.den;
  const cell = 22, rowH = 12, padL = 46, padTop = 28, padBot = 12;
  const midis = patterns.flatMap((p) => p.notes.map((n) => n.midi));
  const minM = Math.min(40, ...midis) - 2;
  const maxM = Math.max(52, ...midis) + 2;
  const lanes = maxM - minM + 1;
  const W = padL + cols * cell + 10, H = padTop + lanes * rowH + padBot;
  const x = (c: number) => padL + c * cell;
  const y = (m: number) => padTop + (maxM - m) * rowH;
  const kick = new Set<number>(groove.seed.kick ?? []);
  const parts: string[] = [`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="gb-roll-svg">`];
  for (let b = 0; b < bars; b++) for (const k of kick) parts.push(`<rect x="${x(b * spb + k)}" y="${padTop}" width="${cell}" height="${lanes * rowH}" class="kc"/>`);
  for (let m = minM; m <= maxM; m++) {
    parts.push(`<line x1="${padL}" y1="${y(m)}" x2="${W - 6}" y2="${y(m)}" class="ln"/>`);
    if (m % 12 === 0) parts.push(`<text x="6" y="${y(m) + 4}" class="lb">C${Math.floor(m / 12) - 1}</text>`);
  }
  for (let c = 0; c <= cols; c++) {
    const cls = c % spb === 0 ? "vb" : c % bStep === 0 ? "vt" : "vs";
    parts.push(`<line x1="${x(c)}" y1="${padTop}" x2="${x(c)}" y2="${padTop + lanes * rowH}" class="${cls}"/>`);
  }
  for (let b = 0; b < bars; b++) parts.push(`<text x="${x(b * spb) + 4}" y="${padTop - 2}" class="ch">${chordSyms[b] ?? tonic}</text>`);
  patterns.forEach((p, b) => {
    const sorted = [...p.notes].sort((a, c) => a.step - c.step);
    sorted.forEach((n, i) => {
      const col = b * spb + n.step;
      const nextStep = i + 1 < sorted.length ? sorted[i + 1]!.step : spb;
      const w = Math.max(1, Math.min(nextStep - n.step, 3)) * cell - 3;
      const cls = n.accent ? "nt nt--a" : n.ghost ? "nt nt--g" : "nt";
      parts.push(`<rect x="${x(col) + 1}" y="${y(n.midi) + 1}" width="${w}" height="${rowH - 2}" rx="2" class="${cls}"/>`);
      parts.push(`<text x="${x(col) + 4}" y="${y(n.midi) + rowH - 3}" class="nl">${n.name}</text>`);
    });
  });
  parts.push("</svg>");
  return parts.join("");
}

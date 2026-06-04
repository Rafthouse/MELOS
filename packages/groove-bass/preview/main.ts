// preview/main.ts — інтерактивний прев'ю Groove-Bass Lab. Імпортує реальний движок @melos/groove-bass.

import { songContext, barTicks, recommendBass, realizeBass, CATALOG, neighbors, STYLES } from '../src/index';
import type { Groove, SongContext, ChordEvent, BassPattern, BassArchetype, Meter } from '../src/types';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const $ = (id: string): HTMLElement => document.getElementById(id)!;
let selectedArch: string | null = null;
let current: { groove: Groove; patterns: BassPattern[]; ctx: SongContext } | null = null;

function fillSelect(id: string, entries: [string, string][], def?: string) {
  const sel = $(id) as HTMLSelectElement;
  sel.innerHTML = entries.map(([v, label]) => `<option value="${v}">${label}</option>`).join('');
  if (def) sel.value = def;
}
fillSelect('style', Object.entries(STYLES).map(([k, g]) => [k, `${g.name} · ${g.meter}`]), 'afrocuban_son');
fillSelect('tonic', NOTE_NAMES.map((n) => [n, n]), 'A');

function parseMeter(s: string): Meter {
  const p = s.split('-');
  return { num: Number(p[0]) || 4, den: Number(p[1]) || 4 };
}
function parseProg(text: string, bt: number): ChordEvent[] {
  const syms = text.trim().split(/\s+/).filter(Boolean);
  return (syms.length ? syms : ['C']).map((symbol, i) => ({ tick: i * bt, durTicks: bt, symbol }));
}

function render() {
  const groove = STYLES[($('style') as HTMLSelectElement).value]!;
  const tonic = ($('tonic') as HTMLSelectElement).value;
  const tempo = Number(($('tempo') as HTMLInputElement).value) || 95;
  const meter = parseMeter(groove.meter);
  const bt = barTicks(meter, 480);
  const chords = parseProg(($('prog') as HTMLInputElement).value, bt);
  const ctx = songContext({ tempo, meter, ppq: 480, key: { tonic, mode: 'minor' }, chords, lengthBars: chords.length });

  const rec = recommendBass(groove, ctx);
  const top = rec.candidates.slice(0, 8);
  const arch: BassArchetype = CATALOG.find((a) => a.id === selectedArch && a.meters.includes(`${meter.num}-${meter.den}`))
    ?? top[0]?.archetype ?? rec.candidates[0]!.archetype;

  // arch dropdown = поточні кандидати
  fillSelect('arch', top.map((c) => [c.archetype.id, `${c.verdict} ${c.archetype.names.uk}`]), arch.id);

  const d = rec.grooveDNA;
  $('dna').innerHTML =
    `Groove DNA · метр <b>${groove.meter}</b> &nbsp; sync <b>${d.syncopation.toFixed(2)}</b> &nbsp; kickAlign <b>${d.kickAlignment.toFixed(2)}</b> ` +
    `&nbsp; offbeat <b>${d.offbeatRatio.toFixed(2)}</b> &nbsp; four-on-floor <b>${d.fourOnFloor}</b> &nbsp; grooveZone <b>${d.grooveZone.toFixed(2)}</b>`;

  $('cands').innerHTML = top.map((c) =>
    `<div class="cand ${c.verdict === '✓' ? 'ok' : 'warn'} ${c.archetype.id === arch.id ? 'sel' : ''}" data-id="${c.archetype.id}">` +
    `<span class="v">${c.verdict}</span> <b>${c.archetype.names.uk}</b> <span class="fit">fit ${c.score.toFixed(2)}</span>` +
    `<div class="why">${c.findings.map((f) => f.text.uk).join(' ')}</div></div>`).join('');
  $('cands').querySelectorAll<HTMLElement>('.cand').forEach((node) =>
    node.addEventListener('click', () => { selectedArch = node.dataset.id ?? null; render(); }));

  const nbrs = neighbors(arch, CATALOG, 6);
  $('principles').innerHTML =
    `<h3>${arch.names.uk} <span style="color:var(--dim);font-weight:400">· ${arch.grooveLock}</span></h3>` +
    arch.principles.map((p) => `<div class="prin"><b>${p.title.uk}</b> — ${p.text.uk}</div>`).join('') +
    `<div class="src">Джерела: ${arch.sources.join('; ')}</div>` +
    `<h2 style="margin-top:14px">ДНК-сусіди (крос-жанр)</h2>` +
    `<div class="nbrs">${nbrs.map((n) => `<span class="nbr" data-id="${n.archetype.id}">${n.archetype.names.uk} <em>${n.affinity.toFixed(2)}</em></span>`).join('')}</div>`;
  $('principles').querySelectorAll<HTMLElement>('.nbr').forEach((node) =>
    node.addEventListener('click', () => { const id = node.dataset.id!; const a = CATALOG.find((x) => x.id === id); if (a) { selectedArch = id; ($('style') as HTMLSelectElement).value = pickStyleForMeter(a.meters[0]!); render(); } }));

  const patterns: BassPattern[] = [];
  for (let b = 0; b < ctx.lengthBars; b++) patterns.push(realizeBass(groove, arch, ctx, b));
  drawRoll(groove, patterns, ctx);
  current = { groove, patterns, ctx };
}

// якщо клікнули ДНК-сусіда з іншого метра — підібрати відповідний GGL-стиль
function pickStyleForMeter(meterId: string): string {
  const cur = ($('style') as HTMLSelectElement).value;
  if (STYLES[cur]?.meter === meterId) return cur;
  const hit = Object.entries(STYLES).find(([, g]) => g.meter === meterId);
  return hit ? hit[0] : cur;
}

function drawRoll(groove: Groove, patterns: BassPattern[], ctx: SongContext) {
  const p0 = patterns[0]!;
  const spb = p0.spb;
  const bars = patterns.length;
  const cols = spb * bars;
  const bStep = 16 / ctx.meter.den;
  const cell = 22, rowH = 12, padL = 50, padTop = 30, padBot = 14;
  const midis = patterns.flatMap((p) => p.notes.map((n) => n.midi));
  const minM = Math.min(40, ...midis) - 2;
  const maxM = Math.max(52, ...midis) + 2;
  const lanes = maxM - minM + 1;
  const W = padL + cols * cell + 12;
  const H = padTop + lanes * rowH + padBot;
  const x = (col: number) => padL + col * cell;
  const y = (m: number) => padTop + (maxM - m) * rowH;
  const kick = new Set<number>(groove.seed.kick ?? []);

  const parts: string[] = [`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="roll">`];
  for (let b = 0; b < bars; b++) for (const k of kick) parts.push(`<rect x="${x(b * spb + k)}" y="${padTop}" width="${cell}" height="${lanes * rowH}" class="kickcol"/>`);
  for (let m = minM; m <= maxM; m++) {
    parts.push(`<line x1="${padL}" y1="${y(m)}" x2="${W - 6}" y2="${y(m)}" class="lane"/>`);
    if (m % 12 === 0) parts.push(`<text x="6" y="${y(m) + 4}" class="lbl">C${Math.floor(m / 12) - 1}</text>`);
  }
  for (let c = 0; c <= cols; c++) {
    const isBar = c % spb === 0, isBeat = c % bStep === 0;
    parts.push(`<line x1="${x(c)}" y1="${padTop}" x2="${x(c)}" y2="${padTop + lanes * rowH}" class="${isBar ? 'bar' : isBeat ? 'beat' : 'sub'}"/>`);
    if (isBeat && c < cols) parts.push(`<text x="${x(c) + 3}" y="${padTop - 14}" class="beat-lbl">${((c % spb) / bStep) + 1}</text>`);
  }
  for (let b = 0; b < bars; b++) parts.push(`<text x="${x(b * spb) + 4}" y="${padTop - 2}" class="chord">${ctx.chords[b]?.symbol ?? ctx.key.tonic}</text>`);
  patterns.forEach((p, b) => {
    const sorted = [...p.notes].sort((a, c) => a.step - c.step);
    sorted.forEach((n, i) => {
      const col = b * spb + n.step;
      const nextStep = i + 1 < sorted.length ? sorted[i + 1]!.step : spb;
      const w = Math.max(1, Math.min(nextStep - n.step, 3)) * cell - 3;
      const cls = n.accent ? 'note accent' : n.ghost ? 'note ghost' : 'note';
      parts.push(`<rect x="${x(col) + 1}" y="${y(n.midi) + 1}" width="${w}" height="${rowH - 2}" rx="2" class="${cls}"/>`);
      parts.push(`<text x="${x(col) + 4}" y="${y(n.midi) + rowH - 3}" class="note-lbl">${n.name}</text>`);
    });
  });
  parts.push('</svg>');
  $('roll').innerHTML = parts.join('');
}

// ---- audio (бас + кік) ----
let actx: AudioContext | null = null;
let playing = false;
let timer: number | undefined;
const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function blip(freq: number, t: number, dur: number, gain: number, type: OscillatorType) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(actx.destination);
  o.start(t); o.stop(t + dur + 0.02);
}

function play() {
  stop();
  if (!current) return;
  actx = new AudioContext();
  playing = true;
  $('play').classList.add('on'); $('play').textContent = '■ Стоп';
  const { patterns, ctx, groove } = current;
  const spb = patterns[0]!.spb;
  const secPerStep = (60 / ctx.tempo) / 4;
  const loopLen = patterns.length * spb * secPerStep;
  const kicks = groove.seed.kick ?? [];
  const schedule = (t0: number) => {
    for (let b = 0; b < patterns.length; b++) for (const s of kicks) blip(70, t0 + (b * spb + s) * secPerStep, 0.12, 0.5, 'sine');
    patterns.forEach((p, b) => p.notes.forEach((n) => blip(midiToFreq(n.midi), t0 + (b * spb + n.step) * secPerStep, 0.22, n.accent ? 0.4 : 0.26, 'triangle')));
  };
  let next = actx.currentTime + 0.12;
  const tick = () => {
    if (!playing || !actx) return;
    while (next < actx.currentTime + 0.25) { schedule(next); next += loopLen; }
    timer = window.setTimeout(tick, 60);
  };
  tick();
}

function stop() {
  playing = false;
  if (timer) window.clearTimeout(timer);
  if (actx) { actx.close(); actx = null; }
  $('play').classList.remove('on'); $('play').textContent = '▶ Грати';
}

['style', 'tonic', 'prog', 'tempo'].forEach((id) => $(id).addEventListener('input', () => { if (id === 'style') selectedArch = null; render(); if (playing) play(); }));
$('arch').addEventListener('input', () => { selectedArch = ($('arch') as HTMLSelectElement).value; render(); if (playing) play(); });
$('play').addEventListener('click', () => (playing ? stop() : play()));

render();

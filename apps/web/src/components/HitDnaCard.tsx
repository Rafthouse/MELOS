import { useMemo } from "react";
import type { Melody, Scale } from "@melos/core-theory";
import {
  computeDna, patternToDrumDna,
  type MelodyDna, type DrumDna, type DrumPattern,
} from "@melos/core-analysis";
import type { Meter } from "./PianoRoll";
import { getCitation } from "@melos/data";
import type { GroovePattern } from "@melos/groove-lab";

/**
 * Hit DNA Card (ТЗ M3) — генетичний паспорт мелодії + ритму.
 * Якщо drumPattern переданий з GrooveLab — секція Rhythm-DNA заповнюється реальними даними.
 */

interface Props {
  melody: Melody;
  scale: Scale;
  meter: Meter;
  drumPattern?: GroovePattern | null;
  onCiteClick?: (id: string) => void;
}

/** Конвертер GroovePattern → універсальний DrumPattern для core-analysis. */
function gglToDrumPattern(p: GroovePattern): DrumPattern {
  const stepsPerBar = p.settings.stepsPerBar ?? Math.max(1, p.totalSteps / p.settings.bars);
  // Витягнути beatsPerBar з meter "4-4" / "6-8" / "12-8" тощо
  const [num] = (p.settings.meter || "4-4").split("-").map(Number);
  return {
    bars: p.settings.bars,
    stepsPerBar,
    beatsPerBar: num || 4,
    tempo: p.settings.tempo,
    events: p.events.map((e) => ({
      track: e.track,
      step: e.step,
      velocity: e.velocity,
      ghost: e.ghost,
      accent: e.accent,
      layer: e.layer,
    })),
  };
}

const INTERVAL_LABELS: Record<number, string> = {
  0: "P1", 1: "m2", 2: "M2", 3: "m3", 4: "M3", 5: "P4", 6: "TT",
  7: "P5", 8: "m6", 9: "M6", 10: "m7", 11: "M7", 12: "P8",
};
const CONTOUR_LABELS: Record<string, string> = {
  arch: "арка (підйом-спуск)",
  "inverted-arch": "обернена арка",
  ascending: "висхідний",
  descending: "спадний",
  plateau: "плато",
  undulating: "хвилястий",
};

function Bar({ value, max, label, hint, tone = "blue" }: {
  value: number; max: number; label: string; hint?: string; tone?: "blue" | "green" | "amber";
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="dna-bar" title={hint}>
      <div className="dna-bar__label">
        <span>{label}</span>
        <span className="dna-bar__val">{value.toLocaleString("uk", { maximumFractionDigits: 2 })}</span>
      </div>
      <div className="dna-bar__track">
        <div className={`dna-bar__fill dna-bar__fill--${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Histogram({ data, labelFor, tone }: {
  data: { x: number; count: number }[]; labelFor: (x: number) => string; tone: "blue" | "green";
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="dna-hist">
      {data.map((d) => (
        <div key={d.x} className="dna-hist__col" title={`${labelFor(d.x)}: ${d.count}`}>
          <div className="dna-hist__bar-wrap">
            <div
              className={`dna-hist__bar dna-hist__bar--${tone}`}
              style={{ height: `${(d.count / max) * 100}%` }}
            />
          </div>
          <div className="dna-hist__lab">{labelFor(d.x)}</div>
        </div>
      ))}
    </div>
  );
}

function EarwormBreakdownView({ ew }: { ew: MelodyDna["earworm"] }) {
  const parts = [
    { label: "arch-контур", value: ew.archBonus, max: 25 },
    { label: "діапазон", value: ew.rangeBonus, max: 20 },
    { label: "ритм-рекурентність", value: ew.rhythmicRecurrenceBonus, max: 20 },
    { label: "спадні m2 в кульмінації", value: ew.descendingM2Bonus, max: 15 },
    { label: "щільність", value: ew.densityBonus, max: 20 },
  ];
  return (
    <div className="dna-earworm">
      <div className="dna-earworm__total">
        <span className="dna-earworm__score">{ew.total}</span>
        <span className="dna-earworm__max">/100</span>
        <span className="dna-earworm__tier">
          {ew.total >= 65 ? "висока" : ew.total >= 45 ? "помірна" : "низька"}
        </span>
      </div>
      <ul className="dna-earworm__parts">
        {parts.map((p) => (
          <li key={p.label}>
            <span className="dna-earworm__part-label">{p.label}</span>
            <span className="dna-earworm__part-val">+{p.value}</span>
            <span className="dna-earworm__part-max">/ {p.max}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HitDnaCard({ melody, scale, meter, drumPattern, onCiteClick }: Props) {
  void meter;
  const dna = useMemo(
    () => (melody.notes.length >= 2 ? computeDna(melody, scale) : null),
    [melody, scale],
  );
  const drumDna: DrumDna | null = useMemo(() => {
    if (!drumPattern || drumPattern.events.length === 0) return null;
    return patternToDrumDna(gglToDrumPattern(drumPattern));
  }, [drumPattern]);

  if (!dna) {
    return (
      <section className="dna-card">
        <h3 className="info-block__title">Hit DNA</h3>
        <p className="text-secondary">Додайте мелодію (≥2 ноти) — MELOS збере генетичний паспорт.</p>
      </section>
    );
  }

  const intervalBins = dna.intervalHistogram.map((b) => ({ x: b.semis, count: b.count }));
  const durationBins = dna.durationHistogram.map((b) => ({ x: b.beats, count: b.count }));
  const climaxPct = Math.round(dna.climaxPosition * 100);
  const climaxOk = dna.climaxGoldenDistance <= 0.12;
  const grooveZone =
    dna.syncopationIndex === 0 ? "рівно" :
    dna.syncopationIndex / Math.max(1, dna.noteCount) <= 1.6 ? "грув ✓" : "над-синкопа";

  const cite = (id: string) => {
    const c = getCitation(id);
    if (!c) return null;
    return (
      <button key={id} className="cite-chip cite-chip--link"
        title={`${c.authors.join(", ")} (${c.year}). ${c.title}`}
        onClick={() => onCiteClick?.(id)}>
        {c.authors[0]?.split(" ").slice(-1)[0]} {c.year}
      </button>
    );
  };

  return (
    <section className="dna-card">
      <h3 className="info-block__title">Hit DNA — генетичний паспорт</h3>

      {/* Бейджі */}
      <div className="dna-badges">
        <div className="dna-badge"><span>контур</span><strong>{CONTOUR_LABELS[dna.contour] ?? dna.contour}</strong></div>
        <div className="dna-badge"><span>діапазон</span><strong>{dna.rangeSemitones} пт</strong></div>
        <div className="dna-badge"><span>нот</span><strong>{dna.noteCount}</strong></div>
        <div className="dna-badge"><span>щільність</span><strong>{dna.density.toFixed(2)} н/дол</strong></div>
        <div className={"dna-badge " + (climaxOk ? "dna-badge--ok" : "dna-badge--warn")}>
          <span>кульмінація</span><strong>{climaxPct}% {climaxOk ? "✓" : "✗ 62%"}</strong>
        </div>
        <div className="dna-badge"><span>синкопа</span><strong>{dna.syncopationIndex} · {grooveZone}</strong></div>
      </div>

      {/* Earworm */}
      <div className="dna-section">
        <h4 className="dna-section__title">
          Earworm-потенціал {cite("jakubowski-2017")}
        </h4>
        <EarwormBreakdownView ew={dna.earworm} />
      </div>

      {/* Бари: stepwise, predictability */}
      <div className="dna-section dna-grid-2">
        <div>
          <h4 className="dna-section__title">Мелодична динаміка {cite("huron-2006")}</h4>
          <Bar label="кроковий рух" value={dna.stepwiseRatio} max={1} hint="0..1 — частка кроків серед усіх рухів" tone="blue" />
          <Bar label="нерозв. стрибки" value={dna.gapFillUnresolved} max={Math.max(3, dna.gapFillUnresolved)} hint="Narmour gap-fill: широкий стрибок, не компенсований кроком" tone="amber" />
          <Bar label="нерозв. провідний тон" value={dna.leadingToneUnresolved} max={Math.max(3, dna.leadingToneUnresolved)} hint="ступінь 7 не йде на тоніку" tone="amber" />
        </div>
        <div>
          <h4 className="dna-section__title">Свіжість {cite("berlyne-1971")}</h4>
          <Bar label="передбачуваність" value={Math.round(dna.predictability * 100)} max={25} hint="за Berlyne inverted-U; ~6-17 = солодка зона" tone="green" />
          {dna.cliches.length > 0 && (
            <div className="dna-cliches">
              <div className="dna-cliches__label">Знайдені кліше:</div>
              <ul>{dna.cliches.map((c) => <li key={c.id}>{c.label}</li>)}</ul>
            </div>
          )}
          {dna.cliches.length === 0 && <div className="text-secondary dna-cliches__none">Кліше не знайдено ✓</div>}
        </div>
      </div>

      {/* Гістограми */}
      <div className="dna-section dna-grid-2">
        <div>
          <h4 className="dna-section__title">Інтервали (семітони)</h4>
          <Histogram data={intervalBins} tone="blue" labelFor={(s) => INTERVAL_LABELS[Math.abs(s)]?.replace(/^[A-Z]+/, (m) => s < 0 ? "↓" + m : m) ?? String(s)} />
        </div>
        <div>
          <h4 className="dna-section__title">Тривалості (долі)</h4>
          <Histogram data={durationBins} tone="green" labelFor={(b) => b.toString()} />
        </div>
      </div>

      {/* Ритм-DNA: мелодична + drum (якщо є з GrooveLab) */}
      <div className="dna-section dna-rhythm-slot">
        <h4 className="dna-section__title">Ритм-DNA мелодії</h4>
        <p className="text-secondary">
          Синкопованість: <strong>{dna.syncopationIndex}</strong> ·
          {" "}зона: <strong>{grooveZone}</strong> ·
          {" "}унікальних тривалостей: <strong>{dna.durationHistogram.length}</strong>
        </p>
      </div>

      {drumDna ? (
        <div className="dna-section dna-drum">
          <h4 className="dna-section__title">Ритм-DNA барабанів (Groove Lab)</h4>
          <div className="dna-badges">
            <div className="dna-badge"><span>BPM</span><strong>{drumDna.tempo}</strong></div>
            <div className="dna-badge"><span>тактів</span><strong>{drumDna.bars}</strong></div>
            <div className="dna-badge"><span>подій</span><strong>{drumDna.totalEvents}</strong></div>
            <div className="dna-badge"><span>треків</span><strong>{drumDna.activeTracks}</strong></div>
            <div className="dna-badge"><span>щільність</span><strong>{drumDna.density.toFixed(2)}</strong></div>
            <div className="dna-badge"><span>синкопа</span><strong>{drumDna.syncopationIndex}</strong></div>
            <div className="dna-badge"><span>ghost</span><strong>{Math.round(drumDna.ghostRatio * 100)}%</strong></div>
            <div className="dna-badge"><span>accent</span><strong>{Math.round(drumDna.accentRatio * 100)}%</strong></div>
          </div>
          <div className="dna-section__title" style={{ marginTop: "var(--sp-3)" }}>Топ-треки</div>
          <ul className="dna-tracks">
            {drumDna.tracks.slice(0, 6).map((t) => (
              <li key={t.track}>
                <span className="dna-tracks__name">{t.track}</span>
                <span className="dna-tracks__count">{t.count}</span>
                <span className="text-secondary">w̄ {t.meanMetricWeight}</span>
              </li>
            ))}
          </ul>
          {Object.keys(drumDna.roleMix).length > 0 && (
            <div className="dna-roles">
              <span className="text-secondary">шари: </span>
              {Object.entries(drumDna.roleMix).map(([role, n]) => (
                <span key={role} className="dna-role-chip">{role} <strong>{n}</strong></span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="dna-section dna-rhythm-slot">
          <h4 className="dna-section__title">Ритм-DNA барабанів</h4>
          <p className="text-secondary dna-rhythm-slot__hint">
            Перейдіть у Groove Lab і згенеруйте барабанний патерн — він автоматично з'явиться тут.
          </p>
        </div>
      )}
    </section>
  );
}

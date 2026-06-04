import type { Meter } from "./PianoRoll";

interface Props {
  bars: number;
  meter: Meter;
  onBars: (b: number) => void;
  onMeter: (m: Meter) => void;
}

const NUMERATORS = [2, 3, 4, 5, 6, 7, 9, 12];
const DENOMINATORS = [4, 8];

export function MeterControls({ bars, meter, onBars, onMeter }: Props) {
  return (
    <div className="meter">
      <label className="meter__field">
        <span className="meter__label">Тактів</span>
        <input
          type="number"
          className="meter__input"
          min={1}
          max={16}
          value={bars}
          onChange={(e) => onBars(Math.max(1, Math.min(16, Number(e.target.value) || 1)))}
        />
      </label>
      <label className="meter__field">
        <span className="meter__label">Розмір</span>
        <span className="meter__sig">
          <select
            className="meter__select"
            value={meter.num}
            onChange={(e) => onMeter({ ...meter, num: Number(e.target.value) })}
          >
            {NUMERATORS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="meter__slash">/</span>
          <select
            className="meter__select"
            value={meter.den}
            onChange={(e) => onMeter({ ...meter, den: Number(e.target.value) })}
          >
            {DENOMINATORS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </span>
      </label>
    </div>
  );
}

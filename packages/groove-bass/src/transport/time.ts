// transport/time.ts — спільний транспорт: SongContext + конвертація крок↔тік.
// Канонічний час = тіки (PPQ). GGL stepsPerBar — вид на tick-сітку (sixteenth для всіх метрів).
// У MELOS це належить core-theory; тут — поки локально (промоушн при зв'язуванні workspace).

import type { Meter, SongContext } from '../types';

export const DEFAULT_PPQ = 480;

export function stepsPerBar(meter: Meter): number {
  const s = (meter.num * 16) / meter.den;
  if (!Number.isInteger(s)) throw new Error(`Non-integer stepsPerBar for ${meter.num}/${meter.den}`);
  return s;
}

export const tickPerStep = (ppq: number = DEFAULT_PPQ): number => ppq / 4;
export const beatStep = (meter: Meter): number => 16 / meter.den;
export const barTicks = (meter: Meter, ppq: number = DEFAULT_PPQ): number => stepsPerBar(meter) * tickPerStep(ppq);
export const stepToTick = (step: number, ppq: number = DEFAULT_PPQ): number => step * tickPerStep(ppq);
export const tickToStep = (tick: number, ppq: number = DEFAULT_PPQ): number => Math.round(tick / tickPerStep(ppq));

export function songContext(init: Partial<SongContext> = {}): SongContext {
  return {
    tempo: init.tempo ?? 100,
    meter: init.meter ?? { num: 4, den: 4 },
    ppq: init.ppq ?? DEFAULT_PPQ,
    key: init.key ?? { tonic: 'C', mode: 'major' },
    chords: init.chords ?? [],
    lengthBars: init.lengthBars ?? 2,
  };
}

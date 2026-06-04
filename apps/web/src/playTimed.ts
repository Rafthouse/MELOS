import type { Melody } from "@melos/core-theory";
import { playMelody, type InstrumentName } from "./player";

/**
 * Зручна обгортка: програти Melody саундфонтом за BPM (без метронома).
 * Використовується Motif Workshop для мотиву й варіантів.
 */
export async function playMelodyTimed(
  melody: Melody,
  bpm: number = 100,
  instrument: InstrumentName = "piano",
): Promise<void> {
  await playMelody(melody, { bpm, instrument, metronome: false, beatsPerBar: 4 });
}

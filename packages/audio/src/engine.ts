import * as Tone from "tone";

/**
 * Стан аудіо-движка.
 * Tone.js / Web Audio вимагає user gesture для старту AudioContext.
 */
export type EngineState = "suspended" | "running" | "closed";

let initialized = false;

/**
 * Ініціалізувати аудіо-контекст (викликати з обробника user gesture — click/keydown).
 * Безпечно викликати повторно — ідемпотентна.
 */
export async function initAudio(): Promise<void> {
  if (initialized && Tone.getContext().state === "running") return;
  await Tone.start();
  initialized = true;
}

/** Поточний стан AudioContext. */
export function getEngineState(): EngineState {
  if (!initialized) return "suspended";
  return Tone.getContext().state as EngineState;
}

/**
 * Поточний глобальний BPM (beats per minute).
 * За замовчуванням 120. Впливає на тривалості "4n", "8n" тощо.
 */
export function getTempo(): number {
  return Tone.getTransport().bpm.value;
}

/** Встановити глобальний BPM. */
export function setTempo(bpm: number): void {
  Tone.getTransport().bpm.value = Math.max(20, Math.min(400, bpm));
}

/** Поточний час транспорту в секундах (для playhead). */
export function getTransportSeconds(): number {
  return Tone.getTransport().seconds;
}

/** Зупинити всі звуки негайно. */
export function panic(): void {
  Tone.getTransport().stop();
  Tone.getTransport().cancel();
}

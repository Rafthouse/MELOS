/**
 * Лінивий шим над @melos/audio.
 *
 * Mode Explorer (стартовий вид) рендериться без жодного аудіо — Tone.js потрібен
 * лише коли користувач реально натискає «Програти». Тому модуль @melos/audio
 * (а з ним і Tone, ~59 kB gzip) підвантажується динамічно при першому виклику,
 * а не потрапляє у первинний бандл.
 *
 * AudioContext стартує через sticky-activation (користувач уже клікнув по кнопці),
 * тож resume() після await-завантаження чанка дозволений.
 */
import type { ScaleDirection } from "@melos/audio";

type AudioMod = typeof import("@melos/audio");

let modPromise: Promise<AudioMod> | null = null;

/** Підвантажує (один раз) і кешує модуль аудіо. */
function load(): Promise<AudioMod> {
  if (!modPromise) modPromise = import("@melos/audio");
  return modPromise;
}

export type { ScaleDirection };

export async function playScale(
  ...args: Parameters<AudioMod["playScale"]>
): Promise<void> {
  const m = await load();
  await m.initAudio();
  m.playScale(...args);
}

export async function playNote(
  ...args: Parameters<AudioMod["playNote"]>
): Promise<void> {
  const m = await load();
  await m.initAudio();
  m.playNote(...args);
}

/** Зупиняє відтворення. Якщо аудіо ще не вантажилось — зупиняти нічого. */
export function stopPlayback(): void {
  if (modPromise) void modPromise.then((m) => m.stopPlayback());
}

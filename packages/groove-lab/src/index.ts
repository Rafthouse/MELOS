import { GGL_SKELETON_HTML } from "./skeleton";

/**
 * Groove Grammar Lab інтегрується як бібліотека MELOS.
 * - skeleton рендериться в контейнер
 * - shared AudioContext передається через window-hook
 * - bootstrap у функції mountGroove() підтримує re-mount (C1)
 * - styles префіксовані .ggl-root (C2)
 * - pattern API через window-hooks для двостороннього обміну (C3)
 */

export interface GrooveEvent {
  id: string;
  track: string;
  step: number;
  bar: number;
  localStep: number;
  layer: string;
  velocity: number;
  reason: string;
  ghost: boolean;
  accent: boolean;
  fill: boolean;
}

export interface GroovePattern {
  styleName: string;
  subtitle?: string;
  settings: {
    style: string;
    bars: number;
    meter: string;
    stepsPerBar?: number;
    tempo: number;
    complexity: number;
    density: number;
    swing: number;
    human: number;
  };
  totalSteps: number;
  events: GrooveEvent[];
}

export interface GrooveOptions {
  /** Shared AudioContext (Tone.getContext().rawContext). Опц. — GGL створить свій. */
  audioContext?: AudioContext;
  /** Колбек при будь-якій зміні pattern (generate/mutate/toggle/style зміна). */
  onPatternChange?: (pattern: GroovePattern) => void;
}

export interface GrooveInstance {
  /** Поточний pattern GGL (snapshot). */
  getPattern(): GroovePattern | null;
  /** Видалити DOM-skeleton GGL із контейнера + відписати listener. */
  dispose(): void;
}

declare global {
  interface Window {
    __MELOS_GGL_AUDIO_CTX__?: AudioContext;
    __MELOS_GGL_MOUNT__?: () => void;
    __MELOS_GGL_PATTERN_LISTENERS__?: Set<(p: GroovePattern) => void>;
    __MELOS_GGL_GET_PATTERN__?: () => GroovePattern | null;
    __MELOS_GGL_ON_PATTERN__?: (cb: (p: GroovePattern) => void) => () => void;
  }
}

let loaded = false;

export async function createGroove(
  container: HTMLElement,
  opts: GrooveOptions = {},
): Promise<GrooveInstance> {
  // Skeleton у контейнер (DOM-id мають бути у документі ДО mountGroove()).
  container.innerHTML = GGL_SKELETON_HTML;

  // Передаємо AudioContext через window-hook, який GGL прочитає у initAudio.
  if (opts.audioContext) {
    window.__MELOS_GGL_AUDIO_CTX__ = opts.audioContext;
  }

  // Первинне завантаження GGL-коду (один раз на життя сторінки).
  // rhythm-packs реєструє window.EXTRA_RHYTHMS — має йти першим.
  if (!loaded) {
    await import("./rhythm-packs.js");
    await import("./ggl-core.js");
    loaded = true;
  }

  // Re-mount: викликаємо window.__MELOS_GGL_MOUNT__ щоразу. Він знаходить свіжі DOM-id,
  // перевстановлює обробники, виставляє defaults і генерує патерн.
  window.__MELOS_GGL_MOUNT__?.();

  // Підписка на зміни pattern.
  let unsubscribe: (() => void) | null = null;
  if (opts.onPatternChange && window.__MELOS_GGL_ON_PATTERN__) {
    unsubscribe = window.__MELOS_GGL_ON_PATTERN__(opts.onPatternChange);
  }

  return {
    getPattern() {
      return window.__MELOS_GGL_GET_PATTERN__?.() ?? null;
    },
    dispose() {
      unsubscribe?.();
      container.innerHTML = "";
    },
  };
}

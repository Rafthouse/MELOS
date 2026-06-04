import { describe, it, expect } from "vitest";

/**
 * Tone.js потребує Web Audio API (браузерне середовище).
 * Ці тести перевіряють, що модулі імпортуються і типи коректні.
 * Реальний аудіо-тест — інтеграційний у apps/web (браузер).
 */

describe("@melos/audio exports", () => {
  it("engine exports імпортуються", async () => {
    const mod = await import("../src/engine");
    expect(typeof mod.initAudio).toBe("function");
    expect(typeof mod.getEngineState).toBe("function");
    expect(typeof mod.getTempo).toBe("function");
    expect(typeof mod.setTempo).toBe("function");
    expect(typeof mod.panic).toBe("function");
  });

  it("instruments exports імпортуються", async () => {
    const mod = await import("../src/instruments");
    expect(typeof mod.getInstrument).toBe("function");
    expect(typeof mod.disposeAll).toBe("function");
  });

  it("player exports імпортуються", async () => {
    const mod = await import("../src/player");
    expect(typeof mod.playSequence).toBe("function");
    expect(typeof mod.playNote).toBe("function");
    expect(typeof mod.playInterval).toBe("function");
    expect(typeof mod.playChord).toBe("function");
    expect(typeof mod.playScale).toBe("function");
    expect(typeof mod.playMelody).toBe("function");
    expect(typeof mod.stopPlayback).toBe("function");
    expect(typeof mod.isPlaying).toBe("function");
  });
});

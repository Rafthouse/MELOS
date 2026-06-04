import { describe, it, expect } from "vitest";
import {
  Scheduler,
  generateIntervalCards,
  serializeDeck, deserializeDeck,
  saveDeck, loadDeck,
  createMemoryAdapter,
} from "../src/index";

const NOW = new Date("2026-06-01T12:00:00Z");

describe("серіалізація колоди", () => {
  it("roundtrip: serialize → deserialize зберігає все", () => {
    const s = new Scheduler();
    const deck = s.createDeck("ear-intervals", "Інтервали");
    s.addCards(deck, generateIntervalCards());
    s.answer(deck, "interval:7:ascending", "good", NOW);
    s.answer(deck, "interval:3:descending", "wrong", NOW);

    const json = serializeDeck(deck);
    const restored = deserializeDeck(json);

    expect(restored.id).toBe("ear-intervals");
    expect(restored.name).toBe("Інтервали");
    expect(restored.states.size).toBe(36);

    const p5 = restored.states.get("interval:7:ascending")!;
    expect(p5.card.reps).toBe(1);
    expect(p5.logs.length).toBe(1);

    const m3 = restored.states.get("interval:3:descending")!;
    expect(m3.card.reps).toBe(1);
  });

  it("порожня колода серіалізується і десеріалізується", () => {
    const s = new Scheduler();
    const deck = s.createDeck("empty", "Порожня");

    const json = serializeDeck(deck);
    const restored = deserializeDeck(json);

    expect(restored.states.size).toBe(0);
  });
});

describe("persistence adapter (in-memory)", () => {
  it("save → load → колода відновлюється", () => {
    const adapter = createMemoryAdapter();
    const s = new Scheduler();
    const deck = s.createDeck("test", "Тест");
    s.addCards(deck, generateIntervalCards().slice(0, 5));
    s.answer(deck, generateIntervalCards()[0]!.id, "good", NOW);

    saveDeck(deck, adapter);
    const loaded = loadDeck("test", adapter);

    expect(loaded).not.toBeNull();
    expect(loaded!.states.size).toBe(5);
  });

  it("load неіснуючої колоди → null", () => {
    const adapter = createMemoryAdapter();
    expect(loadDeck("nonexistent", adapter)).toBeNull();
  });
});

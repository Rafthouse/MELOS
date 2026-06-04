import type { Deck, CardState } from "./scheduler";
import type { Card, ReviewLog } from "ts-fsrs";

/**
 * Серіалізація/десеріалізація колоди для persistence.
 *
 * v0.1: localStorage у браузері.
 * v0.3+ (Tauri): файлова система або SQLite.
 *
 * Deck.states — це Map, яку JSON не серіалізує напряму,
 * тому конвертуємо в масив.
 */

interface SerializedDeck {
  id: string;
  name: string;
  states: Array<{
    cardId: string;
    card: Card;
    logs: ReviewLog[];
  }>;
}

/** Серіалізувати колоду в JSON-рядок. */
export function serializeDeck(deck: Deck): string {
  const serialized: SerializedDeck = {
    id: deck.id,
    name: deck.name,
    states: Array.from(deck.states.values()).map((s) => ({
      cardId: s.cardId,
      card: s.card,
      logs: s.logs,
    })),
  };
  return JSON.stringify(serialized);
}

/** Десеріалізувати колоду з JSON-рядка. */
export function deserializeDeck(json: string): Deck {
  const data: SerializedDeck = JSON.parse(json);
  const states = new Map<string, CardState>();

  for (const s of data.states) {
    states.set(s.cardId, {
      cardId: s.cardId,
      card: s.card,
      logs: s.logs,
    });
  }

  return {
    id: data.id,
    name: data.name,
    states,
  };
}

/**
 * Адаптер persistence. v0.1 — localStorage.
 */
export interface PersistenceAdapter {
  save(key: string, data: string): void;
  load(key: string): string | null;
  remove(key: string): void;
}

/** localStorage-адаптер (браузер). */
export const localStorageAdapter: PersistenceAdapter = {
  save(key, data) {
    try { localStorage.setItem(key, data); } catch { /* quota exceeded — ігноруємо */ }
  },
  load(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* ігноруємо */ }
  },
};

/** In-memory адаптер (для тестів). */
export function createMemoryAdapter(): PersistenceAdapter {
  const store = new Map<string, string>();
  return {
    save(key, data) { store.set(key, data); },
    load(key) { return store.get(key) ?? null; },
    remove(key) { store.delete(key); },
  };
}

const DECK_PREFIX = "melos:deck:";

/** Зберегти колоду через адаптер. */
export function saveDeck(deck: Deck, adapter: PersistenceAdapter): void {
  adapter.save(`${DECK_PREFIX}${deck.id}`, serializeDeck(deck));
}

/** Завантажити колоду з адаптера. */
export function loadDeck(deckId: string, adapter: PersistenceAdapter): Deck | null {
  const json = adapter.load(`${DECK_PREFIX}${deckId}`);
  if (!json) return null;
  return deserializeDeck(json);
}

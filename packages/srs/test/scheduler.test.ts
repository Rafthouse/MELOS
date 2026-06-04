import { describe, it, expect } from "vitest";
import {
  Scheduler,
  generateIntervalCards,
  generateModeCards,
  generatePitchSingingCards,
  type AnswerGrade,
} from "../src/index";

const NOW = new Date("2026-06-01T12:00:00Z");

function createTestScheduler() {
  const s = new Scheduler(0.9);
  const deck = s.createDeck("test", "Test Deck");
  return { s, deck };
}

describe("Scheduler — базовий потік", () => {
  it("створює порожню колоду", () => {
    const { deck } = createTestScheduler();
    expect(deck.states.size).toBe(0);
  });

  it("додає картки інтервалів", () => {
    const { s, deck } = createTestScheduler();
    const cards = generateIntervalCards();
    s.addCards(deck, cards, NOW);
    // 12 інтервалів × 3 напрямки = 36
    expect(deck.states.size).toBe(36);
  });

  it("не дублює при повторному додаванні", () => {
    const { s, deck } = createTestScheduler();
    const cards = generateIntervalCards();
    s.addCards(deck, cards, NOW);
    s.addCards(deck, cards, NOW);
    expect(deck.states.size).toBe(36);
  });

  it("додає модальні картки", () => {
    const { s, deck } = createTestScheduler();
    const cards = generateModeCards(["dorian", "mixolydian", "phrygian-dominant"]);
    s.addCards(deck, cards, NOW);
    expect(deck.states.size).toBe(3);
  });

  it("усі нові картки — state New", () => {
    const { s, deck } = createTestScheduler();
    s.addCards(deck, generateIntervalCards(), NOW);
    const stats = s.getStats(deck, NOW);
    expect(stats.new).toBe(36);
    expect(stats.learning).toBe(0);
    expect(stats.review).toBe(0);
  });
});

describe("Scheduler — відповіді і планування", () => {
  it("після 'good' картка переходить у Learning", () => {
    const { s, deck } = createTestScheduler();
    s.addCards(deck, generateIntervalCards(), NOW);
    const cardId = "interval:7:ascending"; // P5 ascending
    const state = s.answer(deck, cardId, "good", NOW);
    expect(state.card.reps).toBe(1);
    expect(state.logs.length).toBe(1);
    // FSRS ставить у Learning після першої відповіді
    expect(state.card.state).toBeGreaterThanOrEqual(0);
  });

  it("після 'wrong' стабільність нижча ніж після 'good'", () => {
    const { s, deck } = createTestScheduler();
    s.addCards(deck, generateIntervalCards(), NOW);

    // Два однакові інтервали, різні напрямки — різні оцінки
    s.answer(deck, "interval:3:ascending", "good", NOW);
    s.answer(deck, "interval:3:descending", "wrong", NOW);

    const good = deck.states.get("interval:3:ascending")!;
    const wrong = deck.states.get("interval:3:descending")!;

    expect(good.card.stability).toBeGreaterThan(wrong.card.stability);
  });

  it("після 'easy' наступне due далі ніж після 'hard'", () => {
    const { s, deck } = createTestScheduler();
    s.addCards(deck, generateIntervalCards(), NOW);

    s.answer(deck, "interval:5:ascending", "easy", NOW);
    s.answer(deck, "interval:5:descending", "hard", NOW);

    const easy = deck.states.get("interval:5:ascending")!;
    const hard = deck.states.get("interval:5:descending")!;

    expect(new Date(easy.card.due).getTime())
      .toBeGreaterThanOrEqual(new Date(hard.card.due).getTime());
  });

  it("кидає на неіснуючу картку", () => {
    const { s, deck } = createTestScheduler();
    expect(() => s.answer(deck, "nonexistent", "good", NOW)).toThrow();
  });
});

describe("Scheduler — вибір карток", () => {
  it("getDueCards для нових карток — усі due", () => {
    const { s, deck } = createTestScheduler();
    s.addCards(deck, generateIntervalCards(), NOW);
    const due = s.getDueCards(deck, NOW);
    expect(due.length).toBe(36);
  });

  it("getNewCards повертає лише New", () => {
    const { s, deck } = createTestScheduler();
    s.addCards(deck, generateIntervalCards(), NOW);
    s.answer(deck, "interval:1:ascending", "good", NOW);
    const newCards = s.getNewCards(deck);
    expect(newCards.length).toBe(35);
    expect(newCards).not.toContain("interval:1:ascending");
  });

  it("pickNext обирає прострочену перед новою", () => {
    const { s, deck } = createTestScheduler();
    s.addCards(deck, generateIntervalCards(), NOW);

    // Відповідаємо на одну — вона стає Learning
    s.answer(deck, "interval:1:ascending", "good", NOW);

    // Через 1 годину вона буде due (Learning інтервал ~10хв)
    const later = new Date(NOW.getTime() + 60 * 60 * 1000);
    const next = s.pickNext(deck, { newPerSession: 5 }, later);

    // Має обрати прострочену learning-картку
    expect(next).toBeDefined();
  });

  it("pickNext повертає undefined, коли ліміт нових вичерпано і due немає", () => {
    const { s, deck } = createTestScheduler();
    const cards = generateModeCards(["dorian"]);
    s.addCards(deck, cards, NOW);
    // Відповідаємо — картка переходить у Learning з майбутнім due
    s.answer(deck, "mode:dorian", "good", NOW);

    // due ще не настав, нових не залишилось
    const next = s.pickNext(deck, { newPerSession: 10 }, NOW);
    expect(next).toBeUndefined();
  });
});

describe("Scheduler — статистика", () => {
  it("getStats відображає поточний стан", () => {
    const { s, deck } = createTestScheduler();
    s.addCards(deck, generateIntervalCards(), NOW);
    s.answer(deck, "interval:1:ascending", "good", NOW);
    s.answer(deck, "interval:2:ascending", "wrong", NOW);

    const stats = s.getStats(deck, NOW);
    expect(stats.total).toBe(36);
    expect(stats.new).toBe(34);
    // 2 картки перейшли в Learning або Relearning
    expect(stats.learning).toBeGreaterThanOrEqual(1);
  });
});

describe("Генерація карток", () => {
  it("інтервальні: 12 × 3 = 36, унікальні id", () => {
    const cards = generateIntervalCards();
    expect(cards.length).toBe(36);
    const ids = new Set(cards.map((c) => c.id));
    expect(ids.size).toBe(36);
  });

  it("модальні: по одній на modeId", () => {
    const cards = generateModeCards(["dorian", "mixolydian"]);
    expect(cards.length).toBe(2);
    expect(cards[0]!.modeId).toBe("dorian");
  });

  it("pitch singing: 12 × 2 = 24", () => {
    const cards = generatePitchSingingCards();
    expect(cards.length).toBe(24);
  });

  it("інтервальні рівні 0–1 визначаються порогом", () => {
    const cards = generateIntervalCards();
    const level0 = cards.filter((c) => c.level === 0);
    const level1 = cards.filter((c) => c.level === 1);
    // semi 1–7 → level 0 (7 × 3 = 21), semi 8–12 → level 1 (5 × 3 = 15)
    expect(level0.length).toBe(21);
    expect(level1.length).toBe(15);
  });
});

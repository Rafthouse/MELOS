import {
  fsrs,
  createEmptyCard,
  Rating,
  State,
  type FSRS,
  type Card,
  type ReviewLog,
} from "ts-fsrs";
import type { CardDef } from "./cards";

// Re-export Rating для зручності споживачів
export { Rating, State };
export type { Card, ReviewLog };

/**
 * Результат відповіді користувача на вправу.
 *
 * Маппінг на FSRS Rating:
 *   wrong  → Again (1)  — не впізнав / промахнувся
 *   hard   → Hard (2)   — впізнав із зусиллям / з 2-ї спроби
 *   good   → Good (3)   — впізнав правильно
 *   easy   → Easy (4)   — миттєво і без сумнівів
 */
export type AnswerGrade = "wrong" | "hard" | "good" | "easy";

const GRADE_TO_RATING: Record<AnswerGrade, Rating> = {
  wrong: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

/**
 * Стан картки в колоді: FSRS Card + історія відповідей.
 */
export interface CardState {
  readonly cardId: string;
  card: Card;
  logs: ReviewLog[];
}

/**
 * Колода — набір карток зі станами FSRS.
 *
 * Чистий об'єкт, серіалізується в JSON для persistence.
 * Не знає про CardDef (тільки cardId) — зв'язок через зовнішній реєстр.
 */
export interface Deck {
  readonly id: string;
  readonly name: string;
  states: Map<string, CardState>;
}

/**
 * Планувальник MELOS — обгортка над ts-fsrs.
 *
 * Один екземпляр на застосунок. Працює з будь-якою кількістю колод.
 * Retention target = 0.9 (90%) — стандартне значення FSRS.
 */
export class Scheduler {
  private readonly engine: FSRS;

  constructor(retention: number = 0.9) {
    this.engine = fsrs({ request_retention: retention });
  }

  /** Створити порожню колоду. */
  createDeck(id: string, name: string): Deck {
    return { id, name, states: new Map() };
  }

  /**
   * Додати картки в колоду (якщо ще не додані).
   * Створює порожній FSRS Card для кожної нової.
   * @param now — дата створення (due = now для нових). За замовчуванням Date.now().
   */
  addCards(deck: Deck, cardDefs: readonly CardDef[], now: Date = new Date()): void {
    for (const def of cardDefs) {
      if (!deck.states.has(def.id)) {
        deck.states.set(def.id, {
          cardId: def.id,
          card: createEmptyCard(now),
          logs: [],
        });
      }
    }
  }

  /**
   * Записати відповідь користувача і перепланувати картку.
   *
   * @returns Оновлений CardState з новою датою наступного повторення.
   */
  answer(deck: Deck, cardId: string, grade: AnswerGrade, now: Date = new Date()): CardState {
    const state = deck.states.get(cardId);
    if (!state) {
      throw new Error(`Картка "${cardId}" не знайдена в колоді "${deck.id}"`);
    }

    const rating = GRADE_TO_RATING[grade];
    const result = this.engine.repeat(state.card, now);
    // IPreview має ключі 1–4 (Again..Easy); Rating.Manual (0) ніколи не використовується.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chosen = (result as any)[rating] as { card: Card; log: ReviewLog } | undefined;

    if (!chosen) {
      throw new Error(`FSRS не повернув результат для рейтингу ${rating}`);
    }

    state.card = chosen.card;
    state.logs.push(chosen.log);

    return state;
  }

  /**
   * Картки, які треба повторити зараз (due ≤ now).
   * Відсортовані: найбільш прострочені першими.
   */
  getDueCards(deck: Deck, now: Date = new Date()): string[] {
    const due: Array<{ id: string; dueTime: number }> = [];

    for (const [id, state] of deck.states) {
      const dueDate = new Date(state.card.due);
      if (dueDate <= now) {
        due.push({ id, dueTime: dueDate.getTime() });
      }
    }

    due.sort((a, b) => a.dueTime - b.dueTime);
    return due.map((d) => d.id);
  }

  /**
   * Нові картки (state = New, жодного повторення).
   */
  getNewCards(deck: Deck): string[] {
    const result: string[] = [];
    for (const [id, state] of deck.states) {
      if (state.card.state === State.New) {
        result.push(id);
      }
    }
    return result;
  }

  /**
   * Вибрати наступну картку для сесії.
   *
   * Пріоритет: прострочені (due) → нові (до ліміту на сесію).
   * Повертає cardId або undefined, якщо нічого не залишилось.
   */
  pickNext(deck: Deck, opts: { newPerSession?: number } = {}, now: Date = new Date()): string | undefined {
    const due = this.getDueCards(deck, now);
    if (due.length > 0) return due[0];

    const maxNew = opts.newPerSession ?? 10;
    const newCards = this.getNewCards(deck);
    const introduced = this.countIntroducedToday(deck, now);

    if (introduced < maxNew && newCards.length > 0) {
      return newCards[0];
    }

    return undefined;
  }

  /**
   * Скільки нових карток було введено сьогодні
   * (щоб обмежити потік нового матеріалу).
   */
  private countIntroducedToday(deck: Deck, now: Date): number {
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    let count = 0;

    for (const [, state] of deck.states) {
      if (state.logs.length === 1) {
        const firstReview = new Date(state.logs[0]!.review);
        if (firstReview >= todayStart) count++;
      }
    }
    return count;
  }

  /**
   * Статистика колоди.
   */
  getStats(deck: Deck, now: Date = new Date()): DeckStats {
    let newCount = 0;
    let learningCount = 0;
    let reviewCount = 0;
    let dueCount = 0;

    for (const [, state] of deck.states) {
      switch (state.card.state) {
        case State.New: newCount++; break;
        case State.Learning:
        case State.Relearning: learningCount++; break;
        case State.Review: reviewCount++; break;
      }
      if (new Date(state.card.due) <= now) dueCount++;
    }

    return {
      total: deck.states.size,
      new: newCount,
      learning: learningCount,
      review: reviewCount,
      due: dueCount,
    };
  }
}

export interface DeckStats {
  readonly total: number;
  readonly new: number;
  readonly learning: number;
  readonly review: number;
  readonly due: number;
}

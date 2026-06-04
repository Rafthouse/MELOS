import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  Scheduler,
  generateIntervalCards,
  saveDeck,
  loadDeck,
  localStorageAdapter,
  type Deck,
  type IntervalCard,
  type AnswerGrade,
} from "@melos/srs";
import { initAudio, playInterval } from "@melos/audio";
import { intervalFromSemitones, pitchFromMidi } from "@melos/core-theory";
import { UA_INTERVAL_NAMES, UA_INTERVAL_FULL } from "../labels";

const DECK_ID = "ear-intervals";
const SEMITONES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** Випадковий корінь у комфортному діапазоні (G3–E4), щоб +12 лишалось чутним. */
function randomRoot(): number {
  return 55 + Math.floor(Math.random() * 10); // 55..64
}

type Phase = "question" | "answered" | "done";

interface Feedback {
  guess: number;
  correct: number;
  isCorrect: boolean;
}

export function EarTraining() {
  const schedulerRef = useRef<Scheduler>(new Scheduler(0.9));
  const cardRegistry = useMemo(() => {
    const cards = generateIntervalCards();
    return new Map<string, IntervalCard>(cards.map((c) => [c.id, c]));
  }, []);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentId, setCurrentId] = useState<string | undefined>(undefined);
  const [rootMidi, setRootMidi] = useState<number>(randomRoot());
  const [phase, setPhase] = useState<Phase>("question");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [statsVersion, setStatsVersion] = useState(0); // форс ререндер статистики

  // Ініціалізація колоди (load або create), додавання карток, вибір першої.
  useEffect(() => {
    const s = schedulerRef.current;
    let d = loadDeck(DECK_ID, localStorageAdapter);
    if (!d) {
      d = s.createDeck(DECK_ID, "Інтервали");
    }
    s.addCards(d, generateIntervalCards());
    const next = s.pickNext(d, { newPerSession: 12 });
    setDeck(d);
    setCurrentId(next);
    setPhase(next ? "question" : "done");
    setRootMidi(randomRoot());
  }, []);

  const currentCard = currentId ? cardRegistry.get(currentId) : undefined;

  const playCurrent = useCallback(async () => {
    if (!currentCard) return;
    await initAudio();
    const root = pitchFromMidi(rootMidi);
    const semis = currentCard.semitones;
    const dir = currentCard.direction;
    const second = pitchFromMidi(
      dir === "descending" ? rootMidi - semis : rootMidi + semis,
    );
    playInterval(root.fullName, second.fullName, {
      harmonic: dir === "harmonic",
    });
  }, [currentCard, rootMidi]);

  const handleGuess = useCallback(
    (guess: number) => {
      if (!deck || !currentCard || phase !== "question") return;
      const s = schedulerRef.current;
      const correct = currentCard.semitones;
      const isCorrect = guess === correct;
      const grade: AnswerGrade = isCorrect ? "good" : "wrong";

      s.answer(deck, currentCard.id, grade);
      saveDeck(deck, localStorageAdapter);

      setFeedback({ guess, correct, isCorrect });
      setPhase("answered");
      setStatsVersion((v) => v + 1);
    },
    [deck, currentCard, phase],
  );

  const handleNext = useCallback(() => {
    if (!deck) return;
    const s = schedulerRef.current;
    const next = s.pickNext(deck, { newPerSession: 12 });
    setCurrentId(next);
    setFeedback(null);
    setRootMidi(randomRoot());
    setPhase(next ? "question" : "done");
  }, [deck]);

  const stats = useMemo(() => {
    if (!deck) return null;
    void statsVersion; // залежність для перерахунку
    return schedulerRef.current.getStats(deck);
  }, [deck, statsVersion]);

  // Напрямок українською для підказки.
  const directionLabel = currentCard
    ? currentCard.direction === "ascending"
      ? "вгору"
      : currentCard.direction === "descending"
        ? "вниз"
        : "гармонічно (разом)"
    : "";

  return (
    <div className="ear">
      <header className="ear__header">
        <h1 className="ear__title">Розпізнавання інтервалів</h1>
        {stats && (
          <div className="ear__stats">
            <span className="ear__stat">
              <span className="ear__stat-num">{stats.due}</span> до повторення
            </span>
            <span className="ear__stat">
              <span className="ear__stat-num">{stats.new}</span> нових
            </span>
            <span className="ear__stat text-stable">
              <span className="ear__stat-num">{stats.review}</span> вивчених
            </span>
          </div>
        )}
      </header>

      {phase === "done" ? (
        <div className="ear__done info-block">
          <h3 className="info-block__title">Сесію завершено</h3>
          <p className="text-secondary">
            Усі картки на сьогодні повторено. FSRS заплановано наступні
            повторення — повертайтесь пізніше.
          </p>
        </div>
      ) : (
        <>
          {/* Картка вправи */}
          <div className="ear__card">
            <button className="btn btn--play ear__play" onClick={playCurrent}>
              {phase === "question" ? "▶ Програти інтервал" : "↻ Програти ще раз"}
            </button>
            <p className="ear__hint text-secondary">напрямок: {directionLabel}</p>
          </div>

          {/* Варіанти відповідей */}
          <div className="ear__options">
            {SEMITONES.map((semi) => {
              const isGuess = feedback?.guess === semi;
              const isCorrect = feedback?.correct === semi;
              let cls = "ear__option";
              if (phase === "answered") {
                if (isCorrect) cls += " ear__option--correct";
                else if (isGuess) cls += " ear__option--wrong";
                else cls += " ear__option--dim";
              }
              return (
                <button
                  key={semi}
                  className={cls}
                  disabled={phase === "answered"}
                  onClick={() => handleGuess(semi)}
                  title={UA_INTERVAL_FULL[semi]}
                >
                  {UA_INTERVAL_NAMES[semi]}
                </button>
              );
            })}
          </div>

          {/* Зворотний зв'язок */}
          {phase === "answered" && feedback && (
            <div
              className={
                "ear__feedback " +
                (feedback.isCorrect ? "ear__feedback--ok" : "ear__feedback--no")
              }
            >
              <div className="ear__feedback-verdict">
                {feedback.isCorrect ? "✓ Правильно" : "✗ Неправильно"}
              </div>
              <div className="ear__feedback-detail">
                Це <strong>{UA_INTERVAL_FULL[feedback.correct]}</strong> (
                {intervalFromSemitones(feedback.correct).name}) —{" "}
                <span className="text-secondary">
                  {intervalFromSemitones(feedback.correct).affect.uk}
                </span>
              </div>
              <button className="btn ear__next" onClick={handleNext} autoFocus>
                Далі →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

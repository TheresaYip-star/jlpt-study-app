"use client";

import { useMemo, useState, useTransition } from "react";
import { saveQuizResult } from "@/app/actions";
import type { Vocabulary } from "@/lib/study-types";

type Question = {
  id: string;
  word: string;
  reading: string;
  romaji: string | null;
  correct: string;
  choices: string[];
  explanation: string | null;
};

type Answer = {
  id: string;
  word: string;
  selected: string;
  correct: string;
  isCorrect: boolean;
};

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function buildQuestions(words: Vocabulary[]): Question[] {
  const pool = shuffle(words).slice(0, 10);
  return pool.map((word) => {
    const distractors = shuffle(words.filter((item) => item.id !== word.id))
      .slice(0, 3)
      .map((item) => item.meaning);
    return {
      id: word.id,
      word: word.word,
      reading: word.reading,
      romaji: word.romaji,
      correct: word.meaning,
      choices: shuffle([word.meaning, ...distractors]),
      explanation: word.notes,
    };
  });
}

export function QuizEngine({ words }: { words: Vocabulary[] }) {
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selected, setSelected] = useState("");
  const [showRomaji, setShowRomaji] = useState(false);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [savedScore, setSavedScore] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const questions = useMemo(() => buildQuestions(words), [words]);
  const current = questions[questionIndex];

  function start() {
    setStarted(true);
    setQuestionIndex(0);
    setAnswers([]);
    setSelected("");
    setShowRomaji(false);
    setSavedScore(null);
    setMessage("");
    setStartedAt(Date.now());
  }

  function next() {
    if (!current || !selected) return;
    const answer: Answer = {
      id: current.id,
      word: current.word,
      selected,
      correct: current.correct,
      isCorrect: selected === current.correct,
    };
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);
    setSelected("");
    setShowRomaji(false);

    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((value) => value + 1);
      return;
    }

    startTransition(async () => {
      const correctAnswers = nextAnswers.filter((item) => item.isCorrect).length;
      const result = await saveQuizResult({
        totalQuestions: nextAnswers.length,
        correctAnswers,
        durationSeconds: Math.round((Date.now() - startedAt) / 1000),
        answers: nextAnswers,
      });
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setSavedScore(result.data.scorePercent);
    });
  }

  function selectAnswer(choice: string) {
    if (selected || isPending) return;
    setSelected(choice);
  }

  if (words.length < 4) {
    return <div className="panel">Add at least 4 vocabulary items before starting a quiz.</div>;
  }

  if (!started) {
    return (
      <section className="panel max-w-2xl space-y-4">
        <h2 className="text-2xl font-bold">Vocabulary meaning quiz</h2>
        <p className="text-slate-600">
          Answer 10 multiple-choice questions. Your final score is saved to quiz results.
        </p>
        <button className="button" onClick={start}>
          Start quiz
        </button>
      </section>
    );
  }

  if (savedScore !== null) {
    return (
      <section className="space-y-4">
        <div className="panel max-w-2xl">
          <p className="text-sm font-semibold text-blue-700">Saved to Supabase</p>
          <h2 className="text-4xl font-black">Score: {savedScore}%</h2>
          <p className="text-slate-600">
            {answers.filter((answer) => answer.isCorrect).length} correct out of {answers.length}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="button" onClick={start}>
              Retry
            </button>
            <a className="button secondary" href="/progress">
              See progress
            </a>
          </div>
        </div>
        <div className="grid-cards">
          {answers.map((answer) => (
            <div className="panel" key={answer.id}>
              <p className="text-2xl font-bold">{answer.word}</p>
              <p className={answer.isCorrect ? "font-semibold text-green-700" : "font-semibold text-red-700"}>
                Your answer: {answer.selected}
              </p>
              <p className="text-sm text-slate-600">Correct: {answer.correct}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="panel max-w-2xl space-y-5">
      <div className="text-sm font-semibold text-slate-500">
        Question {questionIndex + 1} of {questions.length}
      </div>
      <div>
        <h2 className="text-5xl font-black">{current.word}</h2>
        <p className="text-slate-500">{current.reading}</p>
        {showRomaji && current.romaji ? <p className="text-slate-500">{current.romaji}</p> : null}
        {current.romaji ? (
          <button
            className="mt-2 text-sm font-semibold text-blue-700"
            onClick={() => setShowRomaji((value) => !value)}
            type="button"
          >
            {showRomaji ? "Hide Romaji" : "Show Romaji"}
          </button>
        ) : null}
      </div>
      <div className="grid gap-3">
        {current.choices.map((choice) => {
          const isCorrectChoice = choice === current.correct;
          const isWrongSelection = selected === choice && !isCorrectChoice;
          const choiceState = selected
            ? isCorrectChoice
              ? "border-green-600 bg-green-50 text-green-900"
              : isWrongSelection
                ? "border-red-600 bg-red-50 text-red-900"
                : "border-slate-200 bg-slate-50 text-slate-500"
            : "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50";

          return (
            <label
              className={`rounded-lg border p-3 font-semibold transition-colors ${choiceState} ${
                selected ? "cursor-default" : "cursor-pointer"
              }`}
              key={choice}
            >
              <input
                checked={selected === choice}
                className="mr-2"
                disabled={Boolean(selected) || isPending}
                name="choice"
                onChange={() => selectAnswer(choice)}
                type="radio"
              />
              {choice}
              {selected && isCorrectChoice ? <span className="float-right">Correct</span> : null}
              {isWrongSelection ? <span className="float-right">Incorrect</span> : null}
            </label>
          );
        })}
      </div>
      {selected ? (
        <div
          aria-live="polite"
          className={`rounded-lg border p-4 ${
            selected === current.correct
              ? "border-green-200 bg-green-50 text-green-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <p className="font-bold">
            {selected === current.correct ? "That’s correct!" : `Correct answer: ${current.correct}`}
          </p>
          {current.explanation ? <p className="mt-1 text-sm">{current.explanation}</p> : null}
        </div>
      ) : null}
      <button className="button" disabled={!selected || isPending} onClick={next}>
        {questionIndex + 1 === questions.length ? "Submit quiz" : "Next"}
      </button>
      {message ? <p className="font-semibold text-red-600">{message}</p> : null}
    </section>
  );
}

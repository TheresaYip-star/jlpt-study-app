"use client";

import { useMemo, useState, useTransition } from "react";
import { saveQuizResult } from "@/app/actions";
import type { Vocabulary } from "@/lib/study-types";

type Question = {
  id: string;
  word: string;
  reading: string;
  correct: string;
  choices: string[];
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
      correct: word.meaning,
      choices: shuffle([word.meaning, ...distractors]),
    };
  });
}

export function QuizEngine({ words }: { words: Vocabulary[] }) {
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selected, setSelected] = useState("");
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
      </div>
      <div className="grid gap-3">
        {current.choices.map((choice) => (
          <label
            className={`cursor-pointer rounded-lg border p-3 font-semibold ${
              selected === choice ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white"
            }`}
            key={choice}
          >
            <input
              checked={selected === choice}
              className="mr-2"
              name="choice"
              onChange={() => setSelected(choice)}
              type="radio"
            />
            {choice}
          </label>
        ))}
      </div>
      <button className="button" disabled={!selected || isPending} onClick={next}>
        {questionIndex + 1 === questions.length ? "Submit quiz" : "Next"}
      </button>
      {message ? <p className="font-semibold text-red-600">{message}</p> : null}
    </section>
  );
}

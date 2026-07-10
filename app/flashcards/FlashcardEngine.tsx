"use client";

import { useMemo, useState, useTransition } from "react";
import { recordFlashcardReview, startFlashcardSession } from "@/app/actions";
import type { Vocabulary } from "@/lib/study-types";

type Props = {
  words: Vocabulary[];
};

export function FlashcardEngine({ words }: Props) {
  const [started, setStarted] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [unknown, setUnknown] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [showRomaji, setShowRomaji] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const deck = useMemo(() => words.slice(0, 10), [words]);
  const current = deck[index];
  const complete = started && index >= deck.length;

  function start() {
    setMessage("");
    startTransition(async () => {
      const result = await startFlashcardSession();
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setSessionId(result.data.sessionId);
      setStarted(true);
      setIndex(0);
      setKnown(0);
      setUnknown(0);
      setFlipped(false);
      setStartTime(Date.now());
    });
  }

  function answer(result: "known" | "unknown") {
    if (!current || !sessionId) return;
    setMessage("");
    startTransition(async () => {
      const saved = await recordFlashcardReview({
        sessionId,
        vocabularyId: current.id,
        result,
        durationSeconds: Math.round((Date.now() - startTime) / 1000),
      });
      if (!saved.ok) {
        setMessage(saved.error);
        return;
      }
      setKnown(saved.data.known);
      setUnknown(saved.data.unknown);
      setIndex((value) => value + 1);
      setFlipped(false);
    });
  }

  if (words.length === 0) {
    return <div className="panel">No cards are available yet. Add N5 vocabulary first.</div>;
  }

  if (!started) {
    return (
      <section className="panel max-w-2xl space-y-4">
        <h2 className="text-2xl font-bold">N5 Vocabulary Deck</h2>
        <p className="text-slate-600">
          Study {deck.length} cards. Each Know or Don&apos;t Know answer writes to
          review history and updates the active study session.
        </p>
        <button className="button" disabled={isPending} onClick={start}>
          Start
        </button>
        {message ? <p className="font-semibold text-red-600">{message}</p> : null}
      </section>
    );
  }

  if (complete) {
    return (
      <section className="panel max-w-2xl space-y-4">
        <h2 className="text-3xl font-black">Session complete</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="stat">
            <span className="text-sm text-slate-500">Reviewed</span>
            <strong>{known + unknown}</strong>
          </div>
          <div className="stat">
            <span className="text-sm text-slate-500">Known</span>
            <strong>{known}</strong>
          </div>
          <div className="stat">
            <span className="text-sm text-slate-500">Needs review</span>
            <strong>{unknown}</strong>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="button" onClick={start}>
            Study again
          </button>
          <a className="button secondary" href="/progress">
            See progress
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
        <span>
          Card {index + 1} of {deck.length}
        </span>
        <span>
          Known {known} · Review {unknown}
        </span>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
        <input
          checked={showRomaji}
          onChange={(event) => setShowRomaji(event.target.checked)}
          type="checkbox"
        />
        Show romaji
      </label>
      <button
        className="panel min-h-80 w-full cursor-pointer text-center shadow-sm transition hover:border-blue-300"
        onClick={() => setFlipped((value) => !value)}
      >
        {!flipped ? (
          <span className="block">
            <span className="block text-6xl font-black">{current.word}</span>
            <span className="mt-6 block text-sm font-semibold text-slate-500">Click to flip</span>
          </span>
        ) : (
          <span className="block">
            <span className="block text-4xl font-black">{current.reading}</span>
            {showRomaji && current.romaji ? (
              <span className="mt-1 block text-lg text-slate-500">{current.romaji}</span>
            ) : null}
            <span className="mt-4 block text-2xl font-bold">{current.meaning}</span>
            <span className="mt-2 block text-slate-500">{current.part_of_speech}</span>
          </span>
        )}
      </button>
      <div className="grid gap-3 sm:grid-cols-2">
        <button className="button secondary" disabled={isPending} onClick={() => answer("unknown")}>
          Don&apos;t Know
        </button>
        <button className="button" disabled={isPending} onClick={() => answer("known")}>
          Know
        </button>
      </div>
      {message ? <p className="font-semibold text-red-600">{message}</p> : null}
    </section>
  );
}

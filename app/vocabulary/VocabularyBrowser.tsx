"use client";

import { useMemo, useState, useTransition } from "react";
import { deleteVocabulary, saveVocabulary } from "@/app/actions";
import type { ExampleSentence, Vocabulary } from "@/lib/study-types";

type Props = {
  words: Vocabulary[];
  examples: ExampleSentence[];
};

const emptyForm = {
  id: "",
  word: "",
  reading: "",
  romaji: "",
  meaning: "",
  part_of_speech: "",
  notes: "",
};

export function VocabularyBrowser({ words, examples }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Vocabulary | null>(words[0] ?? null);
  const [form, setForm] = useState(emptyForm);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showRomaji, setShowRomaji] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return words;
    return words.filter((word) =>
      [word.word, word.reading, word.romaji ?? "", word.meaning, word.part_of_speech ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [query, words]);

  const selectedExamples = examples.filter((example) => example.vocabulary_id === selected?.id);

  function editWord(word: Vocabulary) {
    setSelected(word);
    setForm({
      id: word.id,
      word: word.word,
      reading: word.reading,
      romaji: word.romaji ?? "",
      meaning: word.meaning,
      part_of_speech: word.part_of_speech ?? "",
      notes: word.notes ?? "",
    });
    setMessage("");
  }

  function submit(formData: FormData) {
    setMessage("");
    startTransition(async () => {
      const result = await saveVocabulary(formData);
      setMessage(result.ok ? "Vocabulary saved." : result.error);
      if (result.ok) setForm(emptyForm);
    });
  }

  function removeSelected() {
    if (!selected) return;
    setMessage("");
    startTransition(async () => {
      const result = await deleteVocabulary(selected.id);
      setMessage(result.ok ? "Vocabulary deleted." : result.error);
      if (result.ok) setSelected(null);
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        <div className="panel grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            className="input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by word, reading, romaji, meaning..."
          />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              checked={showFurigana}
              onChange={(event) => setShowFurigana(event.target.checked)}
              type="checkbox"
            />
            Show reading
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              checked={showRomaji}
              onChange={(event) => setShowRomaji(event.target.checked)}
              type="checkbox"
            />
            Show romaji
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="button secondary">N5 active</span>
          {["N4", "N3", "N2", "N1"].map((level) => (
            <span
              className="rounded-full bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-500"
              key={level}
              title="Coming soon"
            >
              {level}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="panel text-slate-600">No vocabulary matches that search.</div>
        ) : (
          <div className="grid-cards">
            {filtered.map((word) => (
              <button
                className="panel cursor-pointer text-left transition hover:border-blue-300 hover:shadow-sm"
                key={word.id}
                onClick={() => setSelected(word)}
              >
                <span className="block text-3xl font-bold">{word.word}</span>
                {showFurigana ? (
                  <>
                    <span className="block text-slate-500">{word.reading}</span>
                    {showRomaji && word.romaji ? (
                      <span className="block text-sm text-slate-500">{word.romaji}</span>
                    ) : null}
                  </>
                ) : null}
                <span className="mt-3 block font-semibold">{word.meaning}</span>
                <span className="text-sm text-slate-500">{word.part_of_speech}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <aside className="space-y-4">
        <div className="panel">
          <h2 className="text-xl font-bold">Detail</h2>
          {selected ? (
            <div className="mt-3 space-y-3">
              <div>
                <div className="text-4xl font-black">{selected.word}</div>
                <div className="text-slate-500">{selected.reading}</div>
                {showRomaji && selected.romaji ? (
                  <div className="text-sm text-slate-500">{selected.romaji}</div>
                ) : null}
              </div>
              <p className="text-lg font-semibold">{selected.meaning}</p>
              <p className="text-sm text-slate-500">{selected.part_of_speech}</p>
              {selected.notes ? <p>{selected.notes}</p> : null}
              <div className="space-y-2">
                <h3 className="font-bold">Examples</h3>
                {selectedExamples.length === 0 ? (
                  <p className="text-sm text-slate-500">No examples yet.</p>
                ) : (
                  selectedExamples.map((example) => (
                    <div className="rounded-lg bg-slate-50 p-3" key={example.id}>
                      <p className="font-semibold">{example.japanese}</p>
                      <p className="text-sm text-slate-500">{example.reading}</p>
                      <p className="text-sm">{example.translation}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <button className="button secondary" onClick={() => editWord(selected)}>
                  Edit
                </button>
                <button className="button danger" disabled={isPending} onClick={removeSelected}>
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-slate-500">Choose a vocabulary card.</p>
          )}
        </div>

        <form action={submit} className="panel space-y-3">
          <h2 className="text-xl font-bold">{form.id ? "Edit word" : "Add word"}</h2>
          <input name="id" type="hidden" value={form.id} />
          {(["word", "reading", "romaji", "meaning", "part_of_speech"] as const).map((field) => (
            <input
              className="input"
              key={field}
              name={field}
              onChange={(event) => setForm({ ...form, [field]: event.target.value })}
              placeholder={field.replaceAll("_", " ")}
              value={form[field]}
            />
          ))}
          <textarea
            className="input min-h-24"
            name="notes"
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            placeholder="Notes"
            value={form.notes}
          />
          <div className="flex gap-2">
            <button className="button" disabled={isPending}>
              Save
            </button>
            <button className="button secondary" onClick={() => setForm(emptyForm)} type="button">
              Clear
            </button>
          </div>
          {message ? <p className="text-sm font-semibold text-blue-700">{message}</p> : null}
        </form>
      </aside>
    </div>
  );
}

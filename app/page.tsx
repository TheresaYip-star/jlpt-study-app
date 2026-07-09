import { getProgressStats, getVocabulary } from "@/lib/study-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [stats, vocabulary] = await Promise.all([getProgressStats(), getVocabulary()]);

  return (
    <main className="page">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-5">
          <p className="font-semibold text-blue-700">Demo-first JLPT N5 study workspace</p>
          <h1 className="section-title">Study, answer, and see progress stick.</h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Browse N5 words, run a flashcard session, finish a vocabulary quiz, and check
            progress from Supabase-backed activity. No login wall for v1.
          </p>
          <div className="flex flex-wrap gap-3">
            <a className="button" href="/flashcards">
              Start flashcards
            </a>
            <a className="button secondary" href="/vocabulary">
              Browse vocabulary
            </a>
          </div>
        </section>

        <section className="panel">
          <h2 className="text-xl font-bold">Today</h2>
          <div className="mt-4 grid gap-3">
            <div className="stat">
              <span className="text-sm text-slate-500">Cards studied</span>
              <strong>{stats.wordsStudied}</strong>
            </div>
            <div className="stat">
              <span className="text-sm text-slate-500">Quiz average</span>
              <strong>{stats.averageScore}%</strong>
            </div>
            <div className="stat">
              <span className="text-sm text-slate-500">N5 words available</span>
              <strong>{vocabulary.length}</strong>
            </div>
          </div>
          <a className="button mt-4 w-full" href="/progress">
            View progress
          </a>
        </section>
      </div>
    </main>
  );
}

import { getProgressStats } from "@/lib/study-data";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const stats = await getProgressStats();
  const goalPercent = Math.min(100, Math.round((stats.studiedToday / stats.dailyGoal) * 100));

  return (
    <main className="page space-y-6">
      <div>
        <p className="font-semibold text-blue-700">Server-derived progress</p>
        <h1 className="section-title">Your study record.</h1>
      </div>

      {stats.wordsStudied === 0 && stats.quizzesTaken === 0 ? (
        <section className="panel max-w-2xl space-y-4">
          <h2 className="text-2xl font-bold">Start studying to see your progress here.</h2>
          <a className="button" href="/flashcards">
            Start flashcards
          </a>
        </section>
      ) : (
        <>
          <section className="grid-cards">
            <div className="stat">
              <span className="text-sm text-slate-500">Words studied</span>
              <strong>{stats.wordsStudied}</strong>
            </div>
            <div className="stat">
              <span className="text-sm text-slate-500">Known / review</span>
              <strong>
                {stats.cardsKnown}/{stats.cardsUnknown}
              </strong>
            </div>
            <div className="stat">
              <span className="text-sm text-slate-500">Quizzes taken</span>
              <strong>{stats.quizzesTaken}</strong>
            </div>
            <div className="stat">
              <span className="text-sm text-slate-500">Average score</span>
              <strong>{stats.averageScore}%</strong>
            </div>
          </section>

          <section className="panel max-w-3xl space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Daily goal</h2>
                <p className="text-slate-600">
                  Studied {stats.studiedToday} / {stats.dailyGoal} cards today
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-500">Streak</p>
                <p className="text-3xl font-black">{stats.streak}</p>
              </div>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${goalPercent}%` }} />
            </div>
          </section>
        </>
      )}
    </main>
  );
}

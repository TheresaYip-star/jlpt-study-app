import { QuizEngine } from "@/app/quiz/QuizEngine";
import { getVocabulary } from "@/lib/study-data";

export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const words = await getVocabulary();

  return (
    <main className="page space-y-6">
      <div>
        <p className="font-semibold text-blue-700">10-question quiz</p>
        <h1 className="section-title">Pick the meaning.</h1>
      </div>
      <QuizEngine words={words} />
    </main>
  );
}

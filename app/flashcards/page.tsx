import { FlashcardEngine } from "@/app/flashcards/FlashcardEngine";
import { getVocabulary } from "@/lib/study-data";

export const dynamic = "force-dynamic";

export default async function FlashcardsPage() {
  const words = await getVocabulary();

  return (
    <main className="page space-y-6">
      <div>
        <p className="font-semibold text-blue-700">Core engine</p>
        <h1 className="section-title">Flashcards that save.</h1>
      </div>
      <FlashcardEngine words={words} />
    </main>
  );
}

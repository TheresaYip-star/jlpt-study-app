import { VocabularyBrowser } from "@/app/vocabulary/VocabularyBrowser";
import { getExampleSentences, getVocabulary } from "@/lib/study-data";

export const dynamic = "force-dynamic";

export default async function VocabularyPage() {
  const [words, examples] = await Promise.all([getVocabulary(), getExampleSentences()]);

  return (
    <main className="page space-y-6">
      <div>
        <p className="font-semibold text-blue-700">N5 vocabulary</p>
        <h1 className="section-title">Browse and manage words.</h1>
      </div>
      <VocabularyBrowser examples={examples} words={words} />
    </main>
  );
}

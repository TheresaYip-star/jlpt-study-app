import { createClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from "next/cache";
import type { ExampleSentence, ProgressStats, Vocabulary } from "@/lib/study-types";

const singaporeDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Singapore",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getSingaporeDateKey(value: string | Date) {
  const parts = singaporeDateFormatter.formatToParts(
    typeof value === "string" ? new Date(value) : value,
  );
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return year && month && day ? `${year}-${month}-${day}` : null;
}

function previousDateKey(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export async function getSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  return createClient();
}

export async function getVocabulary(): Promise<Vocabulary[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("vocabulary")
    .select("id, level_code, word, reading, romaji, meaning, part_of_speech, notes")
    .eq("level_code", "N5")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getExampleSentences(): Promise<ExampleSentence[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("example_sentences")
    .select("id, vocabulary_id, japanese, reading, translation")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProgressStats(): Promise<ProgressStats> {
  noStore();
  const supabase = await getSupabase();
  if (!supabase) {
    return {
      wordsStudied: 0,
      vocabularyCount: 0,
      completed: 0,
      quizzesTaken: 0,
      averageScore: 0,
      studiedToday: 0,
      dailyGoal: 20,
      streak: 0,
    };
  }

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);
  const [
    { data: sessions, error: sessionsError },
    { data: quizzes, error: quizzesError },
    { data: profiles },
    { data: n5Vocabulary, error: vocabularyError },
    { data: reviewHistory, error: reviewHistoryError },
  ] =
    await Promise.all([
      supabase
        .from("study_sessions")
        .select("cards_reviewed, cards_known, cards_unknown, completed_at")
        .eq("session_type", "flashcard"),
      supabase.from("quiz_results").select("score_percent"),
      supabase
        .from("user_profiles")
        .select("daily_goal_cards")
        .order("created_at", { ascending: true })
        .limit(1),
      supabase
        .from("vocabulary")
        .select("id")
        .eq("level_code", "N5"),
      supabase
        .from("review_history")
        .select("vocabulary_id, created_at"),
    ]);

  if (sessionsError) throw new Error(sessionsError.message);
  if (quizzesError) throw new Error(quizzesError.message);
  if (vocabularyError) {
    console.error("Could not load N5 vocabulary for progress:", vocabularyError.message);
  }
  if (reviewHistoryError) {
    console.error("Could not load vocabulary review history for progress:", reviewHistoryError.message);
  }

  const sessionRows = sessions ?? [];
  const quizRows = quizzes ?? [];
  const wordsStudied = sessionRows.reduce((sum, session) => sum + (session.cards_reviewed ?? 0), 0);
  const n5VocabularyIds = new Set((vocabularyError ? [] : (n5Vocabulary ?? [])).map((word) => word.id));
  const reviews = reviewHistoryError ? [] : (reviewHistory ?? []);
  const reviewedN5Ids = new Set(
    reviews.flatMap((review) =>
      review.vocabulary_id && n5VocabularyIds.has(review.vocabulary_id) ? [review.vocabulary_id] : [],
    ),
  );
  const studiedToday = new Set(
    reviews.flatMap((review) =>
      review.vocabulary_id &&
      n5VocabularyIds.has(review.vocabulary_id) &&
      review.created_at >= todayStart.toISOString() &&
      review.created_at < tomorrowStart.toISOString()
        ? [review.vocabulary_id]
        : [],
    ),
  ).size;
  const dailyGoal = profiles?.[0]?.daily_goal_cards ?? 20;
  const vocabularyBySingaporeDay = new Map<string, Set<string>>();
  for (const review of reviews) {
    if (!review.vocabulary_id || !n5VocabularyIds.has(review.vocabulary_id)) continue;
    const dateKey = getSingaporeDateKey(review.created_at);
    if (!dateKey) continue;
    const vocabularyIds = vocabularyBySingaporeDay.get(dateKey) ?? new Set<string>();
    vocabularyIds.add(review.vocabulary_id);
    vocabularyBySingaporeDay.set(dateKey, vocabularyIds);
  }

  let streak = 0;
  if (dailyGoal > 0) {
    const todayKey = getSingaporeDateKey(new Date());
    if (todayKey) {
      let dateKey =
        (vocabularyBySingaporeDay.get(todayKey)?.size ?? 0) >= dailyGoal
          ? todayKey
          : previousDateKey(todayKey);
      while ((vocabularyBySingaporeDay.get(dateKey)?.size ?? 0) >= dailyGoal) {
        streak += 1;
        dateKey = previousDateKey(dateKey);
      }
    }
  }
  const averageScore =
    quizRows.length === 0
      ? 0
      : Math.round(
          quizRows.reduce((sum, quiz) => sum + Number(quiz.score_percent ?? 0), 0) / quizRows.length,
        );

  return {
    wordsStudied,
    vocabularyCount: n5VocabularyIds.size,
    completed: Math.min(reviewedN5Ids.size, n5VocabularyIds.size),
    quizzesTaken: quizRows.length,
    averageScore,
    studiedToday,
    dailyGoal,
    streak,
  };
}

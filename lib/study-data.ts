import { createClient } from "@/lib/supabase/server";
import type { ExampleSentence, ProgressStats, Vocabulary } from "@/lib/study-types";

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
    .select("id, level_code, word, reading, meaning, part_of_speech, notes")
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
  const supabase = await getSupabase();
  if (!supabase) {
    return {
      wordsStudied: 0,
      cardsKnown: 0,
      cardsUnknown: 0,
      quizzesTaken: 0,
      averageScore: 0,
      studiedToday: 0,
      dailyGoal: 20,
      streak: 0,
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  const [{ data: sessions, error: sessionsError }, { data: quizzes, error: quizzesError }, { data: profiles }] =
    await Promise.all([
      supabase
        .from("study_sessions")
        .select("cards_reviewed, cards_known, cards_unknown, completed_at")
        .eq("session_type", "flashcard"),
      supabase.from("quiz_results").select("score_percent"),
      supabase
        .from("user_profiles")
        .select("daily_goal_cards, current_streak_days")
        .order("created_at", { ascending: true })
        .limit(1),
    ]);

  if (sessionsError) throw new Error(sessionsError.message);
  if (quizzesError) throw new Error(quizzesError.message);

  const sessionRows = sessions ?? [];
  const quizRows = quizzes ?? [];
  const wordsStudied = sessionRows.reduce((sum, session) => sum + (session.cards_reviewed ?? 0), 0);
  const cardsKnown = sessionRows.reduce((sum, session) => sum + (session.cards_known ?? 0), 0);
  const cardsUnknown = sessionRows.reduce((sum, session) => sum + (session.cards_unknown ?? 0), 0);
  const studiedToday = sessionRows
    .filter((session) => session.completed_at?.slice(0, 10) === today)
    .reduce((sum, session) => sum + (session.cards_reviewed ?? 0), 0);
  const averageScore =
    quizRows.length === 0
      ? 0
      : Math.round(
          quizRows.reduce((sum, quiz) => sum + Number(quiz.score_percent ?? 0), 0) / quizRows.length,
        );

  return {
    wordsStudied,
    cardsKnown,
    cardsUnknown,
    quizzesTaken: quizRows.length,
    averageScore,
    studiedToday,
    dailyGoal: profiles?.[0]?.daily_goal_cards ?? 20,
    streak: profiles?.[0]?.current_streak_days ?? 0,
  };
}

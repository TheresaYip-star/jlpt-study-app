"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/study-data";

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function writeAudit(action: string, targetTable: string, targetId: string | null, payload: object) {
  const supabase = await getSupabase();
  if (!supabase) return;

  await supabase.from("audit_logs").insert({
    action,
    target_table: targetTable,
    target_id: targetId,
    payload,
  });
}

export async function saveVocabulary(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await getSupabase();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const id = String(formData.get("id") ?? "");
  const payload = {
    level_code: "N5",
    word: String(formData.get("word") ?? "").trim(),
    reading: String(formData.get("reading") ?? "").trim(),
    meaning: String(formData.get("meaning") ?? "").trim(),
    part_of_speech: String(formData.get("part_of_speech") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  };

  if (!payload.word || !payload.reading || !payload.meaning) {
    return { ok: false, error: "Word, reading, and meaning are required." };
  }

  const query = id
    ? supabase.from("vocabulary").update(payload).eq("id", id).select("id").single()
    : supabase.from("vocabulary").insert(payload).select("id").single();
  const { data, error } = await query;
  if (error) return { ok: false, error: error.message };

  await writeAudit(id ? "update_vocabulary" : "create_vocabulary", "vocabulary", data.id, payload);
  revalidatePath("/vocabulary");
  revalidatePath("/");
  return { ok: true, data: { id: data.id } };
}

export async function deleteVocabulary(id: string): Promise<ActionResult<{ id: string }>> {
  const supabase = await getSupabase();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  await supabase.from("example_sentences").delete().eq("vocabulary_id", id);
  const { error } = await supabase.from("vocabulary").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit("delete_vocabulary", "vocabulary", id, { id });
  revalidatePath("/vocabulary");
  revalidatePath("/");
  return { ok: true, data: { id } };
}

export async function startFlashcardSession(): Promise<ActionResult<{ sessionId: string }>> {
  const supabase = await getSupabase();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const { data, error } = await supabase
    .from("study_sessions")
    .insert({
      level_code: "N5",
      session_type: "flashcard",
      cards_reviewed: 0,
      cards_known: 0,
      cards_unknown: 0,
      duration_seconds: 0,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  await writeAudit("start_flashcard_session", "study_sessions", data.id, { level_code: "N5" });
  return { ok: true, data: { sessionId: data.id } };
}

export async function recordFlashcardReview(input: {
  sessionId: string;
  vocabularyId: string;
  result: "known" | "unknown";
  durationSeconds: number;
}): Promise<ActionResult<{ reviewed: number; known: number; unknown: number }>> {
  const supabase = await getSupabase();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const { data: previous } = await supabase
    .from("review_history")
    .select("interval_days, ease_factor, repetition_count")
    .eq("vocabulary_id", input.vocabularyId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const previousEase = Number(previous?.ease_factor ?? 2.5);
  const ease = input.result === "known" ? previousEase : Math.max(1.3, previousEase - 0.2);
  const interval =
    input.result === "known"
      ? Math.min(180, Math.max(1, Math.round(Number(previous?.interval_days ?? 1) * ease)))
      : 1;
  const nextReview = new Date(Date.now() + interval * 24 * 60 * 60 * 1000).toISOString();
  const repetitionCount = input.result === "known" ? Number(previous?.repetition_count ?? 0) + 1 : 0;

  const { error: reviewError } = await supabase.from("review_history").insert({
    session_id: input.sessionId,
    vocabulary_id: input.vocabularyId,
    result: input.result,
    interval_days: interval,
    ease_factor: ease,
    next_review_at: nextReview,
    repetition_count: repetitionCount,
  });
  if (reviewError) return { ok: false, error: reviewError.message };

  const { data: session, error: sessionError } = await supabase
    .from("study_sessions")
    .select("cards_reviewed, cards_known, cards_unknown")
    .eq("id", input.sessionId)
    .single();
  if (sessionError) return { ok: false, error: sessionError.message };

  const nextCounts = {
    cards_reviewed: Number(session.cards_reviewed ?? 0) + 1,
    cards_known: Number(session.cards_known ?? 0) + (input.result === "known" ? 1 : 0),
    cards_unknown: Number(session.cards_unknown ?? 0) + (input.result === "unknown" ? 1 : 0),
    duration_seconds: input.durationSeconds,
    completed_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabase
    .from("study_sessions")
    .update(nextCounts)
    .eq("id", input.sessionId);
  if (updateError) return { ok: false, error: updateError.message };

  await writeAudit("record_review", "review_history", input.vocabularyId, {
    result: input.result,
    session_id: input.sessionId,
    interval_days: interval,
    next_review_at: nextReview,
  });
  revalidatePath("/progress");
  revalidatePath("/");
  return {
    ok: true,
    data: {
      reviewed: nextCounts.cards_reviewed,
      known: nextCounts.cards_known,
      unknown: nextCounts.cards_unknown,
    },
  };
}

export async function saveQuizResult(input: {
  totalQuestions: number;
  correctAnswers: number;
  durationSeconds: number;
  answers: unknown[];
}): Promise<ActionResult<{ scorePercent: number }>> {
  const supabase = await getSupabase();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const scorePercent = Math.round((input.correctAnswers / input.totalQuestions) * 100);
  const { data, error } = await supabase
    .from("quiz_results")
    .insert({
      level_code: "N5",
      quiz_type: "vocabulary_meaning",
      total_questions: input.totalQuestions,
      correct_answers: input.correctAnswers,
      score_percent: scorePercent,
      duration_seconds: input.durationSeconds,
      answers_json: input.answers,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  await supabase.from("study_sessions").insert({
    level_code: "N5",
    session_type: "quiz",
    cards_reviewed: input.totalQuestions,
    cards_known: input.correctAnswers,
    cards_unknown: input.totalQuestions - input.correctAnswers,
    duration_seconds: input.durationSeconds,
    completed_at: new Date().toISOString(),
  });
  await writeAudit("save_quiz_result", "quiz_results", data.id, {
    score_percent: scorePercent,
    total_questions: input.totalQuestions,
  });
  revalidatePath("/progress");
  revalidatePath("/");
  return { ok: true, data: { scorePercent } };
}

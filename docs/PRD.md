# Product Requirements — JLPT Study App

## Problem
JLPT learners lack a single, focused tool that combines structured N5 content, spaced-repetition flashcards, quizzes, and cross-device progress sync in one clean interface.

## Target Users
Self-study learners, university students, and working adults preparing for JLPT N5 (expandable to N4–N1 later).

## Core Objects
| Object | Purpose |
|---|---|
| `vocabulary` | N5 words with reading, meaning, part of speech |
| `kanji` | N5 characters with on/kun readings and meaning |
| `grammar_points` | N5 patterns with usage notes |
| `example_sentences` | Sentences linked to vocab/kanji/grammar |
| `study_sessions` | One record per flashcard or study sitting |
| `review_history` | Per-card SRS record (result, interval, next review date) |
| `quiz_results` | Score, answers, duration per quiz attempt |
| `bookmarks` | User-saved vocab/kanji/grammar items |
| `user_profiles` | Level, daily goal, streak |
| `user_settings` | UI prefs, quiz size, SRS toggle |

## MVP Checklist (v1)
- [ ] N5 vocabulary browser with live search
- [ ] Vocabulary detail view with example sentences
- [ ] Flashcard study mode — flip, Know / Don't Know, writes to DB
- [ ] Multiple-choice quiz (10 questions from N5 pool)
- [ ] Quiz results saved to `quiz_results`
- [ ] Progress dashboard (words studied, quiz scores, streak)
- [ ] Works for anonymous visitor (demo-first); no login wall on core screens

## Non-Goals (v1)
Listening exercises · AI tutor · handwriting recognition · offline mode · community/leaderboards · N4–N1 content · premium billing · teacher dashboard · SRS scheduling (Sprint 7)

## Definition of Done
A visitor opens the app, browses N5 vocabulary, studies 10 flashcards (Know/Don't Know writes to DB), completes a 10-question quiz, and sees their score on the results screen — all without creating an account. Every interaction persists to Supabase and survives a page refresh.

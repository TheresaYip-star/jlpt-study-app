# Tasks — JLPT Study App

## Gantt Overview
```
Sprint 1  |████| DB & seed data
Sprint 2  |████| Vocabulary browser (demo-first)
Sprint 3  |████| Flashcard engine  ← CORE ENGINE
Sprint 4  |████| Quiz engine
Sprint 5  |████| Progress dashboard  ← v1 FUNCTIONAL ✅
Sprint 6  |████| Lock it down (auth + RLS)
Sprint 7  |████| Bookmarks, SRS scheduling, daily goals
```

---

## Sprint 1 — Database & N5 Content Foundation
**Goal:** All tables exist in Supabase; seed data is queryable without auth.
- [ ] Apply migration SQL to Supabase project
- [ ] Confirm all 10 tables created with correct columns
- [ ] Confirm 50 vocabulary, 20 kanji, 10 grammar rows seeded
- [ ] Run `select * from vocabulary limit 5` via Supabase client — returns data
- [ ] RLS v1 open policies active on all tables

**Definition of Done:** `select count(*) from vocabulary` returns ≥ 10 without any auth token.

---

## Sprint 2 — Vocabulary Browser (No login required)
**Goal:** `/vocabulary` page is live and searchable by anonymous visitors.
- [ ] `/vocabulary` route: card grid, loading skeleton, empty state, error boundary
- [ ] Vocabulary detail drawer: word, reading, meaning, part of speech
- [ ] Live search (client-side filter on loaded N5 set)
- [ ] Level filter chip (N5 active; N4–N1 disabled with "Coming soon" tooltip)
- [ ] Furigana display toggle (reads from default `user_settings`)

**Definition of Done:** Anonymous user visits `/vocabulary`, types "食" in search, and sees 食べる card within 300 ms — no login prompt.

---

## Sprint 3 — Flashcard Engine ← Core Engine
**Goal:** Flashcard flip + Know/Don't Know writes to DB end-to-end.
- [ ] `/flashcards` route: deck selector (N5 vocabulary)
- [ ] Flip-card animation (front: word + kanji, back: reading + meaning)
- [ ] Know / Don't Know buttons — each click inserts `review_history` row and updates `study_sessions`
- [ ] Session summary screen: total reviewed, known count, unknown count
- [ ] All five states: loading, empty deck, mid-session, error toast, session-complete
- [ ] Verify DB: after 5 cards, `review_history` has 5 rows

**Definition of Done:** User studies 5 cards, clicks Know/Don't Know on each, session summary appears, and `select count(*) from review_history` returns 5 new rows.

---

## Sprint 4 — Quiz Engine
**Goal:** 10-question multiple-choice quiz saves results to DB.
- [ ] `/quiz` route: start screen, question view, results screen
- [ ] Draw 10 random N5 vocabulary questions; generate 3 distractors per question
- [ ] Submit writes `quiz_results` row with score, answers_json, duration
- [ ] Results screen: score %, correct/incorrect per question, retry button
- [ ] Error state if fewer than 4 vocabulary items exist

**Definition of Done:** Complete a 10-question quiz; `select score_percent from quiz_results order by created_at desc limit 1` returns the correct score.

---

## Sprint 5 — Progress Dashboard ← v1 Functional ✅
**Goal:** Dashboard shows real aggregated data from DB; survives refresh.
- [ ] `/progress` route: total words studied, quizzes taken, avg score, streak
- [ ] Stats are SQL aggregates from `study_sessions` and `quiz_results` (not hardcoded)
- [ ] Daily goal widget: studied X / 20 cards today
- [ ] Empty state with CTA to start studying
- [ ] Streak logic runs server-side; confirmed identical on two different browsers

**Definition of Done:** After completing Sprint 3 + 4 flows, `/progress` shows non-zero real stats. Hard-refresh does not reset counts.

---

## Sprint 6 — Lock It Down (Auth + Per-user RLS)
**Goal:** Users can register/login; their data is isolated from other users.
- [ ] Enable Supabase Auth (email/password)
- [ ] Sign-up page: email, password, display name, JLPT level selector
- [ ] Login page with error states (wrong password, unconfirmed email)
- [ ] On sign-up: create `user_profiles` and `user_settings` rows with `user_id = auth.uid()`
- [ ] Replace open RLS policies with `auth.uid() = user_id` on all user-data tables
- [ ] Content tables (`vocabulary`, `kanji`, etc.) set to anon SELECT only
- [ ] Verify: User A cannot read User B's `review_history`

**Definition of Done:** Two test accounts created; each sees only their own quiz_results and review_history. Unauthenticated user can still browse `/vocabulary` but gets redirect to `/login` when attempting to start a flashcard session.

---

## Sprint 7 — Bookmarks, SRS Scheduling & Daily Goals
**Goal:** Bookmarks save correctly; SRS next-review dates update; daily goal drives streak.
- [ ] Bookmark toggle on vocabulary cards → inserts/deletes `bookmarks` row
- [ ] `/bookmarks` page with remove action
- [ ] SRS: after each Know/Don't Know, compute new `interval_days` and `next_review_at` (SM-2 formula)
- [ ] "Due today" flashcard deck filter: `next_review_at <= now()`
- [ ] Daily goal settings page (update `user_profiles.daily_goal_cards`)
- [ ] Streak increments when `cards_reviewed >= daily_goal_cards` for the day

**Definition of Done:** Study 20 cards, confirm `current_streak_days` increments in `user_profiles`. Review a "known" card twice; confirm `next_review_at` is further in the future after second review.

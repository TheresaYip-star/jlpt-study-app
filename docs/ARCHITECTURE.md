# Architecture — JLPT Study App

## Stack
| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend / DB | Supabase (Postgres + Auth + RLS) |
| Hosting | Vercel |
| State | React Server Components + `@supabase/ssr` client |

## What's Built Now vs Later
**Now (v1):** vocabulary browser, flashcard engine, quiz engine, progress dashboard, open RLS (no login required).
**Next:** user auth, per-user RLS, bookmarks, daily goals, SRS scheduling.
**Later:** N4–N1 content, listening exercises, offline mode, premium features.

## Key User Action — End-to-End Flow
1. **Capture:** User clicks "Know" on a flashcard.
2. **Write:** Client calls Supabase → inserts row in `review_history` (result, vocabulary_id, session_id).
3. **Update:** `study_sessions` row increments `cards_known`.
4. **Read:** Progress dashboard re-fetches session aggregates from DB.
5. **Display:** Cards studied count and streak update on screen — server-derived, not from localStorage.

## Layer Plan
1. **Data first** — all tables, constraints, and seed data live in Supabase before any UI.
2. **App logic** — Next.js server actions handle reads/writes; business rules (streak calc, SRS intervals) run server-side.
3. **Smart features** — SRS scheduling and difficulty scoring added once core CRUD is proven.

## Why the Core Runs Without AI
All content (vocabulary, kanji, grammar) is static seed data. SRS intervals use a deterministic formula (SM-2). No AI dependency in the critical study path.

# Test Plan — JLPT Study App

## v1 Success Scenario (manual walkthrough)

### Setup
- App deployed to Vercel (or running locally on `localhost:3000`)
- Migration SQL applied; seed data present

### Steps
1. Open `/vocabulary` in a private/incognito window (no account).
   - **Pass:** N5 vocabulary cards render. No login redirect.
2. Type `水` in the search bar.
   - **Pass:** Card for 水 (water) appears within 1 second.
3. Click the 水 card.
   - **Pass:** Detail drawer opens showing reading (みず), meaning (water), part of speech (noun).
4. Navigate to `/flashcards`, select N5 Vocabulary deck, click Start.
   - **Pass:** First card appears (word on front). Loading skeleton shown briefly.
5. Click the card to flip it.
   - **Pass:** Reading and meaning revealed on back.
6. Click **Know**.
   - **Pass:** Next card appears. DB check: `select count(*) from review_history` = 1.
7. Repeat for 4 more cards (mix of Know and Don't Know).
   - **Pass:** Session summary shows 5 cards reviewed with correct known/unknown split.
8. Navigate to `/quiz`, click Start Quiz.
   - **Pass:** 10 multiple-choice questions appear, one at a time.
9. Answer all 10 questions and submit.
   - **Pass:** Results screen shows score %. DB check: `select score_percent from quiz_results order by created_at desc limit 1` matches displayed score.
10. Navigate to `/progress`.
    - **Pass:** Dashboard shows 5 cards studied (from step 7) and 1 quiz taken with the correct average score. Hard-refresh — numbers remain the same.

## Empty State Tests
- Visit `/flashcards` with a deck that has zero due cards → "No cards due today. Come back tomorrow!" message shown.
- Visit `/progress` with no sessions → "Start studying to see your progress here" CTA shown.

## Error State Tests
- Simulate DB unavailable (disable Supabase project) → `/vocabulary` shows error banner "Could not load content. Please try again." — no blank white screen.
- Submit quiz with network interrupted mid-submit → error toast "Quiz could not be saved. Check your connection." Quiz answers not lost (held in component state).

## Post Lock-down Tests (Sprint 6)
- Log in as User A, complete a quiz. Log out. Log in as User B.
  - **Pass:** User B sees 0 quiz results, not User A's results.
- Access `/progress` while logged out.
  - **Pass:** Redirected to `/login` with a "Sign in to track your progress" message.

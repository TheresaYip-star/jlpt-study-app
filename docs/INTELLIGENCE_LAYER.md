# Intelligence Layer — JLPT Study App

## What Gets Structured Automatically

### SRS Scheduling (rule-based, no AI)
After each flashcard response the system updates `review_history`:
```json
{
  "vocabulary_id": "uuid",
  "result": "known",
  "previous_interval_days": 1,
  "ease_factor": 2.5,
  "new_interval_days": 3,
  "next_review_at": "2024-06-05T09:00:00Z",
  "repetition_count": 2
}
```
**Rule (SM-2 simplified):**
- `known`: `new_interval = prev_interval × ease_factor` (min 1 day, max 180 days)
- `unknown`: reset `interval = 1`, decrement `ease_factor` by 0.2 (min 1.3)

## Events Tracked
| Event | Table | Use |
|---|---|---|
| Flashcard flipped | `study_sessions` | Engagement signal |
| Know / Don't Know | `review_history` | SRS input |
| Quiz submitted | `quiz_results` | Score trend |
| Daily goal reached | `user_profiles` | Streak increment |

## Scoring Rules (v1 — deterministic)
- **Retention score** per word: `known / (known + unknown)` over last 10 reviews.
- **Quiz trend**: 7-day rolling average `score_percent` from `quiz_results`.
- **Streak**: consecutive days with `cards_reviewed >= daily_goal_cards`.

## v1 vs Later
**v1:** All scoring is deterministic SQL aggregates. No external AI calls.
**Later:** AI-generated mnemonic hints (stored as `hint_text`, `hint_source`, `hint_confidence`, `hint_review_status`); difficulty tagging per vocabulary item (`difficulty_score numeric`, `difficulty_source text`, `difficulty_confidence numeric`, `difficulty_review_status text default 'unreviewed'`).

# Agentic Layer — JLPT Study App

## Risk Classification

### Low Risk — Auto-execute (no approval needed)
| Action | Trigger | Tool |
|---|---|---|
| Insert `review_history` row | Know/Don't Know click | `upsert_review_history` |
| Update `study_sessions` counts | Card reviewed | `update_study_session` |
| Insert `quiz_results` row | Quiz submitted | `save_quiz_result` |
| Increment streak in `user_profiles` | Daily goal reached | `update_streak` |
| Insert `bookmarks` row | Bookmark clicked | `add_bookmark` |

### Medium Risk — Log and surface to user
| Action | Trigger | Tool |
|---|---|---|
| Reset SRS progress for a word | User requests reset | `reset_srs_card` — logs to `audit_logs` |
| Update daily goal | Settings form saved | `update_daily_goal` — logs change |

### High Risk — Require explicit confirmation
| Action | Tool |
|---|---|
| Delete all study history | `delete_study_history` — confirmation modal + audit log |

### Critical — Human only (no agent)
- Account deletion
- Bulk content edits to shared vocabulary/kanji tables

## Audit Log Fields
Every meaningful action writes to `audit_logs`: `action`, `target_table`, `target_id`, `payload` (before/after), `user_id`, `ip_address`, `created_at`.

## v1 vs Later
**v1:** Only low-risk auto-actions implemented (review_history, quiz_results, study_sessions, bookmarks).
**Later:** Agent suggests daily study plan based on due SRS cards and weak quiz areas; draft sent to user for approval before scheduling.

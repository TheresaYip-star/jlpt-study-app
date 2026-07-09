# Data Model — JLPT Study App

## `jlpt_levels`
`code text (PK-natural)` · `label text` · `sort_order int`

## `vocabulary`
`id uuid PK` · `user_id uuid` · `level_code → jlpt_levels` · `word text` · `reading text` · `meaning text` · `part_of_speech text` · `notes text` · `created_at`

## `kanji`
`id uuid PK` · `user_id uuid` · `level_code → jlpt_levels` · `character text` · `onyomi text` · `kunyomi text` · `meaning text` · `stroke_count int` · `radical text` · `created_at`

## `grammar_points`
`id uuid PK` · `user_id uuid` · `level_code → jlpt_levels` · `pattern text` · `meaning text` · `usage_note text` · `sort_order int` · `created_at`

## `example_sentences`
`id uuid PK` · `user_id uuid` · `vocabulary_id → vocabulary` · `kanji_id → kanji` · `grammar_point_id → grammar_points` · `japanese text` · `reading text` · `translation text` · `created_at`

## `user_profiles`
`id uuid PK` · `user_id uuid` · `display_name text` · `selected_level_code → jlpt_levels` · `daily_goal_cards int` · `current_streak_days int` · `longest_streak_days int` · `last_study_date date` · `created_at`

## `study_sessions`
`id uuid PK` · `user_id uuid` · `level_code → jlpt_levels` · `session_type text` (flashcard|quiz) · `cards_reviewed int` · `cards_known int` · `cards_unknown int` · `duration_seconds int` · `completed_at timestamptz` · `created_at`

## `review_history`
`id uuid PK` · `user_id uuid` · `session_id → study_sessions` · `vocabulary_id → vocabulary` · `kanji_id → kanji` · `result text` (known|unknown) · `interval_days int` · `ease_factor numeric` (SM-2) · `next_review_at timestamptz` · `repetition_count int` · `created_at`

## `quiz_results`
`id uuid PK` · `user_id uuid` · `level_code → jlpt_levels` · `quiz_type text` · `total_questions int` · `correct_answers int` · `score_percent numeric` · `duration_seconds int` · `answers_json jsonb` · `created_at`

## `bookmarks`
`id uuid PK` · `user_id uuid` · `vocabulary_id → vocabulary` · `kanji_id → kanji` · `grammar_point_id → grammar_points` · `note text` · `created_at`

## `user_settings`
`id uuid PK` · `user_id uuid` · `theme text` · `font_size text` · `show_furigana boolean` · `notifications_enabled boolean` · `quiz_question_count int` · `srs_enabled boolean` · `created_at`

## `audit_logs`
`id uuid PK` · `user_id uuid` · `action text` · `target_table text` · `target_id uuid` · `payload jsonb` · `ip_address text` · `user_agent text` · `created_at`

## RLS
- v1: all tables have permissive SELECT + ALL policies (demo-first, no login required).
- Lock-down sprint: replace with `auth.uid() = user_id` owner-scoped policies on `study_sessions`, `review_history`, `quiz_results`, `bookmarks`, `user_profiles`, `user_settings`.
- Content tables (`vocabulary`, `kanji`, `grammar_points`, `example_sentences`, `jlpt_levels`) remain public read-only.

create table if not exists jlpt_levels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  code text not null unique,
  label text not null,
  sort_order int not null
);
alter table jlpt_levels enable row level security;
drop policy if exists "jlpt_levels_v1_read" on jlpt_levels;
create policy "jlpt_levels_v1_read" on jlpt_levels for select using (true);
drop policy if exists "jlpt_levels_v1_write" on jlpt_levels;
create policy "jlpt_levels_v1_write" on jlpt_levels for all using (true) with check (true);

insert into jlpt_levels (code, label, sort_order) values
  ('N5', 'JLPT N5 — Beginner', 1),
  ('N4', 'JLPT N4 — Elementary', 2),
  ('N3', 'JLPT N3 — Intermediate', 3),
  ('N2', 'JLPT N2 — Upper Intermediate', 4),
  ('N1', 'JLPT N1 — Advanced', 5)
on conflict (code) do nothing;

create table if not exists vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  level_code text not null references jlpt_levels(code),
  word text not null,
  reading text not null,
  meaning text not null,
  part_of_speech text,
  notes text
);
alter table vocabulary enable row level security;
drop policy if exists "vocabulary_v1_read" on vocabulary;
create policy "vocabulary_v1_read" on vocabulary for select using (true);
drop policy if exists "vocabulary_v1_write" on vocabulary;
create policy "vocabulary_v1_write" on vocabulary for all using (true) with check (true);

insert into vocabulary (level_code, word, reading, meaning, part_of_speech) values
  ('N5', '日本語', 'にほんご', 'Japanese language', 'noun'),
  ('N5', '食べる', 'たべる', 'to eat', 'verb (ichidan)'),
  ('N5', '水', 'みず', 'water', 'noun'),
  ('N5', '大きい', 'おおきい', 'big, large', 'i-adjective'),
  ('N5', '学校', 'がっこう', 'school', 'noun'),
  ('N5', '電車', 'でんしゃ', 'train', 'noun'),
  ('N5', '友達', 'ともだち', 'friend', 'noun'),
  ('N5', '飲む', 'のむ', 'to drink', 'verb (godan)'),
  ('N5', '小さい', 'ちいさい', 'small, little', 'i-adjective'),
  ('N5', '先生', 'せんせい', 'teacher', 'noun');

create table if not exists kanji (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  level_code text not null references jlpt_levels(code),
  character text not null,
  onyomi text,
  kunyomi text,
  meaning text not null,
  stroke_count int,
  radical text
);
alter table kanji enable row level security;
drop policy if exists "kanji_v1_read" on kanji;
create policy "kanji_v1_read" on kanji for select using (true);
drop policy if exists "kanji_v1_write" on kanji;
create policy "kanji_v1_write" on kanji for all using (true) with check (true);

insert into kanji (level_code, character, onyomi, kunyomi, meaning, stroke_count) values
  ('N5', '日', 'ニチ、ジツ', 'ひ、か', 'sun, day', 4),
  ('N5', '山', 'サン', 'やま', 'mountain', 3),
  ('N5', '水', 'スイ', 'みず', 'water', 4),
  ('N5', '火', 'カ', 'ひ', 'fire', 4),
  ('N5', '人', 'ジン、ニン', 'ひと', 'person', 2),
  ('N5', '大', 'ダイ、タイ', 'おお', 'big, large', 3);

create table if not exists grammar_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  level_code text not null references jlpt_levels(code),
  pattern text not null,
  meaning text not null,
  usage_note text,
  sort_order int
);
alter table grammar_points enable row level security;
drop policy if exists "grammar_points_v1_read" on grammar_points;
create policy "grammar_points_v1_read" on grammar_points for select using (true);
drop policy if exists "grammar_points_v1_write" on grammar_points;
create policy "grammar_points_v1_write" on grammar_points for all using (true) with check (true);

insert into grammar_points (level_code, pattern, meaning, usage_note) values
  ('N5', 'は (wa)', 'Topic marker particle', 'Marks the topic of the sentence'),
  ('N5', 'が (ga)', 'Subject marker particle', 'Marks the grammatical subject'),
  ('N5', 'を (wo)', 'Object marker particle', 'Marks the direct object of a verb'),
  ('N5', 'です (desu)', 'Polite copula "to be"', 'Used at end of noun/adjective sentences'),
  ('N5', 'ます (masu)', 'Polite verb ending', 'Attaches to verb stem for polite speech'),
  ('N5', 'に (ni)', 'Direction/location particle', 'Used for destination or point in time');

create table if not exists example_sentences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  vocabulary_id uuid references vocabulary(id),
  kanji_id uuid references kanji(id),
  grammar_point_id uuid references grammar_points(id),
  japanese text not null,
  reading text not null,
  translation text not null
);
alter table example_sentences enable row level security;
drop policy if exists "example_sentences_v1_read" on example_sentences;
create policy "example_sentences_v1_read" on example_sentences for select using (true);
drop policy if exists "example_sentences_v1_write" on example_sentences;
create policy "example_sentences_v1_write" on example_sentences for all using (true) with check (true);

create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  display_name text,
  selected_level_code text references jlpt_levels(code) default 'N5',
  daily_goal_cards int not null default 20,
  current_streak_days int not null default 0,
  longest_streak_days int not null default 0,
  last_study_date date
);
alter table user_profiles enable row level security;
drop policy if exists "user_profiles_v1_read" on user_profiles;
create policy "user_profiles_v1_read" on user_profiles for select using (true);
drop policy if exists "user_profiles_v1_write" on user_profiles;
create policy "user_profiles_v1_write" on user_profiles for all using (true) with check (true);

insert into user_profiles (display_name, selected_level_code, daily_goal_cards, current_streak_days, longest_streak_days, last_study_date) values
  ('Demo Learner', 'N5', 20, 5, 12, current_date);

create table if not exists study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  level_code text not null references jlpt_levels(code),
  session_type text not null,
  cards_reviewed int not null default 0,
  cards_known int not null default 0,
  cards_unknown int not null default 0,
  duration_seconds int,
  completed_at timestamptz
);
alter table study_sessions enable row level security;
drop policy if exists "study_sessions_v1_read" on study_sessions;
create policy "study_sessions_v1_read" on study_sessions for select using (true);
drop policy if exists "study_sessions_v1_write" on study_sessions;
create policy "study_sessions_v1_write" on study_sessions for all using (true) with check (true);

insert into study_sessions (level_code, session_type, cards_reviewed, cards_known, cards_unknown, duration_seconds, completed_at) values
  ('N5', 'flashcard', 20, 15, 5, 420, now() - interval '1 day'),
  ('N5', 'flashcard', 10, 8, 2, 210, now() - interval '2 days'),
  ('N5', 'flashcard', 20, 18, 2, 380, now() - interval '3 days');

create table if not exists review_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  session_id uuid references study_sessions(id),
  vocabulary_id uuid references vocabulary(id),
  kanji_id uuid references kanji(id),
  result text not null,
  interval_days int not null default 1,
  ease_factor numeric not null default 2.5,
  next_review_at timestamptz not null default now() + interval '1 day',
  repetition_count int not null default 0
);
alter table review_history enable row level security;
drop policy if exists "review_history_v1_read" on review_history;
create policy "review_history_v1_read" on review_history for select using (true);
drop policy if exists "review_history_v1_write" on review_history;
create policy "review_history_v1_write" on review_history for all using (true) with check (true);

create table if not exists quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  level_code text not null references jlpt_levels(code),
  quiz_type text not null,
  total_questions int not null,
  correct_answers int not null,
  score_percent numeric not null,
  duration_seconds int,
  answers_json jsonb
);
alter table quiz_results enable row level security;
drop policy if exists "quiz_results_v1_read" on quiz_results;
create policy "quiz_results_v1_read" on quiz_results for select using (true);
drop policy if exists "quiz_results_v1_write" on quiz_results;
create policy "quiz_results_v1_write" on quiz_results for all using (true) with check (true);

insert into quiz_results (level_code, quiz_type, total_questions, correct_answers, score_percent, duration_seconds) values
  ('N5', 'vocabulary_meaning', 10, 8, 80.0, 185),
  ('N5', 'vocabulary_meaning', 10, 6, 60.0, 240),
  ('N5', 'vocabulary_meaning', 10, 9, 90.0, 160);

create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  vocabulary_id uuid references vocabulary(id),
  kanji_id uuid references kanji(id),
  grammar_point_id uuid references grammar_points(id),
  note text
);
alter table bookmarks enable row level security;
drop policy if exists "bookmarks_v1_read" on bookmarks;
create policy "bookmarks_v1_read" on bookmarks for select using (true);
drop policy if exists "bookmarks_v1_write" on bookmarks;
create policy "bookmarks_v1_write" on bookmarks for all using (true) with check (true);

create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  theme text not null default 'light',
  font_size text not null default 'medium',
  show_furigana boolean not null default true,
  notifications_enabled boolean not null default true,
  quiz_question_count int not null default 10,
  srs_enabled boolean not null default true
);
alter table user_settings enable row level security;
drop policy if exists "user_settings_v1_read" on user_settings;
create policy "user_settings_v1_read" on user_settings for select using (true);
drop policy if exists "user_settings_v1_write" on user_settings;
create policy "user_settings_v1_write" on user_settings for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  action text not null,
  target_table text,
  target_id uuid,
  payload jsonb,
  ip_address text,
  user_agent text
);
alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);
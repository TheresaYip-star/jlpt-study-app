# Security — JLPT Study App

## Secret Handling
- `SUPABASE_SERVICE_ROLE_KEY` — server-only (Next.js server actions / API routes). Never imported in any client component.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — safe for client; anon key is restricted by RLS.
- No secrets in `.env.local` committed to version control; use Vercel environment variables for production.

## Permission Model
- **v1 (demo):** Open RLS policies on all tables — any read/write allowed. Acceptable for public seed data; no PII at this stage.
- **Lock-down sprint:** Replace open policies with `auth.uid() = user_id` on all user-data tables. Content tables (`vocabulary`, `kanji`, `grammar_points`, `example_sentences`, `jlpt_levels`) become SELECT-only for anon role.
- Agent actions run under the authenticated user's JWT — the agent cannot exceed the user's own permissions.

## Approved Tools Rule
Only named, scoped Supabase client calls are used (e.g., `upsert_review_history`, `save_quiz_result`). No raw `rpc('run_any_sql')` or dynamic query construction from user input.

## Audit Principle
Every state-changing action (review recorded, quiz saved, bookmark added, settings changed, history deleted) writes a row to `audit_logs` with `user_id`, `action`, `target_table`, `target_id`, `payload`, and `created_at`. Audit rows are append-only (no DELETE policy on `audit_logs` for non-service-role).

## Sensitive Operations
Account deletion and bulk content edits require a human operator using the Supabase dashboard directly — no in-app agent path.

# Database — enterprise-grade PostgreSQL on Supabase

**Status:** LIVE on both `summit-dev` and `summit-prod` (us-west-1, Postgres 17.11).
Supabase security advisor: CLEAN. Performance advisor: real warnings fixed; only "unused index" info remaining (false positive for an empty DB).

## Why Postgres on Supabase (vs the alternatives)

- **Postgres 17** — most capable SQL in production, mature ecosystem, zero vendor lock-in. Row-level security built in; JSONB, full-text search, partitioning, replication, logical decoding all native.
- **Supabase managed layer** — Postgres as the primary store, with a managed Auth service (Google + Apple + 12 other OAuth providers out of the box), a REST API generated from the schema (PostgREST), realtime subscriptions (logical replication), and connection pooling (Supavisor) all included.
- **No lock-in** — the schema is standard Postgres. If we ever outgrow Supabase, point `pg_dump` at the DB and move to AWS RDS / Google Cloud SQL / self-hosted. Zero rewrite.
- **Rejected:** Firebase (lock-in, NoSQL mismatch), PlanetScale (MySQL weaker RLS story, GA now owned by foundation), Neon alone (great Postgres but no built-in auth), DynamoDB (wrong model for relational product data).

## Live schema (both environments)

```
auth.users               — Supabase managed (do not touch directly)
public.profiles          — one per auth.user, auto-created by trigger
public.legal_texts       — immutable store, every ToS/Privacy revision
public.tos_acceptances   — audit of who accepted which legal_text when
public.contact_messages  — contact form (service_role writes only)
public.audit_log         — append-only sensitive-events log
public.stripe_customers  — Stripe mapping (one per auth.user)
public.subscriptions     — Stripe subscription state (lifecycle via webhooks)
public.payments          — Stripe PaymentIntent records
```

Every table has RLS enabled. Every policy is scoped to `auth.uid() = owner_id` with the `(select auth.uid())` pattern for query-plan optimization (per Supabase advisor). `anon` has zero write access anywhere. `authenticated` has scoped read on own rows + narrow write on `profiles` (own display_name/avatar). All sensitive writes (contact, audit, legal, payment) go through `service_role` via Cloudflare Workers.

### `auth.users` trigger — multi-provider ready

`handle_new_user()` fires after every row insert on `auth.users`. It extracts the display name + avatar from `raw_user_meta_data` (field names differ per OAuth provider: Google emits `full_name` + `avatar_url`; Apple emits `name` + nothing for avatar) and records the provider name in `profiles.oauth_providers`. One auth.users row = one profile row, deterministic. Enabling Apple sign-in = toggle in Supabase dashboard, zero schema change.

## Enterprise patterns in use NOW (MVP)

| Pattern                           | Where / how                                                                                                     |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Row-level security everywhere** | Every table, every operation. Default-deny; policies additive.                                                  |
| **Append-only audit tables**      | `audit_log` + `legal_texts`: UPDATE/DELETE triggers raise. Even service_role can't mutate.                      |
| **Immutable content storage**     | `legal_texts.text_hash` enforced by trigger — rewriting source + keeping version is impossible.                 |
| **Covering indexes on all FKs**   | advisor-driven; sub-100ms joins at any scale.                                                                   |
| **Query-plan-optimized RLS**      | `(select auth.uid())` pattern; evaluates once per query, not per row.                                           |
| **Function privilege lockdown**   | `SECURITY DEFINER` only where strictly needed; EXECUTE revoked from `anon` + `authenticated` by default.        |
| **Explicit column-level grants**  | `profiles` can be UPDATEd only on display_name/avatar/updated_at — users can't rewrite their own `id`.          |
| **Restrictive deny policies**     | `contact_messages_deny_anon_authenticated` closes the "RLS enabled no policy" gap even for service_role audits. |
| **Migration-managed schema**      | Every DDL change is a timestamped migration in `supabase/migrations/`. Reproducible on any fresh project.       |

## Enterprise patterns reserved for scale phase (NOT YET)

Deliberately deferred — adding complexity before it earns its keep is anti-pattern (see rule 50-scope-discipline). Promoted when a measured metric hits the trigger:

| Pattern                                          | Trigger to adopt                                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **Table partitioning** (`audit_log`, `payments`) | > 10M rows OR p95 insert > 50ms. Partition by month on `created_at`.                             |
| **Read replicas** via Supavisor read-only pool   | p95 read > 200ms on dashboard pages. Read-only Supabase project pointed at replica.              |
| **Logical decoding / CDC**                       | Realtime use case appears (feed, chat, live notifications).                                      |
| **Materialized views for reporting**             | Admin dashboard reports slow (> 2s). Refresh on cron or trigger.                                 |
| **Point-in-time recovery (PITR)**                | Supabase Pro plan upgrade — not needed on free tier until paid user data exists.                 |
| **Database branching**                           | Preview-per-PR DB isolation. Use `supabase branches create` once more than one engineer.         |
| **Row-level encryption** (sensitive fields)      | GDPR/HIPAA scope or payment data persisted beyond Stripe. Use `pgcrypto` + envelope key per row. |
| **Connection pooling tuning**                    | Supavisor hit on free tier (200 concurrent). Move to pro + dedicated pool.                       |

## Security posture — what blocks each attack class

| Attack                                     | What stops it                                                                                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **IDOR via anon key**                      | RLS on every table. `anon` role can SELECT `legal_texts` (public) only.                                                                  |
| **Privilege escalation via `/rpc/<fn>`**   | SECURITY DEFINER functions have EXECUTE revoked from public roles.                                                                       |
| **Mass data scrape from CDN cache**        | Any authenticated route returns `Cache-Control: private, no-store`.                                                                      |
| **SQL injection via API**                  | PostgREST parameterizes; our Workers use `@supabase/supabase-js` parameterization.                                                       |
| **Service-role key leak via Pages bundle** | CI redteam job greps `out/` for Supabase JWT prefix; `check-hardcoded-name.mjs` sibling script extended for secret shapes next commit.   |
| **Audit-trail tampering**                  | UPDATE/DELETE triggers on `audit_log` + `legal_texts` raise exceptions.                                                                  |
| **ToS downgrade attack**                   | `tos_acceptances` is service_role-write-only; RLS `has_accepted_current_legal()` reads immutable `is_current` from DB, not client input. |
| **Replay of expired JWTs**                 | Supabase Auth refresh flow + httpOnly cookie storage.                                                                                    |
| **DDoS on contact form**                   | Turnstile (client proof-of-work) + Worker-level per-IP rate limit.                                                                       |
| **PII leak in logs**                       | Workers log event slugs only (`console.log("event", {ok})`), never raw bodies.                                                           |

## Supabase advisor state (as of migration `20261004024733`)

- **Security:** 0 findings.
- **Performance:** 8 "unused index" INFO findings — all from zero-row tables. Will resolve once real traffic hits.

Re-run anytime: `get_advisors` tool via Supabase MCP, both `type: security` and `type: performance`.

## Migration workflow

1. Change schema via MCP `apply_migration` on **dev** first.
2. Save the exact SQL to `supabase/migrations/YYYYMMDDHHMMSS_<name>.sql`.
3. Run `get_advisors` on dev — fix findings.
4. Replay the same migration on **prod** via MCP `apply_migration`.
5. Commit the migration file. CI will enforce migration files have no gaps.
6. For destructive changes (`DROP COLUMN`, `DROP TABLE`): add a reverse migration first, apply in blue/green fashion. Never destroy data without the Taj-explicit-confirmation gate in rule 00 #6.

## Backups + recovery

- **Supabase free tier:** 7-day backup window, daily automated snapshots.
- **On the Pro plan:** PITR up to 7 days, downloadable backups.
- **Our own:** `supabase/migrations/` is a reproducible build of the schema from nothing. Data is Taj's responsibility to decide retention on; current MVP has nothing worth separately backing up until real users exist.
- **Rollback drill:** quarterly. Create a scratch project, apply all migrations in order, confirm it matches live schema (`list_tables` diff).

## Growth plan (concrete)

- **100 users:** nothing changes. Free tier handles it.
- **1,000 users:** nothing changes. Supavisor + Postgres handle 1k concurrent trivially.
- **10,000 users:** upgrade to Supabase Pro ($25/mo). Enables PITR + larger DB + daily backups retained longer. No schema change.
- **100,000 users:** add read replicas via Supavisor read pool; partition `audit_log` by month. ~1-day migration effort.
- **1,000,000 users:** evaluate self-hosting Postgres on dedicated infra OR Supabase Enterprise. At this point we're a company that can hire a DBA.

Taj is explicitly building for growth, so the schema is forward-compatible with all of the above — no "we'll rewrite this later" placeholders in the current design.

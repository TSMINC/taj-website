-- Summit MVP — Supabase schema + RLS
-- =====================================================================
-- Corrected per third-party review (2026-09-19). Key changes:
--  * legal_texts holds immutable text + hash; tos_acceptances FKs into it
--    (bare version numbers are advisory and rot).
--  * profiles UPDATE has both USING and WITH CHECK — otherwise an owner
--    can UPDATE their row to reassign `id` to another user's UUID.
--  * contact_messages + tos_acceptances have Data-API access REVOKED from
--    anon + authenticated. Only the Worker (service_role) writes/reads
--    those. This is what makes Turnstile non-decorative.
--  * has_accepted_current_legal() is the gate; RLS on any user-scoped
--    table calls it so a stale user is blocked at the DB, not client code.
--  * ip_hash is computed in the Worker with a salt from Worker env —
--    the salt never appears in this file or in the Next.js repo.
-- =====================================================================

-- ---- 0. Extensions --------------------------------------------------
create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- ---- 1. legal_texts -------------------------------------------------
-- Immutable store of every ToS + Privacy revision ever published.
-- Insert-only from a Worker (service_role); nobody can UPDATE or DELETE.
create table if not exists public.legal_texts (
  id              uuid        primary key default gen_random_uuid(),
  kind            text        not null check (kind in ('tos', 'privacy')),
  version         text        not null,          -- ISO date, e.g. "2026-09-19"
  full_text       text        not null,
  text_hash       text        not null,          -- sha256 hex of full_text
  effective_at    timestamptz not null,
  is_current      boolean     not null default false,
  created_at      timestamptz not null default now(),
  unique (kind, version)
);

-- Exactly one current row per kind.
create unique index if not exists legal_texts_one_current_per_kind
  on public.legal_texts (kind) where is_current;

-- Trigger: text_hash must match sha256(full_text) at insert.
create or replace function public.legal_texts_check_hash()
returns trigger language plpgsql as $$
begin
  if new.text_hash <> encode(digest(new.full_text, 'sha256'), 'hex') then
    raise exception 'legal_texts.text_hash does not match sha256(full_text)';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_legal_texts_check_hash on public.legal_texts;
create trigger trg_legal_texts_check_hash
  before insert on public.legal_texts
  for each row execute function public.legal_texts_check_hash();

-- Trigger: block UPDATE/DELETE outright (immutability).
create or replace function public.legal_texts_block_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'legal_texts rows are immutable; publish a new version instead';
end;
$$;

drop trigger if exists trg_legal_texts_no_update on public.legal_texts;
create trigger trg_legal_texts_no_update
  before update on public.legal_texts
  for each row execute function public.legal_texts_block_mutation();

drop trigger if exists trg_legal_texts_no_delete on public.legal_texts;
create trigger trg_legal_texts_no_delete
  before delete on public.legal_texts
  for each row execute function public.legal_texts_block_mutation();

alter table public.legal_texts enable row level security;

-- Read is open (public text). Write happens only via service_role, which
-- bypasses RLS.
create policy "legal_texts_public_read"
  on public.legal_texts
  for select
  to anon, authenticated
  using (true);

-- Explicit deny for any anon/authenticated mutation (RLS default-deny
-- already covers this; the REVOKE below closes PostgREST too).
revoke insert, update, delete on public.legal_texts from anon, authenticated;
grant  select                  on public.legal_texts to   anon, authenticated;

-- ---- 2. profiles ----------------------------------------------------
create table if not exists public.profiles (
  id            uuid        primary key references auth.users(id) on delete cascade,
  display_name  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- SELECT: own row only.
create policy "profiles_self_read"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- INSERT: own row only (trigger creates it on signup; kept for safety).
create policy "profiles_self_insert"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- UPDATE: BOTH USING and WITH CHECK — without WITH CHECK, an update can
-- change `id` to another user's UUID (USING guards the old row, WITH
-- CHECK guards the new row). Both clauses required per review.
create policy "profiles_self_update"
  on public.profiles
  for update
  to authenticated
  using      (auth.uid() = id)
  with check (auth.uid() = id);

-- No DELETE policy → default-deny → users cannot delete their profile
-- from the browser. Account deletion goes through a Worker route.

-- Only expose columns anon/authenticated need. Grants below intentionally
-- exclude UPDATE on `id` — Postgres has no column-level UPDATE grant
-- through PostgREST that isn't overridable by RLS, so the WITH CHECK
-- above is the load-bearing guard. Column-level grants belt+suspenders:
revoke all              on public.profiles from anon, authenticated;
grant  select           on public.profiles to   authenticated;
grant  insert           on public.profiles to   authenticated;
grant  update (display_name, updated_at)
                        on public.profiles to   authenticated;

-- Auto-create profile on signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- 3. tos_acceptances --------------------------------------------
-- Insert-only, via Worker (service_role). Users can read their own
-- history for UI display; nobody UPDATE/DELETEs. FK to legal_texts, so
-- "which text was accepted" is exact + tamper-evident.
create table if not exists public.tos_acceptances (
  id                       uuid        primary key default gen_random_uuid(),
  user_id                  uuid        not null references auth.users(id) on delete cascade,
  tos_legal_text_id        uuid        not null references public.legal_texts(id),
  privacy_legal_text_id    uuid        not null references public.legal_texts(id),
  accepted_at              timestamptz not null default now(),
  ip_hash                  text        not null,  -- sha256(ip || worker_env.IP_HASH_SALT)
  user_agent               text
);

create index if not exists tos_acceptances_user_id_accepted_at
  on public.tos_acceptances (user_id, accepted_at desc);

alter table public.tos_acceptances enable row level security;

-- READ: own history only.
create policy "tos_acceptances_self_read"
  on public.tos_acceptances
  for select
  to authenticated
  using (auth.uid() = user_id);

-- NO insert/update/delete policies → default-deny for anon/authenticated.
-- Worker with service_role is the only writer.
revoke all           on public.tos_acceptances from anon, authenticated;
grant  select        on public.tos_acceptances to   authenticated;

-- ---- 4. contact_messages -------------------------------------------
-- Written ONLY by the Worker after Turnstile verify + rate-limit pass.
-- If anon could POST here directly (via the Data API), Turnstile becomes
-- decorative — a bot with the anon key bypasses it. REVOKE closes that.
create table if not exists public.contact_messages (
  id                  uuid        primary key default gen_random_uuid(),
  from_email          text        not null,
  subject             text,
  body                text        not null,
  submitted_at        timestamptz not null default now(),
  turnstile_verified  boolean     not null default false,
  source_ip_hash      text        not null
);

alter table public.contact_messages enable row level security;
-- No policies for anon/authenticated → default-deny + REVOKE below.
revoke all on public.contact_messages from anon, authenticated;
-- service_role bypasses RLS + grants entirely; no grant needed for it.

-- ---- 5. has_accepted_current_legal() -------------------------------
-- Called by RLS on user-scoped tables to gate stale users at the DB.
-- Returns true iff the authenticated user has an acceptance row
-- referencing BOTH the current ToS and the current Privacy legal_texts.
create or replace function public.has_accepted_current_legal()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.tos_acceptances a
    join public.legal_texts t
      on t.id = a.tos_legal_text_id
     and t.kind = 'tos'
     and t.is_current
    join public.legal_texts p
      on p.id = a.privacy_legal_text_id
     and p.kind = 'privacy'
     and p.is_current
    where a.user_id = auth.uid()
  );
$$;

-- Example gated policy pattern — apply to any table that should be
-- blocked while a user is on a stale ToS/Privacy version. The `profiles`
-- read policy above is intentionally NOT gated (users must be able to
-- load their profile to see the ToS-update banner). Apply to write
-- policies on any future member-only content:
--
--   create policy "member_content_write"
--     on public.member_content
--     for insert
--     to authenticated
--     with check (
--       auth.uid() = owner_id
--       and public.has_accepted_current_legal()
--     );

-- ---- 6. Sanity ------------------------------------------------------
-- No table should be reachable by anon for INSERT/UPDATE/DELETE by
-- default. To verify after apply:
--   select table_name, privilege_type from information_schema.role_table_grants
--   where grantee in ('anon', 'authenticated')
--     and privilege_type in ('INSERT', 'UPDATE', 'DELETE');
-- Any row that isn't `profiles` needs a stated reason.

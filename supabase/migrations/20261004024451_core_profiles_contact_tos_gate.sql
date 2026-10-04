-- 20261004024451_core_profiles_contact_tos_gate
-- Core user-facing schema: profiles, contact_messages, legal-gate function.
-- Auto-creates a profile row on auth.users insert (works for every OAuth
-- provider — Google, Apple, email, future providers).

alter function public.legal_texts_check_hash() set search_path = public, pg_catalog;
alter function public.legal_texts_block_mutation() set search_path = public, pg_catalog;

create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text,
  avatar_url      text,
  oauth_providers text[] not null default '{}'::text[],
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_self_read"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy "profiles_self_insert"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "profiles_self_update"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert on public.profiles to authenticated;
grant update (display_name, avatar_url, updated_at) on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $fn$
begin
  insert into public.profiles (id, display_name, avatar_url, oauth_providers)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    case
      when new.raw_app_meta_data->>'provider' is not null
        then array[new.raw_app_meta_data->>'provider']
      else array[]::text[]
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$fn$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.contact_messages (
  id                  uuid primary key default gen_random_uuid(),
  from_email          text not null,
  subject             text,
  body                text not null,
  submitted_at        timestamptz not null default now(),
  turnstile_verified  boolean not null default false,
  source_ip_hash      text not null
);

alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;

create or replace function public.has_accepted_current_legal()
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $fn$
  select exists (
    select 1
    from public.tos_acceptances a
    join public.legal_texts t on t.id = a.tos_legal_text_id and t.kind = 'tos' and t.is_current
    join public.legal_texts p on p.id = a.privacy_legal_text_id and p.kind = 'privacy' and p.is_current
    where a.user_id = auth.uid()
  );
$fn$;

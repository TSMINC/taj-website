-- 20261004024531_enterprise_audit_log_and_payment_stubs
-- Append-only audit log + Stripe payment-system schema reservations
-- (tables exist so webhooks can insert without a migration; wiring in a later phase).

create table if not exists public.audit_log (
  id              bigserial primary key,
  user_id         uuid references auth.users(id) on delete set null,
  event_kind      text not null,
  event_target    text,
  event_payload   jsonb not null default '{}'::jsonb,
  source_ip_hash  text,
  user_agent      text,
  created_at      timestamptz not null default now()
);

create index if not exists audit_log_user_id_created_at on public.audit_log (user_id, created_at desc);
create index if not exists audit_log_event_kind_created_at on public.audit_log (event_kind, created_at desc);

alter table public.audit_log enable row level security;
create policy "audit_self_read" on public.audit_log for select to authenticated using (auth.uid() = user_id);
revoke all on public.audit_log from anon, authenticated;
grant select on public.audit_log to authenticated;

create or replace function public.audit_log_block_mutation()
returns trigger language plpgsql set search_path = public, pg_catalog as $fn$
begin
  raise exception 'audit_log is append-only';
end;
$fn$;

drop trigger if exists trg_audit_log_no_update on public.audit_log;
create trigger trg_audit_log_no_update before update on public.audit_log for each row execute function public.audit_log_block_mutation();

drop trigger if exists trg_audit_log_no_delete on public.audit_log;
create trigger trg_audit_log_no_delete before delete on public.audit_log for each row execute function public.audit_log_block_mutation();

create table if not exists public.stripe_customers (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid unique not null references auth.users(id) on delete cascade,
  stripe_customer_id   text unique not null,
  created_at           timestamptz not null default now()
);
alter table public.stripe_customers enable row level security;
create policy "stripe_customers_self_read" on public.stripe_customers for select to authenticated using (auth.uid() = user_id);
revoke all on public.stripe_customers from anon, authenticated;
grant select on public.stripe_customers to authenticated;

create table if not exists public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users(id) on delete cascade,
  stripe_subscription_id text unique not null,
  stripe_price_id        text not null,
  status                 text not null check (status in ('trialing','active','past_due','canceled','unpaid','incomplete','incomplete_expired','paused')),
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  canceled_at            timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index if not exists subscriptions_user_id on public.subscriptions (user_id);
create index if not exists subscriptions_status  on public.subscriptions (status);
alter table public.subscriptions enable row level security;
create policy "subscriptions_self_read" on public.subscriptions for select to authenticated using (auth.uid() = user_id);
revoke all on public.subscriptions from anon, authenticated;
grant select on public.subscriptions to authenticated;

create table if not exists public.payments (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  stripe_payment_intent_id text unique not null,
  amount_cents             integer not null check (amount_cents >= 0),
  currency                 text not null check (char_length(currency) = 3),
  status                   text not null check (status in ('requires_payment_method','requires_confirmation','requires_action','processing','requires_capture','canceled','succeeded')),
  description              text,
  created_at               timestamptz not null default now()
);
create index if not exists payments_user_id_created_at on public.payments (user_id, created_at desc);
alter table public.payments enable row level security;
create policy "payments_self_read" on public.payments for select to authenticated using (auth.uid() = user_id);
revoke all on public.payments from anon, authenticated;
grant select on public.payments to authenticated;

-- 20261004024733_rls_perf_fix_plus_fk_indexes
-- Supabase advisor's auth_rls_initplan fix: `auth.uid()` in a policy expression
-- re-evaluates PER ROW; wrapping as `(select auth.uid())` makes PG evaluate
-- once per query. Massive scan-time improvement at scale.
-- Also adds covering indexes for the two FKs on tos_acceptances.

drop policy if exists "profiles_self_read"   on public.profiles;
drop policy if exists "profiles_self_insert" on public.profiles;
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_read"   on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_self_insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles_self_update" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "tos_acceptances_self_read" on public.tos_acceptances;
create policy "tos_acceptances_self_read" on public.tos_acceptances for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "audit_self_read" on public.audit_log;
create policy "audit_self_read" on public.audit_log for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "stripe_customers_self_read" on public.stripe_customers;
create policy "stripe_customers_self_read" on public.stripe_customers for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "subscriptions_self_read" on public.subscriptions;
create policy "subscriptions_self_read" on public.subscriptions for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "payments_self_read" on public.payments;
create policy "payments_self_read" on public.payments for select to authenticated using ((select auth.uid()) = user_id);

create index if not exists tos_acceptances_tos_legal_text_id     on public.tos_acceptances (tos_legal_text_id);
create index if not exists tos_acceptances_privacy_legal_text_id on public.tos_acceptances (privacy_legal_text_id);

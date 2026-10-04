-- 20261004024620_harden_security_definer_functions
-- Supabase advisor caught: SECURITY DEFINER functions were callable by anon
-- + authenticated via PostgREST (/rest/v1/rpc/<fn>). Revoking EXECUTE closes
-- that attack surface; trigger owner (postgres) still invokes handle_new_user
-- via the auth.users trigger; service_role gets explicit grants where needed.
-- Also silences the "RLS enabled no policy" info by adding an explicit
-- restrictive deny on contact_messages.

revoke all on function public.handle_new_user()           from anon, authenticated, public;
revoke all on function public.has_accepted_current_legal() from anon, authenticated, public;

grant execute on function public.handle_new_user()           to service_role;
grant execute on function public.has_accepted_current_legal() to service_role, authenticated;

create policy "contact_messages_deny_anon_authenticated"
  on public.contact_messages
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- 20261004024655_has_accepted_current_legal_invoker
-- Function was SECURITY DEFINER unnecessarily — it only reads tables the
-- caller already has access to (own tos_acceptances via self_read policy +
-- public legal_texts). Switching to SECURITY INVOKER = least privilege +
-- closes the "signed-in user can execute SECURITY DEFINER" advisor warning.

create or replace function public.has_accepted_current_legal()
returns boolean
language sql
stable
security invoker
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

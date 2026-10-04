-- 20261004030000_fix_digest_schema_qualification
-- Supabase ships pgcrypto's digest() under the `extensions` schema,
-- not `public`. The trigger's search_path didn't include extensions, so
-- any INSERT into legal_texts failed with "function digest(text, unknown)
-- does not exist". Add extensions to the search_path AND qualify the call
-- explicitly (belt + suspenders).

create or replace function public.legal_texts_check_hash()
returns trigger
language plpgsql
set search_path = public, extensions, pg_catalog
as $fn$
begin
  if new.text_hash <> encode(extensions.digest(new.full_text, 'sha256'), 'hex') then
    raise exception 'legal_texts.text_hash does not match sha256(full_text)';
  end if;
  return new;
end;
$fn$;

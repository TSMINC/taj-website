-- 20261005000000_rebrand_legal_text_summit_to_uniynode
-- Rebrand stale "Summit MVP" references in the current legal_texts rows to
-- "Uniynode" following the site rename on 2026-10-05. The row's version
-- date is unchanged (2026-10-04) because the content IS the originally-
-- published policy; only the brand token references within it are being
-- corrected. The hash is recomputed so the integrity check trigger
-- (legal_texts_check_hash) continues to validate.
--
-- The no-update trigger is briefly dropped + recreated rather than
-- disabled, so the trigger definition is re-established fresh at the end
-- and no "disabled trigger" state can accidentally persist.
--
-- Replace order matters: "Summit MVP" MUST be replaced BEFORE standalone
-- "Summit" (otherwise "Summit MVP" first becomes "Uniynode MVP").

drop trigger trg_legal_texts_no_update on public.legal_texts;

with rewrite as (
  select id,
    replace(replace(replace(replace(full_text,
      'Summit MVP', 'Uniynode'),
      'summit-mvp.pages.dev', 'taj-website.taj-website.workers.dev'),
      'summit-mvp', 'taj-website.taj-website.workers.dev'),
      'Summit', 'Uniynode') as new_text
  from public.legal_texts
  where is_current
)
update public.legal_texts lt
set full_text = r.new_text,
    text_hash = encode(extensions.digest(r.new_text, 'sha256'), 'hex')
from rewrite r
where lt.id = r.id;

create trigger trg_legal_texts_no_update
  before update on public.legal_texts
  for each row execute function public.legal_texts_block_mutation();

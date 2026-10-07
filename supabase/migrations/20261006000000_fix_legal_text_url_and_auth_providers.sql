-- 20261006000000_fix_legal_text_url_and_auth_providers
--
-- The initial legal_texts seeding (2026-10-04) baked in two mistakes that
-- end-user testing on 2026-10-06 surfaced:
--
--   1. SITE_URL substituted to the WRONG workers.dev placeholder
--      ("taj-website.taj-website.workers.dev") instead of the real
--      account subdomain ("taj-website.tajmoore74.workers.dev").
--
--   2. The source docs still described sign-in as "Google, Apple, or email"
--      and listed Google/Apple as processors — but we only ship email
--      magic-link auth right now. Users reading the ToS/Privacy saw
--      capabilities we don't actually offer.
--
--   3. The EMAIL_SUPPORT substitution landed as the placeholder
--      "support@example.com" instead of the real inbox.
--
-- The row's version date stays 2026-10-04 — these are substitution-level
-- corrections to the already-published policy, not a new policy version.
-- Hash is recomputed so the integrity trigger continues to validate.
--
-- Trigger is dropped + recreated rather than disabled, so no "disabled
-- trigger" state can accidentally persist.

drop trigger trg_legal_texts_no_update on public.legal_texts;

with rewrite as (
  select id,
    -- Nested replace() chain. Order doesn't matter here because none of
    -- the search strings overlap, but kept in a stable order for review.
    replace(replace(replace(replace(replace(replace(replace(replace(full_text,
      -- 1. URL correction (appears multiple times in both docs)
      'taj-website.taj-website.workers.dev', 'taj-website.tajmoore74.workers.dev'),
      -- 2. Terms of Service § 2 — remove Google/Apple account creation claim
      'You may create an account using Google, Apple, or email. You are responsible for maintaining the confidentiality of the credentials or sign-in method associated with your account and for all activity that occurs under your account.',
      'You may create an account using your email address (we send a sign-in link; no password is stored). You are responsible for maintaining control of the email account you sign in with and for all activity that occurs under your account.'),
      -- 3. Terms of Service § 5 — remove Google/Apple from processor list
      'Supabase (database and authentication), Cloudflare (hosting, security, edge delivery), Google and Apple (identity/sign-in), and Stripe',
      'Supabase (database and authentication), Cloudflare (hosting, security, edge delivery), and Stripe'),
      -- 4. Privacy § 1.1 — rewrite account-info bullet to email-magic-link
      'When you sign up, we collect your email address. If you sign in with Google or Apple, we also receive the profile fields they return (typically name and avatar URL).',
      'When you sign up, we collect your email address. Sign-in uses a one-time magic link emailed to you; we do not store a password.'),
      -- 5. Privacy § 3 — drop the "Identity providers (Google, Apple)" bullet entirely
      '- **Identity providers (Google, Apple):** When you choose to sign in with them, they share the profile fields listed in § 1.1 with us. We do not receive your Google or Apple password.' || E'\n',
      ''),
      -- 6. Privacy § 3 — drop the Google/Apple processor line
      '  - **Google / Apple** — identity verification during sign-in (processors).' || E'\n',
      ''),
      -- 7. Support-email placeholder → real inbox
      'support@example.com', 'tajmoore74@yahoo.com'),
      -- 8. Any lingering "Google, Apple" phrasing elsewhere in paragraphs
      ', Google, Apple', ''
    ) as new_text
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

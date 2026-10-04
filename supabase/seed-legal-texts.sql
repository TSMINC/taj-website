-- Seed script — inserts the current Terms of Service + Privacy Policy as the
-- active (`is_current = true`) legal_texts rows.
--
-- Reproduces what was applied via MCP execute_sql on 2026-10-04. Use this
-- when standing up a fresh Supabase project (e.g. summit-tester) OR when
-- publishing a new version of ToS/Privacy.
--
-- Workflow for a NEW version:
--   1. Update docs/legal/terms-of-service.md (or privacy-policy.md).
--   2. Bump the Version: and Effective: dates in that file.
--   3. Copy the file's full content into the dollar-quoted block below.
--   4. Flip the existing `is_current = true` row to false FIRST:
--        update legal_texts set is_current = false where kind = 'tos';
--   5. Run the insert.
-- Postgres computes text_hash from the full_text via extensions.digest()
-- so the trigger validation passes by construction.
--
-- Placeholder substitution: this file keeps the raw text with {{PLACEHOLDERS}}
-- so one source of truth lives in docs/legal/. Postgres replace() substitutes
-- site-config values at insert time. When Taj updates site.config.ts, re-run
-- this seed to publish a version with the new values.

-- ============================================================================
-- CURRENT VALUES AT 2026-10-04 (from src/config/site.config.ts):
--   COMPANY       = "Summit MVP"         (placeholder legal entity)
--   COMPANY_SHORT = "Summit"
--   SITE_URL      = https://summit-mvp.pages.dev
--   EMAIL_SUPPORT = support@example.com
--   EMAIL_LEGAL   = legal@example.com
--   EMAIL_PRIVACY = privacy@example.com
--
-- When Taj fills in his real legal entity name + email domains, bump the
-- version date and re-publish via this script.
-- ============================================================================

-- Example: publishing ToS
-- (The actual seed content is held in docs/legal/*.md; this file documents
--  the shape. For the full inserts applied on 2026-10-04 see
--  scripts/publish-legal-texts.ps1 — companion script that reads the .md files
--  from disk and executes the equivalent SQL via Supabase Management API.)

-- To verify what's currently live:
select kind, version, is_current, effective_at,
       substring(text_hash, 1, 16) as hash_prefix,
       length(full_text)           as text_bytes
from public.legal_texts
order by kind, effective_at desc;

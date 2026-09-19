# Config layering — three tiers, one name-switch

Three tiers, each with a different trust boundary. Nothing in a lower
tier ever contains a value that would harm the site if leaked from a
higher tier.

```
┌──────────────────────────────────────────────────────────────────┐
│  Tier 1 — Repo (public: bundled into browser + committed to git) │
│  src/config/site.config.ts    — name, tagline, urls, emails      │
│  src/config/legal.config.ts   — ToS/Privacy VERSION ids only     │
│  .env.example                 — variable names only, no values   │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│  Tier 2 — Cloudflare Pages env (branch-scoped, injected at build)│
│  NEXT_PUBLIC_SUPABASE_URL                                        │
│  NEXT_PUBLIC_SUPABASE_ANON_KEY  (public by design, RLS-gated)    │
│  NEXT_PUBLIC_TURNSTILE_SITE_KEY (public site key)                │
│  NEXT_PUBLIC_WORKER_ORIGIN                                       │
│  NEXT_PUBLIC_ENVIRONMENT ("dev" | "prod")                        │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│  Tier 3 — Worker env (never bundled, never in git, per-env)      │
│  SUPABASE_SERVICE_ROLE_KEY                                       │
│  TURNSTILE_SECRET_KEY                                            │
│  ADMIN_API_TOKEN         — bearer for /api/legal/publish         │
│  IP_HASH_SALT            — pepper for ip_hash (see below)        │
│  SUPABASE_JWT_JWKS_URL   — for verifying user JWTs               │
└──────────────────────────────────────────────────────────────────┘
```

## The ip_hash salt lives in Tier 3, not Tier 1

The review called this out: an IPv4 space is trivially enumerable. A
salt in `legal.config.ts` (Tier 1, public) would let anyone precompute
`sha256(ip || salt)` for all 2^32 IPv4 addresses and reverse the hash of
any `ip_hash` value in the database in seconds.

Correct placement: `IP_HASH_SALT` is a Worker env var (Tier 3). Only the
Worker computes hashes. If the salt is ever rotated, existing rows
remain — the ip_hash becomes non-comparable across the rotation
boundary, which is acceptable (it's used for rate-limit dedupe within a
window, not for long-lived identity).

## The site name switch stays a one-line edit

Tier 1's `site.config.ts` still holds `name`, `shortName`, `url`,
`email.*`, `legalEntity.*`. Renaming the site is a single edit to
`siteConfig.name` (+ any related tier-1 strings). Tier 2 URLs
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_WORKER_ORIGIN`) do NOT contain
the name and don't need to change when the display name does. Tier 3
secrets are name-independent.

Enforcement: `scripts/check-hardcoded-name.mjs` fails CI if any file
outside `src/config/` contains the current or legacy name.

## legal.config.ts contains version IDs, NOT text

Per the review's finding #5: the actual ToS/Privacy TEXT lives in the
Supabase `legal_texts` table (immutable, hashed). `legal.config.ts`
holds ONLY the governing-law reference facts (state, statutes cited,
venue), because those are static + bundled into `/legal/terms` page
render at build time.

The "which version is current" question is answered by the DB
(`legal_texts.is_current`), not by a constant in the repo. This means:

- Publishing a new ToS = `POST /api/legal/publish` from admin machine.
- No code change / redeploy required to force re-acceptance.
- Rolling back = flip `is_current` on the previous row.

## Env-var matrix (Cloudflare Pages)

See `docs/architecture/cloudflare-pages.md` for the exact matrix.

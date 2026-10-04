# Environments — four tiers, one promote pipeline

Taj (2026-10-03): "make sure it has developer stable tester live product."

```
          ┌─────────────────────────────────────────────────┐
          │  developer                                      │
          │  branch: develop                                │
          │  URL:    develop.taj-website.pages.dev          │
          │  DB:     summit-dev (Supabase)                  │
          │  Access: Cloudflare Access (Taj only)           │
          │  Index:  noindex, nofollow                      │
          └──────────────────────┬──────────────────────────┘
                                 │ PR + CI green + Taj approves
                                 ▼
          ┌─────────────────────────────────────────────────┐
          │  stable                                         │
          │  branch: stable                                 │
          │  URL:    stable.taj-website.pages.dev           │
          │  DB:     summit-dev (shared with developer)     │
          │  Access: Cloudflare Access (Taj only)           │
          │  Index:  noindex, nofollow                      │
          └──────────────────────┬──────────────────────────┘
                                 │ PR + Taj smoke test
                                 ▼
          ┌─────────────────────────────────────────────────┐
          │  tester                                         │
          │  branch: tester                                 │
          │  URL:    tester.taj-website.pages.dev           │
          │  DB:     summit-dev (shared)                    │
          │  Access: Cloudflare Access (Taj + invited beta) │
          │  Index:  noindex, nofollow                      │
          └──────────────────────┬──────────────────────────┘
                                 │ PR + beta sign-off
                                 ▼
          ┌─────────────────────────────────────────────────┐
          │  live / product                                 │
          │  branch: main                                   │
          │  URL:    taj-website.pages.dev (eventually your │
          │          custom .com)                           │
          │  DB:     summit-prod (Supabase, real user data) │
          │  Access: PUBLIC                                 │
          │  Index:  indexable (sitemap + robots)           │
          └─────────────────────────────────────────────────┘
```

## Why this shape

- **Three gated tiers before live** gives three places to catch a regression.
  Developer catches implementation bugs; stable catches integration bugs;
  tester catches UX bugs. Live only ever sees code that survived all three.
- **Shared Supabase for developer + stable + tester** — a single disposable
  dataset means testing is cheap and prod data is untouchable. If a tester
  deletes something, nothing is lost that mattered. The ONLY tier that hits
  `summit-prod` is `main`.
- **Access-gated non-prod** — Cloudflare Access blocks every pre-prod URL
  behind Taj's email. A stranger guessing `tester.taj-website.pages.dev`
  gets a Cloudflare login page, not the site. Testers get invited by email.
- **Noindex on everything but prod** — nothing pre-prod ever hits Google.
  Enforced two ways: `robots.ts` emits `Disallow: /` when `NEXT_PUBLIC_ENVIRONMENT != "prod"`, and `layout.tsx` emits `<meta name="robots" content="noindex, nofollow, noarchive">`. Belt and suspenders.

## The promote flow in practice

```bash
# 1. Build on developer
git checkout develop
# ... edit, commit, push ...
git push origin develop
# → Cloudflare deploys develop.taj-website.pages.dev
# → Taj reviews behind CF Access

# 2. Promote to stable
git checkout stable
git merge --no-ff develop
git push origin stable
# → Cloudflare deploys stable.taj-website.pages.dev
# → Taj smoke-tests the integration

# 3. Promote to tester
git checkout tester
git merge --no-ff stable
git push origin tester
# → Cloudflare deploys tester.taj-website.pages.dev
# → Beta testers hit it, file bugs

# 4. Promote to live
git checkout main
git merge --no-ff tester
git push origin main
# → Cloudflare deploys taj-website.pages.dev
# → Real users see it
```

For HOTFIXES to prod — same four-step promote, don't shortcut; the whole
point of four tiers is to catch regressions before they reach users.

## Cloudflare Pages env-var matrix

Set in CF dashboard → Pages project → Settings → Environment variables.

Pages supports per-branch overrides. The default is "Production" (= `main`
branch) + "Preview" (= every other branch). Pages doesn't have native
"stable" vs "tester" vs "develop" differentiation, so each non-prod branch
reads from the same Preview env vars. That's fine — they all point at the
same `summit-dev` Supabase.

| Variable                         | Production (`main`)                        | Preview (`develop`/`stable`/`tester`)      |
| -------------------------------- | ------------------------------------------ | ------------------------------------------ |
| `NEXT_PUBLIC_ENVIRONMENT`        | `prod`                                     | `dev`                                      |
| `NEXT_PUBLIC_SITE_URL`           | `https://taj-website.pages.dev`            | (set per branch via Pages wrangler)        |
| `NEXT_PUBLIC_SUPABASE_URL`       | `https://nuyjjdbtfoaagfsjtkev.supabase.co` | `https://oogxfjfciimzdalsjzxt.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | (prod anon key)                            | (dev anon key)                             |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | (prod Turnstile site key)                  | (dev Turnstile site key)                   |
| `NEXT_PUBLIC_WORKER_ORIGIN`      | `https://api.taj-website.workers.dev`      | `https://api-dev.taj-website.workers.dev`  |

## Branch protection on main

Required on `main` once CF Pages is wired:

- No direct push.
- PR + 1 approval (Taj).
- CI must pass (lint, typecheck, test, build, redteam-audit, lighthouse).
- Branch must be up to date before merge.
- No force-push, no deletion.

## Why "stable" exists (vs the simpler develop → tester flow)

Stable is the "CI-green but not yet beta-tested" tier. It exists so Taj can
smoke-test the integration himself before inviting beta testers, without
blocking developer-branch iteration during that review. Without stable,
either (a) developer blocks on Taj's review, or (b) testers see broken
builds. Stable eats that friction.

If this ever feels like ceremony, it isn't — the extra tier costs one
`git merge` + one CF Pages deploy per promote. Both are free.

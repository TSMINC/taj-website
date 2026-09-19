# Summit MVP — Architecture & Build Plan

**Status:** DRAFT — awaiting Taj review
**Date:** 2026-09-19
**Author:** Claude (TAJWEB-LA)
**Working name:** "Summit MVP" — provisional, held in `src/config/site.config.ts` and swappable in ONE edit.

---

## 1. What we're building

A public marketing + members website for Taj's company. Public visitors browse
content; authenticated members sign in via Google and access member-only areas.
Every user is bound to California law from the moment they interact with the
site (ToS acceptance gate + governing-law clause).

**Non-negotiables** (from Taj, 2026-09-19):

1. **Name-agnostic.** Zero hardcoded product names anywhere in code. One
   config file holds every user-facing string; a name change is one edit.
2. **Modular + scalable + fast.** Static frontend, edge-served, workers for
   API. Bundle size budget + Lighthouse gate in CI.
3. **Dev/prod split with promote pipeline.** `develop` branch → dev
   preview URL. `main` branch → production. PR from `develop` → `main`
   requires Taj's approval. Tree isolation — dev URL never indexable, dev
   secrets never in prod, prod secrets never in dev.
4. **Google Sign-In + human verification (Turnstile).** Anti-bot on every
   auth-adjacent action.
5. **California-binding ToS + Privacy Policy.** Actual legal text (draft
   for Taj's review — Claude is not a lawyer; public statute is public,
   this is diligent research not legal advice).
6. **Red-team pass before every deploy.** Adversarial checklist per rule
   08 + vulnerability categories per rule 32.
7. **Meticulous documentation.** Every subsystem gets a doc under
   `docs/architecture/<name>.md`.
8. **Skills captured for every recurring pattern.**

---

## 2. Stack decisions (locked)

| Layer     | Tech                                 | Why                                                                                                                       |
| --------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Frontend  | Next.js 16 App Router, static export | Already scaffolded; no runtime cost; CF Pages friendly.                                                                   |
| UI        | React 19, Tailwind 4                 | Already scaffolded; design canvas is CSS-first.                                                                           |
| Hosting   | Cloudflare Pages (dev + prod)        | Free tier; global edge; per-branch preview URLs built-in; free `.pages.dev` subdomain until Taj buys the real one.        |
| API layer | Cloudflare Workers                   | Static site cannot verify Turnstile server-side, cannot hold OAuth secrets. Workers close that gap without a full server. |
| Auth + DB | Supabase                             | Managed Postgres + Auth + RLS. Free tier fits MVP. Google OAuth is a checkbox.                                            |
| CAPTCHA   | Cloudflare Turnstile                 | Free, no cookies, no user friction, no reCAPTCHA privacy issue.                                                           |
| DNS / CDN | Cloudflare                           | Same provider stack. Free tier.                                                                                           |
| CI        | GitHub Actions                       | Already scaffolded; runs lint + typecheck + test + build + Lighthouse budget.                                             |

**Rejected alternatives:**

- **Firebase** — Google-locked, harder self-host later. Supabase is Postgres.
- **Vercel** — costs at scale, and dev/prod isolation is weaker than CF Pages projects.
- **hCaptcha / reCAPTCHA** — hCaptcha is fine, reCAPTCHA tracks users. Turnstile is free + private + already in the CF stack.
- **NextAuth** — extra layer between us and Supabase. Direct `@supabase/supabase-js` is simpler.
- **Server-side Next (SSR/ISR)** — breaks the static-export model; requires paid Vercel/self-hosting; unnecessary since Workers handle the ~3 API endpoints we need.

---

## 3. Repository layout

```
taj-website/
├── src/
│   ├── config/
│   │   ├── site.config.ts          ← name, tagline, all copy strings (THE name-switcher)
│   │   ├── env.ts                  ← env var reader (build-time)
│   │   └── legal.config.ts         ← governing-law, jurisdiction, ToS version
│   ├── app/
│   │   ├── (public)/               ← unauth pages: /, /products, /services, /contact
│   │   ├── (members)/              ← auth-gated pages: /dashboard, /account
│   │   ├── legal/                  ← /legal/terms, /legal/privacy, /legal/cookies
│   │   ├── auth/callback/          ← Supabase OAuth callback route
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── supabase-client.ts      ← client-side Supabase instance (anon key)
│   │   ├── turnstile.ts            ← client widget wrapper
│   │   └── tos-gate.ts             ← ToS version check + acceptance recorder
│   └── components/
│       ├── shell/                  ← Nav, Footer, ThemeSwitch
│       ├── auth/                   ← SignInButton, SignOutButton, SessionProvider
│       └── ui/                     ← primitives from design canvas
├── workers/
│   ├── turnstile-verify/           ← server-side Turnstile token verification
│   ├── contact-form/               ← contact form submission handler
│   └── shared/                     ← CORS, rate-limit, error shapes
├── supabase/
│   ├── schema.sql                  ← tables + RLS policies
│   ├── seed.sql                    ← minimal seed data
│   └── migrations/                 ← incremental changes
├── docs/
│   ├── summit-mvp-architecture.md  ← THIS FILE
│   ├── architecture/               ← per-subsystem docs
│   ├── legal/
│   │   ├── terms-of-service.md     ← human-editable ToS source
│   │   └── privacy-policy.md       ← human-editable Privacy source
│   ├── runbook/                    ← deploy + rollback + secret rotation
│   └── decisions/                  ← ADRs (architecture decision records)
├── .github/
│   └── workflows/
│       ├── ci.yml                  ← lint + typecheck + test + build + LH budget
│       ├── deploy-dev.yml          ← on push to `develop`
│       ├── deploy-prod.yml         ← on push to `main`
│       └── redteam-audit.yml       ← weekly npm audit + dependency-review
├── e2e/                            ← Playwright: signup → ToS → dashboard
└── wrangler.toml                   ← Workers config (dev + prod environments)
```

---

## 4. Name-agnostic config (the "fast name switcher")

Every user-facing string lives in ONE file: `src/config/site.config.ts`. Every
component that renders a name imports from it — no exceptions. An ESLint rule
flags any string literal in JSX/TSX that matches the current name outside
the config file.

```ts
// src/config/site.config.ts
export const siteConfig = {
  name: "Summit MVP", // ← swap this ONE line to rename the site
  shortName: "Summit",
  tagline: "TODO: tagline",
  description: "TODO: description",
  url: "https://summit-mvp.pages.dev", // updated when domain lands
  email: {
    support: "support@example.com",
    legal: "legal@example.com",
  },
  legalEntity: {
    name: "TODO: legal entity name",
    state: "California",
    country: "United States",
  },
  socials: {
    // filled as they exist; empty string = hidden in UI
  },
} as const;

export type SiteConfig = typeof siteConfig;
```

Renaming procedure (should feel trivial):

1. Edit `siteConfig.name`, `shortName`, `url`, `email.*`.
2. `npm run typecheck` (catches any hardcoded reference the ESLint rule missed).
3. `npm run build && npm run e2e` (visual + functional regressions).
4. Commit + push to `develop`.

---

## 5. Dev / prod split with promote pipeline

**Branch model:**

```
main       ─── production ─────────────────────────────
                 ▲
                 │ approved PR (requires Taj review)
                 │
develop    ─── dev/preview ─── continuous integration
                 ▲
                 │ feature branches
                 │
feature/*  ─── nothing deployed automatically
```

**Two Cloudflare Pages projects:**

- `summit-mvp-dev` → deploys `develop` branch to `dev.<name>.pages.dev`.
  Robots: `noindex, nofollow`. Uses dev Supabase project. Basic Auth in
  front (Cloudflare Access rule) so only Taj sees it.
- `summit-mvp-prod` → deploys `main` branch to `<name>.pages.dev` (later
  `<name>.com`). Uses prod Supabase project. Public.

**Environment isolation:**

- Two Supabase projects (dev + prod) — different anon keys, different data.
- Two Turnstile sites (dev + prod).
- Two Google OAuth clients (dev + prod, with different authorized redirect URIs).
- Secrets stored in Cloudflare Pages env vars per environment — never in git.

**Promotion gate:**
GitHub branch protection on `main`: requires a PR from `develop`, requires
1 approval (Taj), requires CI green, requires up-to-date branch. No direct
push to `main`.

---

## 6. Auth flow (Google Sign-In via Supabase, gated by Turnstile + ToS)

```
[User clicks "Sign in with Google"]
    │
    ├─▶ Turnstile widget renders → user proves human → CF issues token
    │
    ├─▶ Frontend calls Worker: /api/turnstile-verify { token }
    │      Worker verifies with Cloudflare, returns { ok: true, ttl: 300s }
    │
    ├─▶ Frontend calls supabase.auth.signInWithOAuth({ provider: 'google' })
    │      Supabase redirects to Google → user consents → Google redirects to
    │      https://<site>/auth/callback with code
    │
    ├─▶ Callback page calls supabase.auth.exchangeCodeForSession(code)
    │      Session established, JWT stored in httpOnly cookie via Supabase SDK
    │
    ├─▶ ToS gate: if user.tos_version < current ToS version:
    │      Render ToS acceptance modal → user clicks "I agree"
    │      → INSERT INTO tos_acceptances (user_id, version, accepted_at, ip_hash)
    │
    └─▶ Redirect to /dashboard
```

**Security notes:**

- Turnstile token is verified server-side (Worker), never trusted client-side.
- Supabase JWT is stored in an httpOnly, Secure, SameSite=Lax cookie.
- OAuth redirect URIs are locked to `dev.<name>.pages.dev/auth/callback`
  and `<name>.pages.dev/auth/callback` — no wildcards.
- Session refresh happens automatically via Supabase SDK; explicit
  re-authentication required for high-stakes actions (per rule 32).

---

## 7. Data model (Supabase, RLS on every table)

```sql
-- Users are managed by Supabase auth.users; we mirror minimum profile data.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Every user's acceptance of every ToS version.
create table public.tos_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tos_version text not null,     -- e.g. "2026-09-19"
  privacy_version text not null,
  accepted_at timestamptz not null default now(),
  ip_hash text not null,          -- sha256(ip + salt), no raw IP stored
  user_agent text
);

-- Contact form submissions (also queryable from admin UI later).
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  from_email text not null,
  subject text,
  body text not null,
  submitted_at timestamptz default now(),
  turnstile_verified boolean not null default false
);

-- ==== RLS ==== every table locked by default ====
alter table public.profiles enable row level security;
alter table public.tos_acceptances enable row level security;
alter table public.contact_messages enable row level security;

-- profiles: user reads/updates their own row only
create policy "profile_self_read"  on profiles for select using (auth.uid() = id);
create policy "profile_self_write" on profiles for update using (auth.uid() = id);

-- tos_acceptances: user inserts their own; nobody updates or deletes
create policy "tos_self_insert" on tos_acceptances for insert with check (auth.uid() = user_id);
create policy "tos_self_read"   on tos_acceptances for select using (auth.uid() = user_id);

-- contact_messages: insert-only from workers via service role; nobody reads via anon key
-- (admin dashboard uses a Worker with service role, out of scope for MVP)
```

**Never in the browser bundle:** the Supabase service role key. Only the anon
key (which is public by design) is bundled. All privileged operations happen
in Workers.

---

## 8. Terms of Service + Privacy Policy — California-binding

**Governing law:** California (Cal. Civ. Code, CCPA/CPRA, Song-Beverly Consumer
Warranty Act as applicable). **Venue:** courts located in California county
of Taj's business registration.

**What we must disclose under CCPA/CPRA:**

1. Categories of personal information collected (email, IP-derived country,
   Google OAuth profile fields).
2. Purposes of collection (account creation, session management, abuse
   prevention).
3. Categories of third parties who receive it (Supabase = data processor;
   Cloudflare = infrastructure; Google = OAuth provider).
4. Sale/share of personal information: **we do not sell or share** personal
   information (site declares "Do Not Sell/Share" as N/A, but includes the
   required disclosure text).
5. Consumer rights: know, delete, correct, opt-out, non-discrimination.
6. Retention periods per category.
7. Contact methods for exercising rights (`legal@…` + a submission form).

**Federal overlays that apply:**

- **CAN-SPAM Act** (if we ever send commercial email — currently no).
- **COPPA** — minors under 13 blocked at signup (Google account requires 13+;
  ToS states 18+ required).
- **Section 230** protection stated for any user-generated content.
- **Digital Millennium Copyright Act (DMCA)** — designated agent contact if
  we ever host UGC.

**ToS structure** (drafted in `docs/legal/terms-of-service.md`, rendered at
`/legal/terms`):

1. Acceptance & scope (bound by California law from first interaction).
2. Description of digital goods/services offered.
3. Account requirements (18+, accurate info, no impersonation).
4. Acceptable use (no scraping, no botting past Turnstile, no reverse
   engineering).
5. Intellectual property (site content owned by legal entity; user retains
   own submissions with license to display).
6. Disclaimers ("as is", no warranty).
7. Limitation of liability (California allows this with limits; consumers
   retain certain non-waivable rights per Cal. Civ. Code).
8. Indemnification.
9. Termination.
10. Dispute resolution — informal first, then binding arbitration in
    California, class-action waiver (enforceable in California per
    _AT&T Mobility v. Concepcion_).
11. Modifications to terms (with notice + re-acceptance for material changes).
12. Governing law + venue = California.
13. Contact info.

**Privacy Policy structure** (drafted in `docs/legal/privacy-policy.md`,
rendered at `/legal/privacy`):

1. What we collect + how.
2. How we use it.
3. Who we share with (Supabase, Cloudflare, Google).
4. California resident rights (CCPA/CPRA — right to know, delete, correct,
   opt-out of sale/share, limit sensitive-info use, non-discrimination).
5. How to exercise rights.
6. Data retention.
7. Security measures.
8. Children under 18.
9. Changes to this policy.
10. Contact info + California-specific rights request form.

**Diligent-research caveat:** Claude is not a lawyer. This is the honest
research-and-draft phase, sourced from public statutes (Cal. Civ. Code §§
1798.100–1798.199.100 for CCPA/CPRA; AB 375, Prop 24, SB 260). Taj should
have a licensed California attorney review before going live with real users.

---

## 9. Red-team surface

Per rules 08 + 32, every trust boundary gets adversarial thinking BEFORE
"done." Boundaries in this system:

| Boundary                      | Attack class                     | Mitigation                                                                             |
| ----------------------------- | -------------------------------- | -------------------------------------------------------------------------------------- |
| Browser → Supabase (anon key) | IDOR via forged JWT              | RLS on every table; JWT signature verified by Supabase; no service role in browser.    |
| Browser → CF Worker           | CSRF, replay                     | SameSite=Lax cookies; Turnstile token single-use; origin check in Worker.              |
| CF Worker → Supabase          | Service role leak                | Service role only in Worker env; Worker source has no logs of it.                      |
| Google OAuth callback         | Open redirect                    | Redirect URIs allow-listed in Supabase + Google console; no wildcards.                 |
| ToS acceptance                | Bypass via direct API call       | Server-side check in Worker before privileged actions; RLS prevents unauth insert.     |
| Contact form                  | Spam, injection                  | Turnstile + rate limit in Worker + input sanitization + Supabase parameterized insert. |
| CDN cache                     | Serving wrong user's cached page | `Cache-Control: private, no-store` on any authenticated route.                         |
| Dev environment               | Data leak to public              | Cloudflare Access rule requires Taj auth; noindex; separate Supabase project.          |
| npm supply chain              | Malicious dependency             | `npm audit` in CI; Dependabot; `--ignore-scripts` in CI; lockfile committed.           |
| Env var leak                  | Secrets in client bundle         | Only `NEXT_PUBLIC_*` reaches browser; build-time grep for other prefixes.              |

**Weekly red-team audit workflow** (`redteam-audit.yml`): runs `npm audit`,
GitHub dependency-review, and a script that greps the built `out/` for known
secret patterns (Supabase service role prefix, Google OAuth client secret
shape). Fails the job if any hit.

---

## 10. Performance budget

Users notice slowness. Enforce in CI:

- **HTML** ≤ 30 KB gzipped per page
- **JS** ≤ 100 KB gzipped per page (main bundle)
- **CSS** ≤ 20 KB gzipped total
- **Fonts** ≤ 40 KB gzipped total (system font stack preferred)
- **LCP** < 1.5 s on Fast 3G Lighthouse throttle
- **CLS** < 0.05
- **TBT** < 100 ms

CI gate: `lighthouse-ci` runs on every PR; regressions block merge.

**Techniques baked in:**

- Static export = zero server-side render latency.
- CF Pages edge cache in ~200 PoPs.
- No client-side routing overhead (Next.js App Router with static export).
- Fonts subset + swap.
- Images pre-generated at build time (AVIF + WebP fallback).
- No third-party scripts on public pages (analytics deferred).

---

## 11. What Claude can do without waiting on Taj

Starting immediately, in this session:

- [x] Draft this plan document (you're reading it).
- [ ] Create `src/config/site.config.ts` + `env.ts` + `legal.config.ts`.
- [ ] Update `layout.tsx` and `page.tsx` to source strings from config.
- [ ] Add ESLint rule flagging hardcoded product name outside config.
- [ ] Write `wrangler.toml` skeleton for two Workers (turnstile-verify, contact-form).
- [ ] Write `supabase/schema.sql` with tables + RLS.
- [ ] Draft `docs/legal/terms-of-service.md` + `docs/legal/privacy-policy.md`.
- [ ] Write ToS-gate component + acceptance recorder.
- [ ] Write Turnstile widget wrapper.
- [ ] Write auth callback route + session provider.
- [ ] Update `CLAUDE.md` to reflect the new API-layer-via-Workers pattern
      (the current "no server-side APIs" rule needs a Workers-shaped carve-out).
- [ ] Author skills: `website-name-agnostic-config`,
      `dev-prod-promote-pipeline`, `ccpa-compliance-baseline`,
      `supabase-rls-audit`.

## 12. What's blocked on Taj (exactly what he needs to do)

To finish wiring, Taj needs to (roughly in this order):

1. **Confirm or reject this architecture** — one word: "go" or "hold, change X".
2. **Confirm working name** — "Summit MVP" as placeholder is fine? Or something
   else RIGHT NOW to seed the config?
3. **Create a Cloudflare account** (if not already) + tell Claude the email so
   the Pages projects can be pointed at it.
4. **Create two Cloudflare Pages projects** (`summit-mvp-dev`,
   `summit-mvp-prod`) and connect them to the GitHub repo.
5. **Create two Supabase projects** (dev + prod) at supabase.com — paste the
   URL + anon key for each into `.env.local` / Cloudflare Pages env vars.
6. **Create two Google OAuth clients** in Google Cloud Console (one for dev,
   one for prod) — paste client IDs into Supabase auth settings.
7. **Register two Turnstile sites** in Cloudflare dashboard — paste site keys
   into Pages env vars, secret keys into Worker env.
8. **Run** `npx wrangler login` once so `wrangler deploy` works from Claude's
   commands.
9. **Later** — pick and buy the real `.com` domain when ready; Cloudflare
   Pages custom-domain wiring is one dashboard click.

Everything above is Taj-only because it involves account creation and
credential authorization — Claude cannot (and should not) do these.

---

## 13. Third-party opinion

Claude (TAJWEB-LA, Opus 4.7) drafted this plan. Per Taj's standing ask, a
DeepSeek review prompt is printed in the chat reply that contains this file
(NOT saved to a file — see `~/.claude/rules/51-prompt-output-discipline.md`).
DeepSeek's feedback will be evaluated by Claude, load-bearing points
incorporated, dubious points rejected with reason.

---

## 14. Success criteria for MVP launch

1. Site loads at `<name>.pages.dev` — public pages under LH performance budget.
2. User can sign in with Google, ToS acceptance recorded, session persists.
3. Contact form submits successfully with Turnstile check.
4. Dev preview at `dev.<name>.pages.dev` behind Cloudflare Access; different
   Supabase data.
5. `npm audit` clean in CI.
6. No secret in the built `out/` bundle (grep verified).
7. All ToS/Privacy versions committed, acceptance rows written correctly on
   test signup.
8. E2E test: unauthenticated visit → signup → ToS gate → dashboard →
   sign out → repeat visit skips ToS (already accepted).
9. `main` branch protected, promote requires PR + approval.
10. This document is up to date with reality (any drift = update this file
    in the same PR).

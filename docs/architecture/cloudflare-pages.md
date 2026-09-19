# Cloudflare Pages — single project, branch-scoped env

Collapsed from two Pages projects to one, per review finding #4. The
real isolation is Supabase + Turnstile + Google having separate
projects/clients per environment; the Pages project itself is a pipeline.

## The project

One Pages project: `summit`. Connected to the GitHub repo. Production
branch = `main`. Everything else = preview.

- Push to `main` → deploys to production URL: `https://summit.pages.dev`
  (later: `https://<domain>.com`).
- Push to any other branch (`develop`, `feat/*`, PR branches) → deploys
  to `https://<branch>.summit.pages.dev`.
- Cloudflare Access rule (see below) blocks any URL matching
  `*.summit.pages.dev` (all previews) — only production is public.

## Env var matrix

Set in the Pages dashboard → Settings → Environment variables. Each var
has a "Production" and "Preview" value. Preview values apply to every
non-`main` branch.

| Variable                         | Production                       | Preview                              |
| -------------------------------- | -------------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_ENVIRONMENT`        | `prod`                           | `dev`                                |
| `NEXT_PUBLIC_SITE_URL`           | `https://summit.pages.dev`       | `https://develop.summit.pages.dev`   |
| `NEXT_PUBLIC_SUPABASE_URL`       | `https://<prod-ref>.supabase.co` | `https://<dev-ref>.supabase.co`      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | (prod anon key)                  | (dev anon key)                       |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | (prod Turnstile site key)        | (dev Turnstile site key)             |
| `NEXT_PUBLIC_WORKER_ORIGIN`      | `https://api.summit.workers.dev` | `https://api-dev.summit.workers.dev` |

Google OAuth client is not a build-time env — it's configured inside
Supabase (Auth → Providers → Google), one client per Supabase project.
Redirect URIs on the Google console must list BOTH:

- `https://<prod-ref>.supabase.co/auth/v1/callback`
- `https://<dev-ref>.supabase.co/auth/v1/callback`

Turnstile secrets are Worker env, not Pages env (see
[config-layering.md](./config-layering.md)).

## Cloudflare Access on preview URLs

Access application in the CF dashboard:

- **Application type:** Self-hosted
- **Application domain:** `*.summit.pages.dev`
- **Bypass rule:** `summit.pages.dev` (exact match) — required so the
  production URL isn't behind Access. Order matters: bypass rule FIRST,
  then the block rule below.
- **Access policy — Preview auth**
  - Action: Allow
  - Include: Emails → `<Taj's email>`
  - Session duration: 24 hours
- Everything else → deny.

Result: Taj can open any preview URL after auth; a stranger who guesses
`https://feat-signup-flow.summit.pages.dev` gets a Cloudflare login page,
not the site.

## Promote pipeline

Branch protection on `main` (GitHub Settings → Branches → Add rule):

- Require pull requests before merging (approvals: 1 from Taj)
- Require status checks: `ci`, `redteam-audit`, `lighthouse-ci`
- Require branches up to date before merge
- Restrict who can push to `main`: nobody (all merges via PR)
- Do NOT allow force pushes
- Do NOT allow deletions

Typical flow:

```
git checkout develop
# work, commit, push
# → preview deploys to https://develop.summit.pages.dev
# → Taj reviews behind CF Access
# → open PR develop → main
# → CI + redteam + lighthouse must all pass
# → Taj approves + merges
# → production deploys to https://summit.pages.dev
```

`develop` is a long-lived branch; feature branches PR into `develop`
first, then `develop` PRs into `main` when a release is ready.

## robots + noindex on preview

Per-environment. The site emits:

```html
<!-- Only when NEXT_PUBLIC_ENVIRONMENT !== "prod" -->
<meta name="robots" content="noindex, nofollow, noarchive" />
```

Belt: `public/robots.txt` for `NEXT_PUBLIC_ENVIRONMENT=dev` is `User-agent: * / Disallow: /`.
Suspenders: Cloudflare Access itself blocks crawlers on the preview
domain regardless of `robots.txt` compliance.

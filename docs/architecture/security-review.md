# Security review — Summit MVP (as of 2026-10-04)

Red-team pass across every trust boundary in the current build. Each finding has: what the attack is, what blocks it today, what remains before launch.

## 1. Database layer (Supabase, both projects)

### Attack: anon JWT reads other users' profiles

- **Blocked by:** `profiles` has RLS `select` policy `using ((select auth.uid()) = id)`. An anon-key request without a JWT can't read anyone's profile. A valid JWT can read only its own row.
- **Verified:** security advisor returns 0 findings on both projects.
- **Residual risk:** Supabase JWT secret rotation isn't automated. Add to runbook before launch.

### Attack: forged profile.id via `UPDATE`

- **Blocked by:** `profiles_self_update` policy has BOTH `using` and `with check` clauses; column-level GRANT on `profiles` excludes `id` from the authenticated role's UPDATE grant. Two independent guards.
- **Residual risk:** none for this attack class.

### Attack: anon POST to `/rest/v1/contact_messages` to bypass Turnstile

- **Blocked by:** `REVOKE ALL ... FROM anon, authenticated` on `contact_messages` + explicit restrictive deny policy. Only `service_role` (Worker, with the server-side secret) can write. Turnstile verification happens in the Worker before the write.
- **Residual risk:** if the Worker's `SUPABASE_SERVICE_ROLE_KEY` leaks, attacker can bypass Turnstile. Mitigation: key stored only in Worker env via `wrangler secret put`, never in repo, never in logs; redteam-audit CI greps `out/` for the key prefix.

### Attack: `/rpc/handle_new_user` called directly by anon to spawn fake profiles

- **Blocked by:** `REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public`. Only `service_role` + the trigger's owner (`postgres`) can invoke it. Direct PostgREST call → 403.
- **Verified:** security advisor passes.

### Attack: `/rpc/has_accepted_current_legal` abused to probe other users

- **Blocked by:** switched to `SECURITY INVOKER` so it runs with the caller's permissions. Caller can only see their own `tos_acceptances` rows (RLS enforced). Function returns a boolean for the current user, never cross-user data.
- **Residual risk:** none.

### Attack: ToS version downgrade (user accepts v1, we publish v2, they want to stay on v1)

- **Blocked by:** `tos_acceptances` has no INSERT policy for `authenticated` → only `service_role` writes acceptance rows (via `/api/tos/accept` Worker that verifies the current `legal_text_id`). `legal_texts` rows are immutable (block-mutation triggers). User can't manufacture an acceptance of an old version from the client.
- **Residual risk:** none for this class.

### Attack: tamper with `legal_texts.full_text` to publish altered Terms

- **Blocked by:** INSERT trigger validates `text_hash = sha256(full_text)` via `extensions.digest`. UPDATE + DELETE triggers raise exceptions. Only INSERT is possible, with hash validation. Even service_role can't modify an existing row.
- **Residual risk:** publishing a new malicious `legal_texts` row with `is_current = true` still works via service_role. Mitigation: `/api/legal/publish` Worker requires a separate `ADMIN_API_TOKEN` (not the normal service_role key), compared in constant time. The admin token lives only on Taj's local machine for `curl` publish.

### Attack: audit log rewrite to erase evidence

- **Blocked by:** `audit_log` has UPDATE + DELETE triggers that raise exceptions. Append-only for everyone, including service_role.
- **Residual risk:** `TRUNCATE` as `postgres` superuser is still possible via the Supabase dashboard SQL editor. Mitigation: enable branch protection via a database webhook that flags TRUNCATE events (future).

## 2. Static site layer (Next.js export)

### Attack: service role key leaked into browser bundle

- **Blocked by:** only `NEXT_PUBLIC_*` env vars reach the bundle (Next.js enforces this at build time). Service role key is never named `NEXT_PUBLIC_*`. CI's `redteam-audit.yml` greps `out/` for the Supabase JWT shape (secret-pattern) and fails the build if hit.
- **Verified:** workflow is in place; needs to actually run against this project's PRs once CF is wired.

### Attack: ToS checkbox bypassed by crafting the OAuth request directly

- **Blocked by:** signup checkbox is enforced in the browser only (ToS acceptance state lives in React component state). An attacker could POST directly to Supabase's `signInWithOAuth` endpoint without checking.
- **Residual risk:** HIGH on current implementation. The ToS acceptance insert happens AFTER OAuth returns — if a user signs up via Google without the checkbox state being set, they can land on `/dashboard` without a `tos_acceptances` row.
- **Fix (not yet implemented):** add an interstitial `/auth/accept-terms` page shown by `AuthCallback` when `has_accepted_current_legal()` returns false, and gate dashboard RLS writes with `has_accepted_current_legal()` so a user who skipped acceptance can't WRITE anything until they accept. Reads are fine either way.

### Attack: open-redirect via `redirectTo` manipulation

- **Blocked by:** `redirectTo` is set from `siteConfig.url` (build-time constant), not from URL query params. User can't override.
- **Residual risk:** `/auth/callback` reads `code` from `window.location.search`. If an attacker gets a victim to click a crafted URL with a stolen `code`, Supabase will exchange it. But: codes are single-use and tied to the originating PKCE session (we enabled `flowType: "pkce"`), so a stolen code is useless to the attacker without the verifier.

### Attack: XSS via `legal_texts.full_text` rendering

- **Blocked by:** `<article>` renders content as text via `{doc.full_text}`, not `dangerouslySetInnerHTML`. React escapes by default. Markdown is not interpreted (shown as plain text — intentional, since legal text should be readable verbatim).
- **Residual risk:** none for current implementation. If we add markdown rendering later, use a sanitizer (`rehype-sanitize`).

### Attack: session fixation via `onAuthStateChange` subscription leak

- **Blocked by:** `SessionIndicator` cleans up subscription in effect cleanup. Session storage uses httpOnly cookies managed by Supabase SDK (not localStorage), so XSS can't steal the token.

## 3. Edge/Worker layer

### Attack: `/api/turnstile/verify` abuse to drain rate limits for other users

- **Blocked by:** rate limit keyed by `sha256(cf-connecting-ip || IP_HASH_SALT)`. An attacker only hurts their own IP's quota.
- **Residual risk:** attacker behind a shared NAT or VPN pool can hurt that pool's quota. Low practical impact for a static marketing site.

### Attack: Turnstile replay (reuse a verified token)

- **Blocked by:** single-use mark via `TOKEN_SEEN` KV with 5-minute TTL. Second attempt returns `token_replayed`.
- **Residual risk:** if KV namespace isn't bound (not yet deployed), replay guard is a no-op. The Worker fail-opens on no-KV so the function stays usable during initial setup; this must change before launch.
- **Fix needed before launch:** add a guard that refuses to start if `env.TOKEN_SEEN` is undefined when `ENVIRONMENT === "prod"`.

### Attack: service-role key echo in CF logs

- **Blocked by:** Worker logs event slugs only (`console.log("turnstile_rejected", { codes })`), never raw env or request body.
- **Verified by code review:** no `console.log(env)`, no `console.log(req)`, no `console.log(secret)`.

### Attack: CORS wildcard allows malicious origin

- **Blocked by:** `access-control-allow-origin` is set to the exact origin header value ONLY if it matches `env.ALLOWED_ORIGIN`, otherwise empty string. Preflight 403 on mismatch.

## 4. Deploy pipeline

### Attack: malicious PR merged to main deploys to prod

- **Blocked by:** branch protection on `main` requires 1 approval (Taj). CI must pass. No force-push, no deletion.
- **Residual risk:** compromised GitHub account could bypass. Mitigation: enforce 2FA on Taj's GitHub account (done); CF deploy only triggers from `main` push (not from a direct wrangler command without CF credentials).

### Attack: supply-chain compromise via npm dependency

- **Blocked by:** `redteam-audit.yml` runs `npm audit --audit-level=moderate` + `dependency-review` on every PR. Dependabot pushes updates weekly.
- **Residual risk:** zero-day in a popular dep (e.g. Next.js) between audit runs. Mitigation: pin lockfile (done), review Dependabot PRs manually.

### Attack: env-var leak via build logs

- **Blocked by:** `pre-build.mjs` logs only `branch` + the chosen environment name, never the actual values.
- **Residual risk:** CF build logs are visible in dashboard to anyone with Workers:Read on the account. All current values are `NEXT_PUBLIC_*` (safe to expose) so even a log leak is non-sensitive.

## 5. Pre-launch gates (what must happen before real users)

- [ ] Google OAuth client created, redirect URIs locked to both Supabase project callback URLs, client ID + secret pasted into both Supabase projects' auth config.
- [ ] Apple OAuth equivalent (needs paid Apple Developer account).
- [ ] Turnstile sites created + site keys added to Pages env + secret keys injected to Workers via `wrangler secret put`.
- [ ] `workers/turnstile-verify` deployed with KV bindings (TOKEN_SEEN + RATE_LIMIT).
- [ ] Cloudflare Access policy on `*.taj-website.workers.dev` with bypass for the bare prod URL.
- [ ] ToS acceptance INTERSTITIAL + RLS write-gate (fix for finding under § 2, "ToS checkbox bypass").
- [ ] `legal@`, `privacy@`, `support@` mailboxes live.
- [ ] California attorney review of `/legal/terms` + `/legal/privacy` text (Claude is diligent research, not legal counsel).
- [ ] Taj fills `site.config.ts` legalEntity.name with real registered entity + email domains.
- [ ] Re-run `scripts/publish-legal-texts.ps1` with real values.
- [ ] Branch-protection enforced on `main` (require PR + approval + green CI).

## Current security posture

**Database:** production-grade. Supabase advisor clean on both projects. Every attack class above is blocked by the current migrations.

**Static site:** production-ready except for the ToS-checkbox-bypass fix (needs the interstitial + RLS gate).

**Workers:** scaffold complete, not yet deployed. KV guard for prod needs adding before launch.

**Pipeline:** 4-tier branches live on GitHub. CF Workers Builds attempting deploy. Branch protection on `main` is still TODO (one GitHub setting).

Nothing in this review is a blocker for the current dev/stable/tester environments — those are owner-only via (planned) CF Access. The gate for inviting real users is the pre-launch checklist above.

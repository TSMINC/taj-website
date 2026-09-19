# Cloudflare Workers — API contract

Every Worker route lives under one Worker: `summit-api` (dev and prod
environments share code, differ only in bindings). Origin:
`https://api.summit.workers.dev` (prod), `https://api-dev.summit.workers.dev`
(dev). All routes are HTTPS-only, CORS-locked to the Pages origin for
that environment.

## Convention

- **Auth model:** every browser-facing route enforces its own auth.
  There is no "trusted origin" — a request from the correct origin with
  the wrong token is refused.
- **Turnstile:** any route the browser calls that produces a side effect
  requires a fresh (≤300 s), single-use Turnstile token in the request
  body. Verified against Cloudflare with the secret from Worker env.
- **Rate limiting:** per-IP token bucket in Cloudflare KV, keyed by
  `sha256(cf-connecting-ip || env.IP_HASH_SALT)`. Turnstile stops bots
  once; rate limit stops the same human/script replaying.
- **Service role:** `SUPABASE_SERVICE_ROLE_KEY` is bound to the Worker
  and used only in server-side inserts. Never logged. Never returned in
  a response. Never in `console.log(env)`.
- **Errors:** the Worker returns `{ok:false, code:"<slug>"}` with a
  generic message. Detailed diagnostics go to `console.log(...)` (which
  becomes CF logs). Nothing user-controlled is echoed back verbatim.

## Route table

| Method | Path                    | Who calls it       | Turnstile | Rate limit         | Auth              | Uses service role for                        |
| ------ | ----------------------- | ------------------ | --------- | ------------------ | ----------------- | -------------------------------------------- |
| POST   | `/api/turnstile/verify` | Browser (any page) | N/A       | 60/min/IP          | none              | none — pure Turnstile verify                 |
| POST   | `/api/contact`          | Browser (contact)  | required  | 3/hour/IP + 20/day | none              | INSERT into `contact_messages`               |
| POST   | `/api/tos/accept`       | Browser (member)   | required  | 5/hour/user        | Supabase JWT      | INSERT into `tos_acceptances`                |
| GET    | `/api/tos/current`      | Browser (any page) | N/A       | 60/min/IP          | none              | SELECT current `legal_texts` (public read)   |
| POST   | `/api/legal/publish`    | **Admin only**     | N/A       | none               | `ADMIN_API_TOKEN` | INSERT into `legal_texts`, flip `is_current` |
| POST   | `/api/account/delete`   | Browser (member)   | required  | 1/day/user         | Supabase JWT      | DELETE from `auth.users` cascade             |

**Internal-only** = not exposed at all in the CORS policy, and gated by a
constant-time comparison of `Authorization: Bearer <ADMIN_API_TOKEN>`.
The admin token lives only in Worker env; there is no UI for calling
`/api/legal/publish` — it's a `curl` from Taj's machine, tracked in
`docs/runbook/publish-legal-text.md`.

## Request / response shapes

### POST `/api/turnstile/verify`

```jsonc
// req
{ "token": "<turnstile response token>" }

// resp 200
{ "ok": true,  "ttl_seconds": 300 }
// resp 400
{ "ok": false, "code": "turnstile_invalid" }
```

The Worker POSTs the token to
`https://challenges.cloudflare.com/turnstile/v0/siteverify` with the
secret, checks `success && action === "expected"`, and returns.

### POST `/api/contact`

```jsonc
// req
{
  "turnstile_token": "<...>",
  "from_email":     "person@example.com",
  "subject":        "hi",
  "body":           "message"
}

// resp 200
{ "ok": true, "id": "<uuid>" }
// resp 4xx
{ "ok": false, "code": "turnstile_invalid" | "rate_limited" | "invalid_input" }
```

Server-side: verify Turnstile, check rate limit, validate shape
(`from_email` is a valid RFC 5322 address, `body` is 1–4000 chars),
INSERT via service role. Nothing echoes user input back.

### POST `/api/tos/accept`

```jsonc
// req headers: Authorization: Bearer <supabase jwt>
// req
{
  "turnstile_token":      "<...>",
  "tos_legal_text_id":    "<uuid>",
  "privacy_legal_text_id":"<uuid>"
}

// resp 200
{ "ok": true, "accepted_at": "2026-09-19T..." }
// resp 4xx
{ "ok": false, "code": "turnstile_invalid" | "stale_legal_text" | "unauth" }
```

Server-side: verify JWT with Supabase's JWKS, verify Turnstile,
verify both `legal_text_id`s are currently `is_current = true` (reject
otherwise — client is stale), compute
`ip_hash = sha256(cf-connecting-ip || IP_HASH_SALT)`, INSERT.

### GET `/api/tos/current`

```jsonc
// resp 200
{
  "tos": { "id": "<uuid>", "version": "2026-09-19", "effective_at": "..." },
  "privacy": { "id": "<uuid>", "version": "2026-09-19", "effective_at": "..." },
}
```

Cached at the edge (`Cache-Control: public, max-age=60`).

### POST `/api/legal/publish` (admin)

```jsonc
// req headers: Authorization: Bearer <ADMIN_API_TOKEN>
// req
{
  "kind":         "tos" | "privacy",
  "version":      "2026-09-19",
  "full_text":    "<full markdown or plain text>",
  "effective_at": "2026-09-19T00:00:00Z"
}

// resp 200: { "ok": true, "id": "<uuid>" }
```

Server-side: constant-time compare the bearer token, compute
`text_hash = sha256(full_text)`, INSERT (the DB trigger re-verifies the
hash), then `UPDATE legal_texts SET is_current = false WHERE kind = :kind AND is_current`
followed by `UPDATE legal_texts SET is_current = true WHERE id = :new_id`
inside one transaction.

## What the Worker never does

- Never echoes any part of `env` in a response or `console.log(env)`.
- Never returns the service role key, admin token, Turnstile secret,
  IP hash salt, or Supabase JWT in any response body or header.
- Never accepts a Turnstile token more than once (kept in a KV bloom
  filter with 5-min TTL).
- Never trusts the origin header for auth — only for CORS.

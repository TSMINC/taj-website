# Workers

Cloudflare Workers that provide the server-side pieces a static Next.js
export can't do on its own — Turnstile verification, contact-form intake,
ToS acceptance writes, legal-text publishing.

See [`docs/architecture/workers.md`](../docs/architecture/workers.md) for
the full API contract.

## One-time setup

```bash
# From repo root:
npx wrangler login
```

This opens a browser, you authenticate with Cloudflare, done.

## Per-worker setup

Each worker is its own package under `workers/<name>/`. From that
directory:

```bash
npm install                              # install @cloudflare/workers-types
wrangler kv namespace create TOKEN_SEEN  # creates KV, prints id
wrangler kv namespace create RATE_LIMIT  # creates KV, prints id
# Paste the ids into wrangler.toml under [[kv_namespaces]] for each env.

wrangler secret put TURNSTILE_SECRET_KEY --env dev
wrangler secret put IP_HASH_SALT         --env dev
# Repeat with --env production.

wrangler deploy --env dev        # publishes to summit-turnstile-verify-dev.<account>.workers.dev
wrangler deploy --env production # publishes to summit-turnstile-verify.<account>.workers.dev
```

## Secret conventions

| Secret                      | Where used                     | How to generate                                           |
| --------------------------- | ------------------------------ | --------------------------------------------------------- |
| `TURNSTILE_SECRET_KEY`      | siteverify API call            | Cloudflare dashboard → Turnstile → Site → copy secret key |
| `IP_HASH_SALT`              | ip_hash in rate limit + DB     | 32 random bytes: `openssl rand -hex 32`                   |
| `SUPABASE_SERVICE_ROLE_KEY` | Workers that write to Supabase | Supabase dashboard → Settings → API → service_role key    |
| `ADMIN_API_TOKEN`           | `/api/legal/publish` only      | 32 random bytes: `openssl rand -hex 32`                   |

**None of these ever appear in the repo, in CI logs, or in chat.**
Rotating a secret = `wrangler secret put NAME --env <env>` with the new
value; old value is overwritten.

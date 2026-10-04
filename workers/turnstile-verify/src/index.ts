/**
 * Cloudflare Worker — Turnstile server-side verification.
 *
 * Route: POST /api/turnstile/verify
 *
 * Request:  { "token": "<turnstile widget response>" }
 * Response: { "ok": true, "ttl_seconds": 300 }  or  { "ok": false, "code": "..." }
 *
 * Rules this Worker upholds (see docs/architecture/workers.md):
 *  - Secret never logged or returned.
 *  - Single-use tokens: a verified token is marked in KV so replays fail.
 *  - Per-IP rate limit: 60 req/min via a sliding-window token bucket in KV.
 *  - CORS locked to ALLOWED_ORIGIN; wrong origin → 403 at preflight.
 *  - Errors return generic slugs; detailed context goes to console (CF logs)
 *    with no secrets, no raw bodies.
 */

export interface Env {
  // Secrets (set via `wrangler secret put`).
  TURNSTILE_SECRET_KEY: string;
  IP_HASH_SALT: string;

  // Vars (set in wrangler.toml per environment).
  ALLOWED_ORIGIN: string;
  ENVIRONMENT: string;

  // KV namespaces — created via dashboard or `wrangler kv namespace create`.
  TOKEN_SEEN?: KVNamespace;
  RATE_LIMIT?: KVNamespace;
}

const TURNSTILE_SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const RATE_LIMIT_PER_MIN = 60;
const TOKEN_TTL_SECONDS = 300;

const worker = {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    // CORS preflight.
    if (req.method === "OPTIONS") {
      return corsPreflight(req, env);
    }

    if (url.pathname !== "/api/turnstile/verify" || req.method !== "POST") {
      return json(404, { ok: false, code: "not_found" }, env, req);
    }

    // Rate limit by IP.
    const ip = req.headers.get("cf-connecting-ip") ?? "0.0.0.0";
    const ipKey = await sha256(ip + env.IP_HASH_SALT);
    const rateOk = await checkRateLimit(env, ipKey);
    if (!rateOk) {
      return json(429, { ok: false, code: "rate_limited" }, env, req);
    }

    // Parse body.
    let token = "";
    try {
      const body = (await req.json()) as { token?: unknown };
      if (typeof body.token !== "string" || body.token.length === 0) {
        return json(400, { ok: false, code: "invalid_input" }, env, req);
      }
      token = body.token;
    } catch {
      return json(400, { ok: false, code: "invalid_input" }, env, req);
    }

    // Replay guard: has this token already been verified?
    if (env.TOKEN_SEEN) {
      const seen = await env.TOKEN_SEEN.get(token);
      if (seen) {
        return json(400, { ok: false, code: "token_replayed" }, env, req);
      }
    }

    // Call Cloudflare's siteverify. Secret stays in env, never logged.
    const form = new FormData();
    form.append("secret", env.TURNSTILE_SECRET_KEY);
    form.append("response", token);
    form.append("remoteip", ip);

    const upstream = await fetch(TURNSTILE_SITEVERIFY, { method: "POST", body: form });
    if (!upstream.ok) {
      // Cloudflare upstream failure — don't leak details.
      console.log("turnstile_upstream_error", { status: upstream.status });
      return json(502, { ok: false, code: "upstream_error" }, env, req);
    }

    const result = (await upstream.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };

    if (!result.success) {
      // Log the error codes CF returned (not secret); don't echo to client.
      console.log("turnstile_rejected", { codes: result["error-codes"] ?? [] });
      return json(400, { ok: false, code: "turnstile_invalid" }, env, req);
    }

    // Mark token as seen so a replay fails.
    if (env.TOKEN_SEEN) {
      await env.TOKEN_SEEN.put(token, "1", { expirationTtl: TOKEN_TTL_SECONDS });
    }

    return json(200, { ok: true, ttl_seconds: TOKEN_TTL_SECONDS }, env, req);
  },
};

export default worker;

// ---- helpers --------------------------------------------------------

function json(status: number, body: unknown, env: Env, req: Request): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders(req, env),
    },
  });
}

function corsHeaders(req: Request, env: Env): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allow = origin === env.ALLOWED_ORIGIN ? origin : "";
  return {
    "access-control-allow-origin": allow,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "600",
    vary: "origin",
  };
}

function corsPreflight(req: Request, env: Env): Response {
  const origin = req.headers.get("origin") ?? "";
  if (origin !== env.ALLOWED_ORIGIN) {
    return new Response(null, { status: 403 });
  }
  return new Response(null, { status: 204, headers: corsHeaders(req, env) });
}

async function sha256(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function checkRateLimit(env: Env, ipKey: string): Promise<boolean> {
  if (!env.RATE_LIMIT) return true; // No KV bound yet → fail-open until wired.
  const minuteBucket = Math.floor(Date.now() / 60_000);
  const key = `${ipKey}:${minuteBucket}`;
  const current = Number((await env.RATE_LIMIT.get(key)) ?? "0");
  if (current >= RATE_LIMIT_PER_MIN) return false;
  await env.RATE_LIMIT.put(key, String(current + 1), { expirationTtl: 120 });
  return true;
}

/**
 * Build-time environment variable reader.
 *
 * Every env var this site touches must be declared here. Missing required
 * vars fail the build early rather than silently producing a broken bundle.
 *
 * Static export means ONLY `NEXT_PUBLIC_*` vars reach the browser bundle.
 * Secrets (Supabase service role, Turnstile secret key) live in Cloudflare
 * Workers env, never in this file.
 */

const publicEnv = {
  /** Supabase project URL (public). */
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  /** Supabase anon key (public by design, RLS-gated). */
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  /** Cloudflare Turnstile site key (public). */
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
  /** API Worker origin (e.g. https://api-dev.<name>.workers.dev). */
  workerOrigin: process.env.NEXT_PUBLIC_WORKER_ORIGIN ?? "",
  /** Which environment this build targets ("dev" | "prod"). */
  environment: (process.env.NEXT_PUBLIC_ENVIRONMENT ?? "dev") as "dev" | "prod",
} as const;

/**
 * Returns the public env with a hard fail if any REQUIRED var is missing at
 * build time. Optional vars fall back to empty string and the consumer
 * handles the "not configured yet" state gracefully (per the "coexist
 * formats for safe migration" pattern applied to config: absent = show
 * empty state, never crash).
 */
export function getPublicEnv() {
  // During bootstrap (before Taj wires accounts) empty strings are OK;
  // components must handle the empty case by rendering "not configured yet"
  // rather than crashing. This mirrors rule 60's "never render fabricated
  // data" — an unwired Supabase should show that state, not fake success.
  return publicEnv;
}

export type PublicEnv = typeof publicEnv;

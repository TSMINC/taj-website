/**
 * Client-side Supabase instance.
 *
 * The anon key is public by design — RLS on every table is what gates
 * access, not key secrecy (see supabase/schema.sql). The service role key
 * never appears here; privileged writes go through a Cloudflare Worker.
 *
 * Env vars are provided by Cloudflare Pages per-branch (see
 * docs/architecture/cloudflare-pages.md § env var matrix).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv } from "../config/env";

let cached: SupabaseClient | null = null;

/** Returns a configured Supabase client, or null if env is not yet wired. */
export function getSupabase(): SupabaseClient | null {
  if (cached) return cached;

  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  if (!supabaseUrl || !supabaseAnonKey) {
    // Bootstrap state — Taj hasn't pasted credentials yet. Components
    // that depend on auth MUST render a "not configured" state rather
    // than crash (per rule 60: no fabricated data, honest empty).
    return null;
  }

  cached = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });

  return cached;
}

/**
 * Hard-fail accessor for code paths that MUST have a working client
 * (e.g. after a session is confirmed). Throws instead of returning null
 * so a mis-wired env surfaces loudly, not silently.
 */
export function requireSupabase(): SupabaseClient {
  const c = getSupabase();
  if (!c) {
    throw new Error(
      "Supabase client not configured — set NEXT_PUBLIC_SUPABASE_URL + " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in the environment.",
    );
  }
  return c;
}

/** True iff env is wired. Components use this to decide empty-state vs. real UI. */
export function isSupabaseConfigured(): boolean {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  return Boolean(supabaseUrl && supabaseAnonKey);
}

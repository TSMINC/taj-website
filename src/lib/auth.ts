/**
 * Auth helpers — one surface for Google, Apple, and Email sign-in.
 *
 * All flows go through Supabase Auth. Google + Apple = OAuth redirects.
 * Email = magic link (no password; one less thing to leak).
 *
 * Caller must check `isSupabaseConfigured()` before invoking — these
 * functions throw if the client isn't wired.
 */

import { requireSupabase, isSupabaseConfigured } from "./supabase-client";
import { siteConfig } from "../config/site.config";

export { isSupabaseConfigured };

export type Provider = "google" | "apple" | "email";

/** OAuth sign-in (Google or Apple). Redirects browser away. */
export async function signInWithOAuth(provider: "google" | "apple"): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${siteConfig.url}/auth/callback`,
      queryParams: provider === "google" ? { access_type: "offline", prompt: "consent" } : {},
    },
  });
  if (error) throw error;
}

/** Email magic-link sign-in. Returns when the email is queued at Supabase. */
export async function signInWithEmail(email: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteConfig.url}/auth/callback`,
      shouldCreateUser: true,
    },
  });
  if (error) throw error;
}

/** Sign out — clears local session. */
export async function signOut(): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.auth.signOut();
  if (error) throw error;
}

/** Current session (null if signed out). */
export async function getSession() {
  const sb = requireSupabase();
  const { data, error } = await sb.auth.getSession();
  if (error) throw error;
  return data.session;
}

/** React to auth state changes (sign in / sign out / token refresh). */
export function onAuthStateChange(cb: (event: string, session: unknown) => void) {
  const sb = requireSupabase();
  return sb.auth.onAuthStateChange(cb);
}

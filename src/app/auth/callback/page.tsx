"use client";

/**
 * Magic-link + confirm-signup callback.
 *
 * We use IMPLICIT flow (see supabase-client.ts). Supabase redirects users
 * here with `#access_token=...&refresh_token=...` in the URL hash. The
 * Supabase client's `detectSessionInUrl: true` option automatically parses
 * that hash and persists the session; we just need to wait for it, then
 * route to /dashboard.
 *
 * We do NOT call exchangeCodeForSession — that's for PKCE flow, which we
 * don't use (PKCE breaks cross-device magic links).
 */

import { useEffect, useState } from "react";
import { requireSupabase, isSupabaseConfigured } from "../../../lib/supabase-client";

function parseHash(hash: string): Record<string, string> {
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  const out: Record<string, string> = {};
  for (const kv of h.split("&")) {
    if (!kv) continue;
    const eq = kv.indexOf("=");
    const k = eq === -1 ? kv : kv.slice(0, eq);
    const v = eq === -1 ? "" : kv.slice(eq + 1);
    out[decodeURIComponent(k)] = decodeURIComponent(v);
  }
  return out;
}

/**
 * Compute the initial error (if any) at mount time. Runs once on the client
 * via useState's lazy initializer, which avoids the React 19
 * `set-state-in-effect` lint rule that would fire if we read window.location
 * inside useEffect and called setErr.
 */
function initialError(configured: boolean): string | null {
  if (!configured) return "Sign-in not configured in this environment.";
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search);
  const h = parseHash(window.location.hash);
  return h.error_description || h.error || q.get("error_description") || q.get("error") || null;
}

export default function AuthCallback() {
  const [configured] = useState<boolean>(() => isSupabaseConfigured());
  const [err, setErr] = useState<string | null>(() => initialError(configured));

  useEffect(() => {
    if (!configured) return;
    if (err) return; // Already have an error from the URL — nothing to do.

    const sb = requireSupabase();

    // Fast path: the client may have already parsed the hash by the time we
    // mount (detectSessionInUrl runs synchronously-ish on load).
    sb.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.replace("/dashboard");
      }
    });

    // Normal path: wait for the SIGNED_IN event. Covers both the "already
    // signed in from an earlier tab" case and the "just parsed the hash" case.
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        window.location.replace("/dashboard");
      }
    });

    // Safety timeout — if nothing fires in 8s, surface a visible error so
    // the user isn't stuck on a "Signing you in…" spinner forever.
    const t = window.setTimeout(() => {
      sb.auth.getSession().then(({ data }) => {
        if (!data.session) {
          setErr(
            "Sign-in didn't complete. The link may have expired, or your " +
              "Supabase project's Site URL may not match this page's origin.",
          );
        }
      });
    }, 8000);

    return () => {
      sub.subscription.unsubscribe();
      window.clearTimeout(t);
    };
  }, [configured]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center px-6 py-16 text-center">
      {err ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
          <p className="font-medium">Could not sign you in</p>
          <p className="mt-2 opacity-90">{err}</p>
          <a
            href="/login"
            className="mt-4 inline-block text-xs text-white underline hover:no-underline"
          >
            Back to sign in
          </a>
        </div>
      ) : (
        <div className="text-sm text-zinc-400">Signing you in…</div>
      )}
    </main>
  );
}

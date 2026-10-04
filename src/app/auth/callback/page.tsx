"use client";

/**
 * OAuth + magic-link callback handler.
 *
 * Supabase redirects here with `?code=...` after a successful sign-in.
 * We call exchangeCodeForSession, then route to /dashboard on success,
 * back to /login with an error on failure.
 */

import { useEffect, useState } from "react";
import { requireSupabase, isSupabaseConfigured } from "../../../lib/supabase-client";

export default function AuthCallback() {
  const [configured] = useState<boolean>(() => isSupabaseConfigured());
  const [err, setErr] = useState<string | null>(
    configured ? null : "Sign-in not configured in this environment.",
  );

  useEffect(() => {
    if (!configured) return;
    const run = async () => {
      const sb = requireSupabase();
      const code = new URLSearchParams(window.location.search).get("code");
      if (!code) {
        setErr("Missing sign-in code — did you follow a direct link?");
        return;
      }
      try {
        const { error } = await sb.auth.exchangeCodeForSession(code);
        if (error) {
          setErr(error.message);
          return;
        }
        window.location.replace("/dashboard");
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Sign-in failed.");
      }
    };
    void run();
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

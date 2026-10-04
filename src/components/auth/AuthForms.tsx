"use client";

/**
 * Shared sign-in/sign-up form. Same component for both routes — only
 * difference is the headline copy and whether the ToS checkbox is required.
 *
 * Supports: Email magic link only. Google OAuth is wired in src/lib/auth.ts
 * but intentionally not exposed in the UI yet — flip to true when Taj
 * creates the Google OAuth client and configures Supabase.
 */

import { useState } from "react";
import { signInWithEmail, isSupabaseConfigured } from "../../lib/auth";
import { siteConfig } from "../../config/site.config";

type Mode = "signin" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState("");
  const [tosAccepted, setTosAccepted] = useState(mode === "signin");
  const [sending, setSending] = useState<null | "email">(null);
  const [emailSent, setEmailSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const configured = isSupabaseConfigured();
  const canSubmit = tosAccepted && !sending && configured;

  async function doEmail(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!tosAccepted) {
      setErr("You must accept the Terms of Service and Privacy Policy.");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("Enter a valid email address.");
      return;
    }
    try {
      setSending("email");
      await signInWithEmail(email);
      setEmailSent(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Email sign-in failed.");
    } finally {
      setSending(null);
    }
  }

  if (!configured) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
        Sign-in is not configured in this environment yet. Set
        <code className="mx-1 rounded bg-amber-500/20 px-1">NEXT_PUBLIC_SUPABASE_URL</code>
        and
        <code className="mx-1 rounded bg-amber-500/20 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
        in Cloudflare Pages env vars, then redeploy.
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
        <p className="font-medium">Check your email.</p>
        <p className="mt-1 opacity-90">
          A sign-in link was sent to <span className="font-mono">{email}</span>. The link expires in
          1 hour.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={doEmail} className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-zinc-400">Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending === "email" ? "Sending link…" : "Continue"}
        </button>
      </form>

      {mode === "signup" && (
        <label className="flex items-start gap-2.5 pt-1 text-xs text-zinc-400">
          <input
            type="checkbox"
            checked={tosAccepted}
            onChange={(e) => setTosAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5"
          />
          <span>
            I agree to the{" "}
            <a href="/legal/terms" className="underline hover:text-white">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/legal/privacy" className="underline hover:text-white">
              Privacy Policy
            </a>
            . I confirm I am at least {18} years old and bound to the laws of the State of
            California for any dispute with {siteConfig.name}.
          </span>
        </label>
      )}

      {err && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
          {err}
        </div>
      )}
    </div>
  );
}

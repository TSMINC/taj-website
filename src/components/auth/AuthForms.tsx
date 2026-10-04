"use client";

/**
 * Shared sign-in/sign-up form. Same component for both routes — only
 * difference is the headline copy and whether the ToS checkbox is required.
 *
 * Supports: Google OAuth, Apple OAuth, Email magic link.
 */

import { useState } from "react";
import { signInWithOAuth, signInWithEmail, isSupabaseConfigured } from "../../lib/auth";
import { siteConfig } from "../../config/site.config";

type Mode = "signin" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState("");
  const [tosAccepted, setTosAccepted] = useState(mode === "signin");
  const [sending, setSending] = useState<null | "google" | "apple" | "email">(null);
  const [emailSent, setEmailSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const configured = isSupabaseConfigured();
  const canSubmit = tosAccepted && !sending && configured;

  async function doOAuth(provider: "google" | "apple") {
    setErr(null);
    if (!tosAccepted) {
      setErr("You must accept the Terms of Service and Privacy Policy.");
      return;
    }
    try {
      setSending(provider);
      await signInWithOAuth(provider);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-in failed.");
      setSending(null);
    }
  }

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
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => doOAuth("google")}
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GoogleIcon />
          <span>{sending === "google" ? "Redirecting…" : `Continue with Google`}</span>
        </button>

        <button
          type="button"
          onClick={() => doOAuth("apple")}
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <AppleIcon />
          <span>{sending === "apple" ? "Redirecting…" : `Continue with Apple`}</span>
        </button>
      </div>

      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <div className="h-px flex-1 bg-white/10" />
        or
        <div className="h-px flex-1 bg-white/10" />
      </div>

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
          {sending === "email" ? "Sending link…" : "Continue with Email"}
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

function GoogleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width="18" height="18">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4-5.5 4-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.9 1.5L18.8 5C17 3.3 14.7 2.3 12 2.3 6.5 2.3 2 6.8 2 12.3S6.5 22.3 12 22.3c6.9 0 11.5-4.9 11.5-11.7 0-.8-.1-1.4-.2-2H12z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M19.665 15.72c-.03-3.064 2.502-4.534 2.615-4.606-1.428-2.088-3.65-2.374-4.439-2.407-1.891-.189-3.69 1.112-4.651 1.112-.96 0-2.44-1.084-4.013-1.054-2.066.03-3.973 1.203-5.03 3.055-2.144 3.72-.55 9.233 1.544 12.252 1.025 1.479 2.247 3.138 3.84 3.08 1.542-.064 2.123-.998 3.983-.998 1.86 0 2.388.998 4.016.967 1.658-.03 2.709-1.505 3.72-2.991 1.173-1.718 1.657-3.383 1.686-3.47-.037-.014-3.235-1.242-3.271-4.94zm-3.06-9.079c.843-1.025 1.411-2.447 1.258-3.87-1.218.05-2.69.812-3.559 1.835-.779.908-1.46 2.355-1.273 3.75 1.356.105 2.728-.69 3.574-1.715z" />
    </svg>
  );
}

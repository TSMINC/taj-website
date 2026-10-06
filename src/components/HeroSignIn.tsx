"use client";

/**
 * Hero-embedded sign-in. One form, email magic link only. Mounts on the
 * landing page as the primary CTA. For the full signup/signin pages
 * (with the ToS checkbox gating) see src/app/signup + src/app/login.
 */

import { useState } from "react";
import { signInWithEmail, isSupabaseConfigured } from "../lib/auth";

export function HeroSignIn() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("Enter a valid email address.");
      return;
    }
    try {
      setSending(true);
      await signInWithEmail(email);
      setSent(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      setSending(false);
    }
  }

  if (!configured) {
    return (
      <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs text-white/70 backdrop-blur-md">
        Sign-in isn&rsquo;t wired in this environment. Set your Supabase env vars in the deploy
        host, then redeploy.
      </div>
    );
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 backdrop-blur-md">
        <p className="font-medium">Check your email.</p>
        <p className="mt-1 text-emerald-200/90">
          A sign-in link was sent to <span className="font-mono">{email}</span>. The link expires in
          1 hour.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 backdrop-blur-md focus:border-white/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#1a0a30] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? "Sending…" : "Continue"}
        </button>
      </div>
      <p className="text-[11px] leading-relaxed text-white/50">
        By continuing you agree to the{" "}
        <a href="/legal/terms" className="underline underline-offset-2 hover:text-white/80">
          Terms
        </a>{" "}
        and{" "}
        <a href="/legal/privacy" className="underline underline-offset-2 hover:text-white/80">
          Privacy Policy
        </a>
        . Governed by California law. 18+ only.
      </p>
      {err && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {err}
        </div>
      )}
    </form>
  );
}

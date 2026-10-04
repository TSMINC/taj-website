"use client";

/**
 * Nav affordance: shows "Sign in" when signed out, email + sign-out when
 * signed in. Reactively updates on auth state change.
 */

import { useEffect, useState } from "react";
import { getSession, onAuthStateChange, signOut, isSupabaseConfigured } from "../../lib/auth";

type Session = { user: { email?: string } } | null;

function SignedOutButtons() {
  return (
    <div className="flex items-center gap-3">
      <a href="/login" className="text-sm text-zinc-300 hover:text-white">
        Sign in
      </a>
      <a
        href="/signup"
        className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-zinc-200"
      >
        Sign up
      </a>
    </div>
  );
}

export function SessionIndicator() {
  // Compute env wiring once per mount — determined pre-render, not inside an effect.
  const [configured] = useState<boolean>(() => isSupabaseConfigured());
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState<boolean>(configured);

  useEffect(() => {
    if (!configured) return;
    let active = true;
    getSession()
      .then((s) => {
        if (active) {
          setSession(s as Session);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    const sub = onAuthStateChange((_event, s) => {
      setSession(s as Session);
    });
    return () => {
      active = false;
      sub.data.subscription.unsubscribe();
    };
  }, [configured]);

  if (!configured) return <SignedOutButtons />;
  if (loading) return <span className="text-xs text-zinc-500">…</span>;
  if (!session) return <SignedOutButtons />;

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-xs text-zinc-400 sm:inline">{session.user?.email}</span>
      <a href="/dashboard" className="text-sm text-zinc-300 hover:text-white">
        Dashboard
      </a>
      <button onClick={() => void signOut()} className="text-sm text-zinc-500 hover:text-zinc-300">
        Sign out
      </button>
    </div>
  );
}

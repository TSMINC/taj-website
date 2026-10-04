"use client";

import { useEffect, useState } from "react";
import { getSession, signOut, isSupabaseConfigured } from "../../lib/auth";
import { siteConfig } from "../../config/site.config";

type User = { email?: string; id?: string } | null;

export default function Dashboard() {
  const [configured] = useState<boolean>(() => isSupabaseConfigured());
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState<boolean>(configured);

  useEffect(() => {
    if (!configured) return;
    getSession()
      .then((s) => {
        if (!s) {
          window.location.replace("/login");
          return;
        }
        setUser(s.user as User);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [configured]);

  if (!configured) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          Dashboard needs sign-in configured. Set Supabase env vars in Cloudflare Pages.
        </div>
      </main>
    );
  }

  if (loading) {
    return <main className="mx-auto max-w-4xl px-6 py-16 text-sm text-zinc-500">Loading…</main>;
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Welcome back</h1>
        <p className="mt-1.5 text-sm text-zinc-400">{user?.email}</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-sm text-zinc-300">
          Your account is active. More features are landing here as {siteConfig.shortName} grows.
        </p>
        <button
          onClick={() => void signOut().then(() => window.location.replace("/"))}
          className="mt-4 text-xs text-zinc-500 underline hover:text-zinc-300"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}

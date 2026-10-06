"use client";

import { useEffect, useState } from "react";
import { getSession, signOut, isSupabaseConfigured } from "../../lib/auth";
import { siteConfig } from "../../config/site.config";
import { ProfileEditor } from "../../components/dashboard/ProfileEditor";
import { ToSStatus } from "../../components/dashboard/ToSStatus";
import { DeleteAccount } from "../../components/dashboard/DeleteAccount";

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
      <main className="mx-auto max-w-4xl px-6 pt-24 pb-16">
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          Dashboard needs sign-in configured. Set Supabase env vars in Cloudflare Pages.
        </div>
      </main>
    );
  }

  if (loading || !user?.id) {
    return (
      <main className="mx-auto max-w-4xl px-6 pt-24 pb-16 text-sm text-white/50">Loading…</main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pt-24 pb-16">
      <div>
        <p className="text-xs font-semibold tracking-[0.3em] text-white/60 uppercase">Dashboard</p>
        <h1 className="mt-3 text-3xl font-light tracking-tight text-white sm:text-4xl">
          Welcome <span className="font-semibold">back</span>
        </h1>
        <p className="mt-1 text-sm text-white/55">{user.email}</p>
      </div>

      {/* ToS re-acceptance banner (only renders when stale) */}
      <div className="mt-8">
        <ToSStatus />
      </div>

      {/* Profile */}
      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:p-7">
        <h2 className="text-lg font-semibold text-white">Profile</h2>
        <p className="mt-1 text-xs text-white/55">Public to you only. Edit at any time.</p>
        <div className="mt-5">
          <ProfileEditor userId={user.id} />
        </div>
      </section>

      {/* Account meta */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:p-7">
        <h2 className="text-lg font-semibold text-white">Account</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex gap-3">
            <dt className="w-32 text-white/50">Email</dt>
            <dd className="font-mono text-white/85">{user.email}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-32 text-white/50">User ID</dt>
            <dd className="truncate font-mono text-xs text-white/50">{user.id}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/10 pt-5">
          <button
            onClick={() => void signOut().then(() => window.location.replace("/"))}
            className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/10"
          >
            Sign out
          </button>
          <DeleteAccount email={user.email ?? ""} />
        </div>
      </section>

      {/* Helpful links */}
      <section className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/55">
        <a href="/services" className="hover:text-white">
          Services
        </a>
        <a href="/pricing" className="hover:text-white">
          Pricing
        </a>
        <a href="/faq" className="hover:text-white">
          FAQ
        </a>
        <a href="/legal/terms" className="hover:text-white">
          Terms
        </a>
        <a href="/legal/privacy" className="hover:text-white">
          Privacy
        </a>
        <a href={`mailto:${siteConfig.email.support}`} className="hover:text-white">
          Support
        </a>
      </section>
    </main>
  );
}

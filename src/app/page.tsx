import { siteConfig } from "../config/site.config";

export default function Home() {
  return (
    <main className="relative mx-auto max-w-6xl px-6 py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/10 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-6xl">
          {siteConfig.name}
        </h1>
        <p className="mt-6 text-base text-balance text-zinc-400 sm:text-lg">
          {siteConfig.tagline || "A better way to build what you’re building."}
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <a
            href="/signup"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            Get started
          </a>
          <a
            href="/login"
            className="rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Sign in
          </a>
        </div>
      </div>
    </main>
  );
}

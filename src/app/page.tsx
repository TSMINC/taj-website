import type { Metadata } from "next";
import { siteConfig } from "../config/site.config";
import { HeroSignIn } from "../components/HeroSignIn";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
};

export default function Home() {
  return (
    <main className="relative flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden px-6 pt-16 sm:px-12 lg:px-20">
      <div className="flex flex-1 items-center">
        <div className="w-full max-w-xl">
          <h1 className="text-4xl leading-[1.05] font-light tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
            Welcome to <br />
            <span className="font-semibold">{siteConfig.name}</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-balance text-white/70 sm:text-base">
            {siteConfig.tagline} Sign in with your email to join the network.
          </p>
          <div className="mt-10 max-w-sm">
            <HeroSignIn />
          </div>
        </div>
      </div>

      <div className="pb-6 text-xs text-white/40 sm:pb-8">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </main>
  );
}

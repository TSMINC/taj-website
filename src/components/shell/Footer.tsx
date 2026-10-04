import { siteConfig } from "../../config/site.config";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-black/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <div>
          © {new Date().getFullYear()} {siteConfig.legalEntity.name}. All rights reserved.
        </div>
        <div className="flex gap-5">
          <a href="/legal/terms" className="hover:text-zinc-300">
            Terms
          </a>
          <a href="/legal/privacy" className="hover:text-zinc-300">
            Privacy
          </a>
          <a href="mailto:${siteConfig.email.support}" className="hover:text-zinc-300">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

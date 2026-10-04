import Link from "next/link";
import { siteConfig } from "../../config/site.config";
import { SessionIndicator } from "../auth/SessionIndicator";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/40 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-sm font-semibold tracking-tight text-white">
          {siteConfig.shortName}
        </Link>
        <SessionIndicator />
      </nav>
    </header>
  );
}

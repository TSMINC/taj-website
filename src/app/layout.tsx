import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Raleway } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { siteConfig } from "../config/site.config";
import { getPublicEnv } from "../config/env";
import { PlexusBackground } from "../components/PlexusBackground";
import { SessionIndicator } from "../components/auth/SessionIndicator";
import { CfAnalytics } from "../components/CfAnalytics";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
});

const { environment } = getPublicEnv();
const indexable = environment === "prod";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  robots: indexable
    ? { index: true, follow: true }
    : { index: false, follow: false, noarchive: true, nosnippet: true },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${raleway.variable} dark h-full antialiased`}>
      <body className="relative flex min-h-full flex-col [font-family:var(--font-raleway),ui-sans-serif,system-ui,sans-serif] text-white">
        <PlexusBackground />
        <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-4 px-6 py-5 sm:px-12 lg:px-20">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-semibold tracking-[0.35em] text-white/85 uppercase transition hover:text-white sm:text-base"
            >
              {siteConfig.shortName}
            </Link>
            <nav className="hidden items-center gap-6 sm:flex">
              <Link
                href="/services"
                className="text-xs font-medium tracking-wider text-white/65 uppercase transition hover:text-white"
              >
                Services
              </Link>
              <Link
                href="/pricing"
                className="text-xs font-medium tracking-wider text-white/65 uppercase transition hover:text-white"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="text-xs font-medium tracking-wider text-white/65 uppercase transition hover:text-white"
              >
                About
              </Link>
              <Link
                href="/faq"
                className="text-xs font-medium tracking-wider text-white/65 uppercase transition hover:text-white"
              >
                FAQ
              </Link>
            </nav>
          </div>
          <SessionIndicator />
        </header>
        <div className="relative z-10 flex-1">{children}</div>
        <CfAnalytics />
      </body>
    </html>
  );
}

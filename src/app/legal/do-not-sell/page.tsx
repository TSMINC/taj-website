import type { Metadata } from "next";
import { siteConfig } from "../../../config/site.config";

export const metadata: Metadata = {
  title: `Do Not Sell or Share — ${siteConfig.name}`,
  description: `${siteConfig.name}'s "Do Not Sell or Share My Personal Information" disclosure (CCPA/CPRA).`,
  robots: { index: true, follow: true },
};

export default function DoNotSellPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-24 pb-16">
      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Do Not Sell or Share My Personal Information
      </h1>
      <p className="mt-2 text-sm text-white/55">California Consumer Privacy Act (CCPA/CPRA)</p>

      <section className="mt-10 space-y-6 text-sm leading-relaxed text-white/80 sm:text-base">
        <p>
          {siteConfig.name} <strong>does not sell</strong> personal information and does not share
          personal information for cross-context behavioral advertising, as those terms are defined
          under the California Consumer Privacy Act (CCPA) as amended by the California Privacy
          Rights Act (CPRA).
        </p>
        <p>
          Because we do not sell or share, there is no &ldquo;opt out&rdquo; mechanism required of
          us — there is nothing to opt out of. This page exists to disclose that fact plainly, as
          required by Cal. Civ. Code § 1798.135.
        </p>

        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
          <h2 className="text-base font-semibold text-white">What we do with personal info</h2>
          <p className="mt-2 text-sm text-white/75">
            We use personal information only to operate the service you signed up for — account
            creation, authentication, abuse prevention, and billing when applicable. Full details
            are in our{" "}
            <a href="/legal/privacy" className="underline underline-offset-2 hover:text-white">
              Privacy Policy
            </a>
            .
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
          <h2 className="text-base font-semibold text-white">If this ever changes</h2>
          <p className="mt-2 text-sm text-white/75">
            If {siteConfig.name} ever begins selling or sharing personal information, this page will
            be updated with the required opt-out mechanism before any such selling or sharing
            begins. We will also notify existing account holders by email.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
          <h2 className="text-base font-semibold text-white">Exercise your rights</h2>
          <p className="mt-2 text-sm text-white/75">
            To exercise your CCPA/CPRA rights (right to know, delete, correct, limit sensitive info
            use, or non-discrimination), use the{" "}
            <a
              href="/legal/rights-request"
              className="underline underline-offset-2 hover:text-white"
            >
              Rights Request
            </a>{" "}
            page or email{" "}
            <a
              href={`mailto:${siteConfig.email.privacy}`}
              className="font-mono underline underline-offset-2 hover:text-white"
            >
              {siteConfig.email.privacy}
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}

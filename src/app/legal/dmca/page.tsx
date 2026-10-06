import type { Metadata } from "next";
import { siteConfig } from "../../../config/site.config";

export const metadata: Metadata = {
  title: `DMCA — ${siteConfig.name}`,
  description: `${siteConfig.name} DMCA designated agent + takedown procedure.`,
  robots: { index: true, follow: true },
};

export default function DmcaPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-24 pb-16">
      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        DMCA Takedown Procedure
      </h1>
      <p className="mt-2 text-sm text-white/55">17 U.S.C. § 512(c) · Designated agent on file</p>

      <section className="mt-10 space-y-6 text-sm leading-relaxed text-white/80 sm:text-base">
        <p>
          {siteConfig.name} respects the intellectual-property rights of others. If you believe
          content accessible through our service infringes your copyright, send a DMCA takedown
          notice to our designated agent below.
        </p>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
          <h2 className="text-base font-semibold text-white">Designated agent</h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex gap-3">
              <dt className="w-24 text-white/55">Email</dt>
              <dd>
                <a
                  href={`mailto:${siteConfig.email.legal}`}
                  className="font-mono underline underline-offset-2 hover:text-white"
                >
                  {siteConfig.email.legal}
                </a>
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-24 text-white/55">Subject</dt>
              <dd className="font-mono text-white/85">DMCA Takedown Notice</dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">What to include</h2>
          <p className="mt-2">A valid DMCA notice must include all of the following:</p>
          <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm text-white/75">
            <li>Physical or electronic signature of the copyright owner or authorized agent.</li>
            <li>
              Identification of the copyrighted work you claim has been infringed (or a
              representative list if multiple).
            </li>
            <li>
              Identification of the material you claim is infringing, with enough detail for us to
              find it (specific URL(s), screenshots).
            </li>
            <li>Your contact information (name, address, phone, email).</li>
            <li>
              A statement that you have a good-faith belief that the use is not authorized by the
              copyright owner, its agent, or the law.
            </li>
            <li>
              A statement, under penalty of perjury, that the information in your notice is accurate
              and that you are the copyright owner or authorized to act on behalf of the owner.
            </li>
          </ol>
        </div>

        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-5 text-sm text-amber-100/80 backdrop-blur-md">
          <strong className="text-amber-100">Note.</strong> Materially misrepresenting infringement
          in a DMCA notice can expose you to liability for damages under 17 U.S.C. § 512(f).
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">Counter-notices</h2>
          <p className="mt-2">
            If content you posted was removed and you believe this was in error, you may submit a
            counter-notice to the same email address, following the requirements of 17 U.S.C. §
            512(g)(3).
          </p>
        </div>
      </section>
    </main>
  );
}

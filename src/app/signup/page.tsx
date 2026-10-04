import type { Metadata } from "next";
import { AuthForm } from "../../components/auth/AuthForms";
import { siteConfig } from "../../config/site.config";

export const metadata: Metadata = {
  title: `Sign up — ${siteConfig.name}`,
  description: `Create a ${siteConfig.name} account with Google, Apple, or email.`,
  robots: { index: true, follow: true },
};

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Create your account</h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Already have one?{" "}
            <a href="/login" className="text-white underline hover:no-underline">
              Sign in
            </a>
          </p>
        </div>
        <AuthForm mode="signup" />
      </div>
    </main>
  );
}

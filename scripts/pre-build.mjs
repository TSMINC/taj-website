#!/usr/bin/env node
/**
 * Pre-build hook: writes .env.production based on which branch is building.
 *
 * Why this exists: Cloudflare's build system runs `wrangler deploy`, which
 * in turn runs the `[build]` command from wrangler.toml. We can't set
 * NEXT_PUBLIC_* env vars via the dashboard without Taj clicking there, so
 * we inject them from this script at build time. The values are all
 * `NEXT_PUBLIC_*` — public by Next.js convention and public by design for
 * Supabase anon keys (RLS gates access, not key secrecy). Nothing here is
 * a secret.
 *
 * Branch detection:
 *   WORKERS_CI_BRANCH is set by Cloudflare Workers Builds.
 *   CF_PAGES_BRANCH   is set by the older Cloudflare Pages flow.
 *   GITHUB_HEAD_REF   is set by GitHub Actions on a PR.
 *   Local dev falls back to "main".
 */

import { writeFileSync } from "node:fs";

const branch =
  process.env.WORKERS_CI_BRANCH ||
  process.env.CF_PAGES_BRANCH ||
  process.env.GITHUB_HEAD_REF ||
  process.env.GITHUB_REF_NAME ||
  "main";

const isProd = branch === "main";

const prod = {
  NEXT_PUBLIC_ENVIRONMENT: "prod",
  NEXT_PUBLIC_SITE_URL: "https://taj-website.taj-website.workers.dev",
  NEXT_PUBLIC_SUPABASE_URL: "https://nuyjjdbtfoaagfsjtkev.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eWpqZGJ0Zm9hYWdmc2p0a2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwNjY1MzEsImV4cCI6MjEwNjY0MjUzMX0.JFQuQS4PfMkxG5MIpIeGcbrJr46xlohS1WxtlvaNtu0",
  // Turnstile + Worker origin filled when those are wired.
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
  NEXT_PUBLIC_WORKER_ORIGIN: "",
};

const preview = {
  NEXT_PUBLIC_ENVIRONMENT: "dev",
  NEXT_PUBLIC_SITE_URL: `https://${branch}.taj-website.workers.dev`,
  NEXT_PUBLIC_SUPABASE_URL: "https://oogxfjfciimzdalsjzxt.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZ3hmamZjaWltemRhbHNqenh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwNjY0MDMsImV4cCI6MjEwNjY0MjQwM30.o8NZORolfliWnl5xzgz8QHPTGNyIPmnfPGeIGsLiAzk",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
  NEXT_PUBLIC_WORKER_ORIGIN: "",
};

const chosen = isProd ? prod : preview;

const body = Object.entries(chosen)
  .map(([k, v]) => `${k}=${v}`)
  .join("\n");

writeFileSync(".env.production", body + "\n");
console.log(`pre-build: branch="${branch}" -> env="${chosen.NEXT_PUBLIC_ENVIRONMENT}"`);

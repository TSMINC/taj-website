#!/usr/bin/env node
/**
 * Fails CI if any file outside src/config/ hardcodes the current site
 * name or short name, or the legacy "taj-website" placeholder.
 *
 * The "fast name switcher" (docs/summit-mvp-architecture.md §4) only
 * works if every user-facing string sources from siteConfig — this
 * script is the enforcement.
 *
 * Run: node scripts/check-hardcoded-name.mjs
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

// Read the config file to get the current name(s) — never hardcode them here.
const configSrc = readFileSync(join(ROOT, "src/config/site.config.ts"), "utf8");
const nameMatch = configSrc.match(/name:\s*"([^"]+)"/);
const shortMatch = configSrc.match(/shortName:\s*"([^"]+)"/);
if (!nameMatch || !shortMatch) {
  console.error("check-hardcoded-name: could not parse site.config.ts");
  process.exit(1);
}

const namesToFind = [
  nameMatch[1], // current name (e.g. "Summit MVP")
  shortMatch[1], // current short name (e.g. "Summit")
  "taj-website", // legacy placeholder
];

// Scan every source file that isn't in an allow-listed location.
const ALLOWED = [
  "src/config/", // where names ARE supposed to live
  "docs/", // docs may reference the name
  "scripts/", // infrastructure scripts reference the hosting URL
  "node_modules/",
  ".next/",
  "out/",
  ".git/",
  ".canvas-design/", // approved mockups — pre-config-era
  "e2e/", // E2E tests source from siteConfig too, but string match is fine
  "CHANGELOG.md",
  "README.md",
  "package.json",
  "package-lock.json",
];

const SCAN_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mdx", ".html"]);

function walk(dir, hits) {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const rel = relative(ROOT, abs).replaceAll("\\", "/");
    if (ALLOWED.some((prefix) => rel.startsWith(prefix.replace(/\/$/, "")))) continue;
    const st = statSync(abs);
    if (st.isDirectory()) {
      walk(abs, hits);
      continue;
    }
    const ext = "." + entry.split(".").pop();
    if (!SCAN_EXTS.has(ext)) continue;
    const src = readFileSync(abs, "utf8");
    for (const needle of namesToFind) {
      // Skip inside the config file itself (already excluded by ALLOWED, but
      // defense in depth).
      if (src.includes(needle)) {
        hits.push({ file: rel, needle });
      }
    }
  }
}

const hits = [];
walk(ROOT, hits);

if (hits.length > 0) {
  console.error("check-hardcoded-name: FAIL — the site name is hardcoded outside src/config/");
  for (const h of hits) {
    console.error(`  ${h.file}: contains "${h.needle}"`);
  }
  console.error("");
  console.error(
    "Fix: import { siteConfig } from '@/config/site.config' and use siteConfig.name / siteConfig.shortName instead.",
  );
  process.exit(1);
}

console.log("check-hardcoded-name: OK — no hardcoded names outside src/config/");

import { test, expect } from "@playwright/test";
import { siteConfig } from "../src/config/site.config";

test("landing page loads with the configured site name", async ({ page }) => {
  await page.goto("/");
  // Title is sourced from siteConfig in src/app/layout.tsx — renaming
  // the site in site.config.ts automatically updates this expectation.
  await expect(page).toHaveTitle(new RegExp(siteConfig.name, "i"));
});

test("signup page renders (either the form or the not-configured notice)", async ({ page }) => {
  await page.goto("/signup");
  // The signup page has two valid states:
  //   1. Supabase env wired   -> email form + ToS checkbox visible
  //   2. Supabase env unwired -> amber "not configured" notice
  // CI runs without env vars so expects #2; a real deploy with env vars gets #1.
  // Either state means the page shell + AuthForm component mounted correctly.
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  const emailInput = page.getByPlaceholder("you@example.com");
  const notConfigured = page.getByText(/Sign-in is not configured/i);
  await expect(emailInput.or(notConfigured)).toBeVisible();
});

test("legal pages render without crashing", async ({ page }) => {
  await page.goto("/legal/terms");
  await expect(page.getByRole("heading", { name: "Terms of Service" })).toBeVisible();

  await page.goto("/legal/privacy");
  await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
});

import { test, expect } from "@playwright/test";
import { siteConfig } from "../src/config/site.config";

test("landing page loads with the configured site name", async ({ page }) => {
  await page.goto("/");
  // Title is sourced from siteConfig in src/app/layout.tsx — renaming
  // the site in site.config.ts automatically updates this expectation.
  await expect(page).toHaveTitle(new RegExp(siteConfig.name, "i"));
});

test("signup page shows the email form", async ({ page }) => {
  await page.goto("/signup");
  // Email-only sign-in for MVP (no Google button right now).
  await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
  // ToS acceptance checkbox is required for signup.
  await expect(page.getByRole("checkbox")).toBeVisible();
});

test("legal pages render without crashing", async ({ page }) => {
  await page.goto("/legal/terms");
  await expect(page.getByRole("heading", { name: "Terms of Service" })).toBeVisible();

  await page.goto("/legal/privacy");
  await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
});

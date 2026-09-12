import { chromium } from "playwright";

const pages = [
  { name: "01-home", url: "http://localhost:8765/preview-main.html" },
  { name: "02-products", url: "http://localhost:8765/preview-products.html" },
  { name: "03-services", url: "http://localhost:8765/preview-services.html" },
  { name: "04-contact", url: "http://localhost:8765/preview-contact.html" },
  { name: "05-dashboard", url: "http://localhost:8765/preview-dashboard.html" },
];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

for (const p of pages) {
  await page.goto(p.url, { waitUntil: "networkidle" });
  // wait for Google Fonts to actually apply
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `screenshots/${p.name}.png`, fullPage: false });
  console.log(`shot ${p.name}`);
}

await browser.close();

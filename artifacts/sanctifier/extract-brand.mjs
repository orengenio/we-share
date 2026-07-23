#!/usr/bin/env node
/**
 * Sanctifier drop-in: extract a prospect's brand (name, logo, primary color,
 * phone) from their existing site and compose the instant_mockup_url for the
 * parametrized preview template (mockup-preview-template.html).
 *
 * Usage:
 *   MOCKUP_BASE_URL=https://weshare.orengen.io/mockup.html \
 *   node extract-brand.mjs dallasplumbingco.com "Dallas Plumbing Co" Plumbing Dallas
 *
 * Prints the composed preview URL; wire it into audit-leads.mjs by calling
 * extractBrand() and setting custom_fields.instant_mockup_url before send.
 */

import { chromium } from "playwright";

const BASE = process.env.MOCKUP_BASE_URL || "https://weshare.orengen.io/mockup.html";

export async function extractBrand(domain, fallbackName = "", trade = "", city = "") {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const brand = { biz: fallbackName, trade, city, logo: "", color: "", phone: "" };
  try {
    await page.goto(`https://${domain.replace(/^https?:\/\//, "")}`, {
      timeout: 25000,
      waitUntil: "domcontentloaded",
    });

    brand.biz =
      (await page.locator('meta[property="og:site_name"]').getAttribute("content").catch(() => null)) ||
      fallbackName ||
      (await page.title()).split(/[|–-]/)[0].trim();

    // Logo: og:image → apple-touch-icon → first header <img>
    brand.logo =
      (await page.locator('meta[property="og:image"]').first().getAttribute("content").catch(() => null)) ||
      (await page.locator('link[rel="apple-touch-icon"]').first().getAttribute("href").catch(() => null)) ||
      (await page.locator("header img, nav img").first().getAttribute("src").catch(() => null)) ||
      "";
    if (brand.logo && !brand.logo.startsWith("http")) {
      brand.logo = new URL(brand.logo, page.url()).href;
    }
    if (!brand.logo.startsWith("https://")) brand.logo = ""; // template only accepts https

    // Primary color: theme-color meta, else dominant header background
    brand.color =
      (await page.locator('meta[name="theme-color"]').first().getAttribute("content").catch(() => null)) || "";
    if (!brand.color) {
      brand.color = await page
        .evaluate(() => {
          const el = document.querySelector("header, nav, .header, #header");
          if (!el) return "";
          const c = getComputedStyle(el).backgroundColor.match(/\d+/g);
          if (!c || c.length < 3) return "";
          const hex = (n) => (+n).toString(16).padStart(2, "0");
          const [r, g, b] = c;
          if (+r > 240 && +g > 240 && +b > 240) return ""; // white header → keep default navy
          return `#${hex(r)}${hex(g)}${hex(b)}`;
        })
        .catch(() => "");
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(brand.color)) brand.color = "";

    // Phone: first tel: link
    const tel = await page.locator('a[href^="tel:"]').first().getAttribute("href").catch(() => null);
    if (tel) brand.phone = tel.replace(/^tel:/, "");
  } finally {
    await browser.close();
  }

  const u = new URL(BASE);
  if (brand.biz) u.searchParams.set("biz", brand.biz);
  if (brand.trade) u.searchParams.set("trade", brand.trade);
  if (brand.city) u.searchParams.set("city", brand.city);
  if (brand.color) u.searchParams.set("color", brand.color);
  if (brand.phone) u.searchParams.set("phone", brand.phone);
  // brand.logo is deliberately NOT put in the URL — the preview renders a
  // monogram mark (no remote images: prospects' hosts often block hotlinks,
  // and the preview page never loads third-party content). The logo URL in
  // the JSON output is intel for the build team.
  return { brand, mockupUrl: u.href };
}

// CLI entry
if (import.meta.url === `file://${process.argv[1]}`) {
  const [domain, name = "", trade = "", city = ""] = process.argv.slice(2);
  if (!domain) {
    console.error('Usage: node extract-brand.mjs <domain> "[Business Name]" [Trade] [City]');
    process.exit(1);
  }
  const { brand, mockupUrl } = await extractBrand(domain, name, trade, city);
  console.log(JSON.stringify(brand, null, 2));
  console.log("\ninstant_mockup_url:\n" + mockupUrl);
}

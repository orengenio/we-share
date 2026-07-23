#!/usr/bin/env node
/**
 * Sanctifier drop-in: bulk website audit → scored lead payloads → n8n webhook.
 *
 * Reads a JSON file of prospects, audits each site headless (SSL, mobile
 * viewport, CMS, staleness, e-commerce, response time), computes the OrenGen
 * lead score, and POSTs the exact payload the "Sanctifier Lead Router" n8n
 * workflow expects (see artifacts/n8n/sanctifier-lead-router.json).
 *
 * Usage:
 *   N8N_WEBHOOK_URL=https://<your-n8n-host>/webhook/sanctifier-inbound-leads \
 *   node audit-leads.mjs leads.json
 *
 * leads.json format (array):
 *   [{ "company_name": "Dallas Plumbing Co", "url": "dallasplumbingco.com",
 *      "first_name": "Owner", "phone": "+12145550199",
 *      "email": "contact@dallasplumbingco.com", "state": "TX" }]
 *
 * Requires: npm i playwright   (Sanctifier already ships Playwright)
 * Add WEBHOOK_SECRET_HEADER / WEBHOOK_SECRET env once the n8n webhook has
 * header auth enabled (recommended before going live).
 */

import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const WEBHOOK = process.env.N8N_WEBHOOK_URL;
const SECRET_HEADER = process.env.WEBHOOK_SECRET_HEADER; // e.g. "x-sanctifier-key"
const SECRET_VALUE = process.env.WEBHOOK_SECRET;
const CONCURRENCY = parseInt(process.env.AUDIT_CONCURRENCY ?? "4", 10);
const DRY_RUN = process.env.DRY_RUN === "1";

if (!WEBHOOK && !DRY_RUN) {
  console.error("Set N8N_WEBHOOK_URL (or DRY_RUN=1 to audit without sending).");
  process.exit(1);
}
const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node audit-leads.mjs <leads.json>");
  process.exit(1);
}

const leads = JSON.parse(readFileSync(inputPath, "utf8"));

// ─── Scoring (OrenGen lead-scoring framework) ────────────────────────────────
// +30 no SSL · +25 no mobile viewport/overflow · +20 no local-business schema
// (honest proxy for a missing Google Business Profile connection — we cannot
// see GBP itself from the site) · +15 stale (copyright ≥ 2 years old) ·
// −50 e-commerce (outside Standard/Professional scope)
function score(f) {
  let s = 0;
  if (!f.ssl_ok) s += 30;
  if (!f.mobile_ok) s += 25;
  if (!f.local_schema) s += 20;
  if (f.stale) s += 15;
  if (f.ecommerce) s -= 50;
  return s;
}

// Matches host (or a subdomain of it) only in the authority position of a
// resource URL — "evil-static.parastorage.com.attacker.io" won't match.
function resourceHost(host, path = "/") {
  const h = host.replace(/\./g, "\\.");
  const p = path.replace(/\//g, "\\/");
  return new RegExp(`(?:src|href)=["']https?:\\/\\/(?:[a-z0-9-]+\\.)*${h}${p}`, "i");
}

function detectCms(html, headers) {
  const gen = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)/i)?.[1];
  if (gen) return gen.slice(0, 60);
  if (/(?:src|href)=["'][^"']*wp-(?:content|includes)\//i.test(html)) return "WordPress (version hidden)";
  if (resourceHost("parastorage.com").test(html) || resourceHost("wixstatic.com").test(html)) return "Wix";
  if (resourceHost("squarespace.com").test(html) || /squarespace/i.test(headers["x-servedby"] ?? "")) return "Squarespace";
  if (resourceHost("shopify.com").test(html)) return "Shopify";
  if (resourceHost("godaddy.com", "/websites").test(html)) return "GoDaddy Builder";
  return "Custom/Unknown";
}

async function auditOne(browser, lead) {
  const raw = String(lead.url || "").trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!raw) return { ...lead, error: "no url" };
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, // audit AT mobile width
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  const page = await ctx.newPage();
  const f = {
    ssl_ok: false, mobile_ok: false, local_schema: false,
    stale: false, ecommerce: false, cms: "Unreachable", response_ms: null,
  };
  try {
    const t0 = Date.now();
    let resp = null;
    try {
      resp = await page.goto(`https://${raw}`, { timeout: 25000, waitUntil: "domcontentloaded" });
      f.ssl_ok = true; // TLS handshake succeeded
    } catch {
      resp = await page.goto(`http://${raw}`, { timeout: 25000, waitUntil: "domcontentloaded" });
      f.ssl_ok = page.url().startsWith("https://"); // credit an http→https redirect
    }
    f.response_ms = Date.now() - t0;
    const html = await page.content();
    f.cms = detectCms(html, resp?.headers() ?? {});

    const hasViewportMeta = /<meta[^>]+name=["']viewport["']/i.test(html);
    const overflows = await page
      .evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 10)
      .catch(() => true);
    f.mobile_ok = hasViewportMeta && !overflows;

    f.local_schema = /schema\.org\/(LocalBusiness|Plumber|Electrician|Dentist|Restaurant|AutoRepair|HomeAndConstructionBusiness)/i.test(html);

    const yearMatch = html.match(/(?:©|&copy;|copyright)[^0-9]{0,20}(20[0-2][0-9])/i);
    if (yearMatch) f.stale = new Date().getFullYear() - parseInt(yearMatch[1], 10) >= 2;

    f.ecommerce = /woocommerce|cdn\.shopify\.com|add[-_]?to[- _]?cart|bigcommerce/i.test(html);
  } catch (e) {
    f.error = String(e?.message ?? e).slice(0, 120);
  } finally {
    await ctx.close();
  }

  return {
    first_name: lead.first_name || "Business Owner",
    company_name: lead.company_name,
    phone: lead.phone || "",
    email: lead.email || "",
    state: String(lead.state || "").toUpperCase(),
    lead_source: "Sanctifier Scraper",
    custom_fields: {
      lead_score: score(f),
      ssl_status: f.ssl_ok ? "SECURE" : "NOT SECURE",
      mobile_responsive: f.mobile_ok ? "PASSED" : "FAILED",
      google_maps_connected: f.local_schema ? "SCHEMA PRESENT" : "NO LOCAL SCHEMA",
      current_cms: f.cms,
      response_ms: f.response_ms,
      audited_url: raw,
      // The mockup engine fills this (see mockup-engine.md); blank until then.
      instant_mockup_url: "",
    },
    audit_error: f.error ?? null,
  };
}

async function send(payload) {
  if (DRY_RUN) return "dry-run";
  const headers = { "Content-Type": "application/json" };
  if (SECRET_HEADER && SECRET_VALUE) headers[SECRET_HEADER] = SECRET_VALUE;
  const res = await fetch(WEBHOOK, { method: "POST", headers, body: JSON.stringify(payload) });
  return `${res.status}`;
}

const browser = await chromium.launch();
let done = 0;
const queue = [...leads];
const results = [];
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const lead = queue.shift();
      const payload = await auditOne(browser, lead);
      const status = payload.audit_error ? "SKIP(unreachable)" : await send(payload);
      results.push(payload);
      console.log(
        `[${++done}/${leads.length}] ${payload.company_name} → score ${payload.custom_fields.lead_score}` +
        ` (ssl:${payload.custom_fields.ssl_status} mobile:${payload.custom_fields.mobile_responsive}` +
        ` cms:${payload.custom_fields.current_cms}) → ${status}`
      );
    }
  })
);
await browser.close();

const hot = results.filter((r) => !r.audit_error && r.custom_fields.lead_score >= 50).length;
console.log(`\nDone. ${results.length} audited · ${hot} hot (score ≥ 50) · ${results.filter(r => r.audit_error).length} unreachable.`);

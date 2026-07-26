# Sanctifier drop-ins — audit engine + instant-mockup engine

Three self-contained files to drop into your Sanctifier repo (they only need `playwright`, which Sanctifier already uses). Together they automate the "pre-audited, pre-mockup'd lead" flow from the launch plan — the hybrid model: **machines prep the lead, the rep makes the permission call.**

## 1. `audit-leads.mjs` — bulk website audit → scored payloads → n8n

Feeds the *Sanctifier Lead Router* (`artifacts/n8n/sanctifier-lead-router.json`).

```
N8N_WEBHOOK_URL=https://<n8n-host>/webhook/sanctifier-inbound-leads \
node audit-leads.mjs leads.json
```

- Audits at **mobile width** (390px) with an iPhone UA — mobile failure is the pitch.
- Checks: SSL/TLS (http→https redirect credited), viewport meta + horizontal overflow, CMS fingerprint (WordPress/Wix/Squarespace/Shopify/GoDaddy/custom), local-business schema (an honest *proxy* for Google Business Profile linkage — we can't see GBP from the site), stale copyright (≥2 years), e-commerce (−50: outside Standard/Professional scope), response time.
- Scores per the framework: +30 no SSL · +25 no mobile · +20 no local schema · +15 stale · −50 e-commerce. **≥ 50 = hot.**
- `DRY_RUN=1` audits and prints without sending. Set `WEBHOOK_SECRET_HEADER`/`WEBHOOK_SECRET` once the n8n webhook has header auth (do this before going live).
- Unreachable sites are skipped, not sent — a dead domain isn't a website lead.

## 2. `extract-brand.mjs` + `mockup-preview-template.html` — the instant mockup

The Google-AI draft imagined Sanctifier "building the site." It doesn't (it's a scraper) — and no GHL API exists for cloning site templates. This is the honest, working version:

- **The template** is one static HTML file that personalizes itself from query params: `?biz=&trade=&city=&color=&accent=&phone=`. Premium navy/orange by default, the prospect's own brand color when extracted, and a monogram mark built from the business name (deliberately no remote logo loading — prospects' hosts often block hotlinks, and the page never loads third-party content). Params only ever land in `textContent` or validated hex CSS variables — never in URLs, srcs, hrefs, or HTML — so a crafted link can't inject or redirect anything.
- **Host it once**, anywhere static — simplest: drop it in the WeShare repo at `public/mockup.html` and every preview URL becomes `https://weshare.orengen.io/mockup.html?biz=...`. (Say the word and that's a 1-line PR.)
- **The extractor** pulls the prospect's name, logo (og:image → touch-icon → header img), primary color (theme-color → header background), and phone (first tel: link), then composes the final `instant_mockup_url`:

```
node extract-brand.mjs dallasplumbingco.com "Dallas Plumbing Co" Plumbing Dallas
```

- Wire-in: `audit-leads.mjs` leaves `instant_mockup_url` blank; import `extractBrand()` there to fill it per-lead, or run the extractor only for hot leads (score ≥ 50) to keep runs fast.

## The full pipeline once everything is connected

```
[Sanctifier scrape] → audit-leads.mjs (score) → extract-brand.mjs (mockup URL, hot leads)
      → n8n lead router (Claude hook + state-pool round-robin)
      → GHL contact w/ score, flaws, hook, mockup URL, assigned rep
      → rep's Hot Opportunities list → 60-second permission call
      → "Send Audit/Mockup" one-click email (GHL workflow — see ghl-workflow-specs.md)
      → checkout → WeShare credits the rep (X-WeShare-Api-Key track API)
```

**What stays manual by design:** the first prospect touch. Blind-blasting audits/mockups to scraped emails is the spam-filter death spiral the plan explicitly rejected — the machine preps everything, the rep earns the send.

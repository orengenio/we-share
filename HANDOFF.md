# WeShare — Engineering Handoff

Handoff for a fresh code session picking up **WeShare** (weshare.orengen.io), OrenGen Worldwide LLC's self-hosted referral + sales-partner program. Written 2026-07-07.

---

## TL;DR — current state

- App is **live in production** on Coolify. Core platform, GHL integration, Stripe Connect, and email are all wired and working.
- **PR #28 just merged to `main`** — Sales Scripts added to the Partner Handbook + rep prospect-attribution (the latter also came in via #27). Nothing is mid-flight in git.
- **Stripe Connect** platform profile is configured on the **Express** path (transfers-only, platform-paid fees, hosted onboarding + Express Dashboard) — matches the code.
- Remaining work is mostly **content** (email sequences, recruitment funnel) + a few **small code tasks** (see Pending). One task (`/s/[code]` partner link) needs a **DB migration** — do it with the owner reachable to verify the deploy.
- The 7 customer funnels, the rep runbook, and the status board are **non-code deliverables that live in the previous session's scratchpad (ephemeral)** — see "Non-code deliverables." They are NOT in git.

---

## Stack & deploy

- **Next.js 14.2 App Router + TypeScript**, `output: "standalone"`.
- **Prisma ORM + PostgreSQL.** Auth = JWT via `jose`. **Redis** for click-fraud counters + attribution cache (degrades gracefully if down).
- **Docker on Coolify**, port **3001**. Container `CMD` runs **`prisma migrate deploy` at startup**, then `node server.js`. → **A new migration applies automatically on deploy.** (There's a one-off `migrate resolve --rolled-back` fallback in the CMD for a specific historical migration; leave it.)
- Migrations live in `prisma/migrations/` (dated dirs, e.g. `20260705000004_onboarding_fields`). Add a new dated dir with `migration.sql` + update `schema.prisma`. **There is no local DB in the dev container** — you author the migration SQL; it runs on deploy. Verify with the owner around.
- Deploys are triggered by Coolify (push to `main` → build → deploy). Coolify API + token were used for env/deploy management (token in the prior session's scratchpad — not committed).

---

## Repo & branch protocol (READ FIRST)

- Designated working branch: **`claude/affiliate-partner-program-p42c0p`**.
- **PR #28 already merged.** Per the merged-PR rule, **start new work as a fresh change off `main`:**
  ```
  git fetch origin main
  git checkout -B claude/affiliate-partner-program-p42c0p origin/main
  ```
  Then commit new work and open a **new** PR (the merged one is finished — never stack onto it).
- Squash-merges make this branch diverge from `main` every cycle. If a push rejects with "stale info," `git fetch origin <branch>` to refresh the tracking ref, then push. Use `--force-with-lease` only when the branch carries only already-merged history.

---

## What's built (in git)

| Area | Where | Notes |
|---|---|---|
| GHL v2 client | `src/lib/ghl.ts` | contacts, upsert, tags, opportunities, pipelines, `sendEmailViaGHL`, `syncPartnerToGHL`, `isGHLConfigured()` |
| Email routing | `src/lib/email.ts` | `send()` → `sendEmailViaGHL` when GHL configured, else SMTP |
| Stripe Connect | `src/lib/stripe.ts` | `createConnectAccount` (**Express**, `transfers` cap, manual payout), onboarding link, `createTransfer`, status, webhook verify |
| Attribution — tracking | `src/lib/tracking.ts` | `recordClick`, `resolveAttribution`, `lockAttribution`; 90-day cookie; burst-fraud |
| Affiliate redirect | `src/app/r/[code]/route.ts` | click → cookie → safe redirect (orengen.io hosts only) |
| **Rep prospect registration** | `src/app/api/partners/me/leads/route.ts` (POST) | ownership-by-entry + claim/dedup on email/last-10-phone; non-blocking GHL contact+opportunity sync |
| Prospect UI | `src/app/(dashboard)/partner/leads/page.tsx` | `RegisterProspectModal` + "Register a Prospect" |
| Compliance footer | `src/components/legal-footer.tsx` | `ComplianceFooter` — FTC income disclaimer; rendered in dashboard/admin/auth/public shells |
| Docs (role-gated) | `src/app/(dashboard)/resources/page.tsx` | serves `public/docs/*.pdf` by role |
| Handbook source | `orengen-partner-handbook.md` → `public/docs/partner-handbook.pdf` | v1.1; §6 = Sales Scripts |
| Schema | `prisma/schema.prisma` | `AffiliateProfile.affiliateCode`, `PartnerProfile.partnerCode`, `Lead`, `Click`, `Conversion`, `Commission`, `GHLOpportunity`, `Payout`, etc. |

**Roles:** `AFFILIATE` (referral partner), `PARTNER` (sales partner / closer), `ADMIN`.

---

## Integrations & environment

**Env vars actually referenced in code** (set in Coolify; values NOT in this doc):

- **GHL:** `GHL_API_BASE` (default `https://services.leadconnectorhq.com`), `GHL_API_VERSION` (`2021-07-28`), `GHL_API_KEY` (Bearer PIT — **must be AGENCY-level** for all scopes), `GHL_LOCATION_ID` (`dMEB004RUX8JRRi42Kzq`), `GHL_PARTNER_PIPELINE_ID` (`5kXJgKVijokWag4enbJ5`), per-stage IDs `GHL_STAGE_NEW|CONTACTED|APPOINTMENT|PROPOSAL|WON|LOST|NURTURE`, `GHL_WEBHOOK_SECRET`.
- **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SETUP_FEE_PRICE_ID`, `STRIPE_MAINTENANCE_PRICE_ID`.
- **Email:** `EMAIL_FROM`, `EMAIL_REPLY_TO`, `SMTP_HOST/PORT/USER/PASS/SECURE` (SMTP is the fallback; primary path is GHL).
- **Other:** `JWT_SECRET`, `REDIS_URL`, `COOKIE_DOMAIN`, `NEXT_PUBLIC_APP_URL` (`https://weshare.orengen.io`), `ADMIN_EMAILS`, `GEMINI_API_KEY`/`GEMINI_MODEL`, `N8N_FRAUD_ALERT_WEBHOOK_URL`.

**GHL notes:** GHL **Funnels** and the **SaaS Configurator** are **UI-only (no public API)** — those are owner clicks, not code. A GHL **Product catalog** of 10 OrenGen services already exists (created via API). GHL MCP endpoint is `/mcp/` (tool calls need a live token; `tools/list` succeeds even with a dead token — don't trust it as an auth check).

---

## Pending code work (prioritized)

### 1. Rep onboarding email sequence + customer confirmation emails  *(content-heavy, low code)*
- Onboarding: welcome → sign docs → set up Stripe → certification → first leads.
- Confirmations: order receipt, intake received, "your build starts now."
- Send via `src/lib/email.ts` (`send()` already routes through GHL). Wire as triggers on the relevant events (signup, checkout webhook, intake submit). Content can be drafted first; the owner may prefer some of these run as **GHL workflows** instead of app-sent — confirm per email.

### 2. `/s/[code]` personal sales-partner tracking link  *(NEEDS A MIGRATION — do with owner reachable)*
- Goal: a partner analog of `/r/[code]` so a rep can share a branded link and get attributed.
- **Blocker:** `Click.affiliateId` is a **required** relation to `AffiliateProfile` (`src/lib/tracking.ts`, `prisma/schema.prisma`). Partners aren't affiliates.
- **Approach:** add `partnerId String?` (+ relation) to `Click` and make `affiliateId` optional, OR add a separate `PartnerClick` model. Add a partner-aware `recordClick` path + `src/app/s/[code]/route.ts` mirroring `/r/[code]` (reuse `safeDestination`, cookie logic). Migration required → applies on deploy.
- **Full loop caveat:** attributing a *funnel purchase* back to the rep also needs the GHL-hosted checkout to report the partner code back to WeShare (a GHL→WeShare webhook creating a `Conversion` with `partnerId`). The `/s/` route alone only drops the attribution cookie for WeShare-side forms. Scope both halves or ship the link first and note the gap.

### 3. A2P number per rep  *(small; owner assigns the number manually)*
- Store the assigned number on `PartnerProfile` (new nullable field → migration). Admin action to set it + send the "your number is ready" email. Surface it on the partner dashboard.

### 4. Bulk / CSV prospect import  *(small)*
- Let a rep upload a search export and run it through the same claim/dedup path as `POST /api/partners/me/leads`. No schema change.

### 5. Marketing opt-in + AI voice/SMS number capture
- Already specced in the funnel intake copy (flow step 14). When any WeShare-side intake form exists, capture **separate** consent checkboxes (service = required; marketing + AI-follow-up = optional, never pre-checked) with a **timestamp** stored as the consent record.

---

## Gotchas / hard-won lessons

- **Cloudflare error 1010** blocks Python `urllib` to GHL. Use **`curl`** for GHL API calls from scripts (write JSON with Python if needed, POST with curl).
- **GHL token must be created at AGENCY level**, not sub-account — sub-account tokens silently lack scopes (401 "not authorized for this scope").
- **GHL products:** amounts are in **dollars** (not cents); recurring prices need nested `recurring: { interval: "month", intervalCount: 1 }` (a flat `recurringInterval` is ignored); batch creation hits **429** — sleep ~1.2–1.5s between calls.
- **Coolify env classifier** can block setting certain env values it deems agent-derived (hit this setting SMTP host). Owner-provided identifiers were fine.
- **Never materialize secrets to stdout** (printing `${TOKEN:0:4}` was blocked). Pipe tokens straight into curl.
- **Playwright/Chromium** is at `/opt/pw-browsers/chromium`; global playwright at `/opt/node22/lib/node_modules`. Local HTML→PDF works; **headless Chromium can't reach the live site** (CONNECT-only proxy). No markdown libs installed — the handbook PDF was generated with a hand-rolled md→HTML converter (that script was in scratchpad, **ephemeral** — recreate if you need to regen the PDF).
- **DB migrations** can't be run locally (no DB). Author SQL carefully; it applies on deploy via `migrate deploy`.

---

## Open PRODUCT decisions (block some of the above)

1. **W-9 vs Stripe overlap** — Stripe Connect already collects tax info + issues the 1099. Separate W-9 in GHL, or let Stripe cover it? (A paste-ready *Payment Authorization / Contractor Tax* doc is drafted — see runbook.)
2. **Rep GHL access model** — auto-add reps to the GHL sub-account how: **(A)** one shared limited seat, or **(B)** individual limited seats per rep. *This is the only decision that meaningfully blocks onboarding.* Reps already see only their own data in the WeShare dashboard, so they're not hard-blocked.
3. **Upsell offers/pricing** for the customer funnels (company revenue — reps never see these).
4. **SaaS Configurator intent** — own subscription billing vs. reselling GHL SaaS to clients.

---

## Guardrails & brand constraints (NON-NEGOTIABLE)

- **Rep comp = 25% upfront + 25% residual, for life. NOTHING else.** Standard close = **$249.25** upfront + **$61.75/mo** residual.
- **No upsell language on ANY rep-facing surface** — orengen.io, weshare.orengen.io, rep docs/handbook. Reps sell the **website only ($997 + $247/mo)** and never discuss commissions, upsells, or add-ons. Upsells belong **only in customer checkout funnels** (company revenue). The handbook §9 already encodes this — keep it that way.
- On **SMS-adjacent surfaces**, say **"Referral Partner,"** never "Affiliate" (carrier compliance). "Sales Partner" tier name is fine.
- **Compliance footer** (`ComplianceFooter`) with the FTC income disclaimer must render on **every** page. No income/earnings claims to prospects.
- **The confidential Internal Ops SOP must NOT live under `/public`** — static assets have no per-file auth. Serve it via an authenticated API route if it needs to be surfaced (see the note in `resources/page.tsx`).
- Brand tokens: Navy `#00254B`, Burnt Orange `#CC5500` (CTAs/links), Public Sans. Founder is **"Andre Mandel" / "Mandel."** Forbidden phrases: "AI-powered solutions," "cutting-edge," "best-in-class," "leverage synergies," "we're passionate about," "one-stop shop."

---

## Non-code deliverables (⚠️ ephemeral — not in git)

These were produced in the **previous session's scratchpad** and delivered to the owner as files/an artifact. A fresh session will NOT have them on disk. If you need them, ask the owner to re-share, or find the delivered files:

- **7 customer funnel copies** (OrenWeb + AI Voice + AI Employees + Better Together + OrenNexus + OrenSocial + OrenWeb Talk) — paste-ready for GHL, with per-page GHL element maps.
- **`funnel-architecture.md`** — offer/bump/upsell/downsell map for all 7 services.
- **Rep Onboarding & Operations Runbook** — the full rep flow with per-step status + gap list + the Payment Authorization / Contractor Tax doc.
- **Call Armory** — 10 scripts (source for GHL custom values + Handbook §6).
- **Status board artifact** — live engagement tracker (owner has the URL).

---

## First moves for the next session

1. Read `prisma/schema.prisma` and `src/lib/{ghl,stripe,email,tracking}.ts`, plus `src/app/api/partners/me/leads/route.ts` and `src/app/r/[code]/route.ts`.
2. **Reset the branch off `origin/main`** before committing anything new (see Branch protocol).
3. Confirm the env vars above are present in the running environment.
4. Pick a Pending task. Safe to start solo (no migration, no owner needed): **#1 email sequences**, **#4 bulk import**, **#5 consent capture**. Needs owner reachable: **#2 `/s/` link** (migration) and **#3 A2P field** (migration).
5. Owner is `sales@orengen.io` (GitHub `andre-mandel`). Scope is repo `orengenio/we-share` only.

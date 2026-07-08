# Launch Verification — the whole chain, audited (2026-07-08)

Answer to "is everything connected and synchronous?" — split honestly into
**✅ verified in code** (audited this session, shipped through PR #37) and
**🔍 runtime checks** (config that lives in Coolify/Stripe/GHL/Cloudflare —
verify once, tick the box). Do the 🔍 list top-to-bottom and the platform is
end-to-end live.

## 1 · Tracking & attribution — ✅ code / 🔍 one env

| Link | Status |
|---|---|
| `/r/[code]` + `/s/[code]` → click record, fraud check, 90-day `ws_vid` cookie, safe `?dest=` redirect | ✅ |
| Attribution resolution (Redis-cached) → lead lock on form submit → checkout metadata | ✅ |
| Public checkout carries attribution server-side (cookie first, `?ref=`/`?rep=` fallback) | ✅ |
| Attribution embed for external pages (`/weshare-attribution.js`) | ✅ shipped — add the `<script>` tag to orengen.io pages when wanted |
| 🔍 **`COOKIE_DOMAIN` env should be `.orengen.io`** so the cookie spans orengen.io ↔ weshare.orengen.io. Check in Coolify → app → Environment Variables. | 🔍 |

## 2 · Forms — ✅ all native now

Register (affiliate/partner) · Register-a-Prospect + CSV import (claim/dedup) · partner application (`/partners/apply` → GHL contact + admin email + audited consents) · lead capture (`/api/track/lead` w/ SMS + marketing + AI consents, separately timestamped) · contractor agreement (dashboard modal, audited) · checkout (`/get-started`). **No GHL forms, no third-party form tool.**

## 3 · Money processing — ✅ code / 🔍 two registrations

| Link | Status |
|---|---|
| Conversions → 25%+25% commissions (+ leader/army overrides), NET-15 maturity, auto-mature on payout runs | ✅ |
| Idempotency: per-payment, one SETUP_FEE per client, one MONTHLY per client-month, across ALL sources (Stripe/GHL/v1) | ✅ |
| Clawback: refunds void pending/approved; already-PAID nets negative against next payout; subs cancel → residuals void + rep save-call alert | ✅ |
| Payouts: batch → Stripe Connect transfers → email + event | ✅ |
| 🔍 **Stripe webhook endpoint registered?** Stripe Dashboard → Developers → Webhooks: endpoint `https://weshare.orengen.io/api/webhooks/stripe` with events `checkout.session.completed`, `invoice.payment_succeeded`, `charge.refunded`, `customer.subscription.deleted`; signing secret = `STRIPE_WEBHOOK_SECRET` env. | 🔍 |
| 🔍 **v1 API enabled?** `WESHARE_API_KEY` env set (endpoint is dead until it exists) + the same key in the GHL/n8n workflow header `X-WeShare-Api-Key`. | 🔍 |

## 4 · GHL integration — ✅ code / 🔍 four setup items

| Link | Status |
|---|---|
| Outbound to GHL: contact upserts (leads, prospects, applicants, partners), tags, custom fields, opportunities, pipeline stage sync on lead status change | ✅ |
| Inbound from GHL: `/api/webhooks/ghl` — opportunity stage → lead status, contact updates, touch logging; Won→conversion env-gated off | ✅ |
| Emails routed through GHL (`sendEmailViaGHL`) | ✅ |
| 🔍 **GHL webhook pointed at us?** GHL → Settings → Webhooks (or workflow HTTP action): `https://weshare.orengen.io/api/webhooks/ghl`, secret matching `GHL_WEBHOOK_SECRET` env. Without it, stage moves in GHL don't sync back. | 🔍 |
| 🔍 **Custom fields exist in the location?** `upsertContact` writes by key — GHL silently drops keys that don't exist. Create once (Settings → Custom Fields): `ws_affiliate_code`, `ws_partner_code`, `ws_rep_city_state`, `ws_rep_experience`, `ws_rep_sold_what`, `ws_rep_hours`, `ws_rep_objection_answer`, `ws_rep_start`, `ws_rep_referrer`, `ws_consent_service_at`, `ws_consent_sms_mkt_at`. | 🔍 |
| 🔍 **Stage-ID envs pasted + redeployed** (the block from tonight: `GHL_STAGE_*`, `COMMISSION_MATURITY_DAYS`). Env changes only apply on redeploy. | 🔍 |
| 🔍 **Workflows**: STOP kill-switch first, then application-received / interview reminders on the `WS Rep Applicant` tag; intro calendar created → set `NEXT_PUBLIC_PARTNER_CALENDAR_URL`. | 🔍 |

## 5 · Email & DNS — ✅ verified from your screenshots / 🔍 three follow-ups

| Item | Status |
|---|---|
| `crm.orengen.com` dedicated sending domain: SPF, DKIM (`k1._domainkey`), DMARC, MX (Mailgun), CNAME — **all Verified** in both Cloudflare and LeadConnector; SSL issued | ✅ (seen 2026-07-07) |
| 🔍 **DMARC is `p=none`** — monitoring-only. Fine for warmup; after ~2–4 clean weeks, tighten to `p=quarantine` so spoofers stop riding the domain. | 🔍 later |
| 🔍 **Domain warmup is Stage 1** with daily send caps — don't bulk-send onboarding/marketing until GHL shows the warmup progressed; transactional volume is fine. | 🔍 pacing |
| 🔍 **Dedicated Header showed "Name/Email not provided"** in GHL — set it (e.g. OrenGen Team / team@crm.orengen.com) so sends carry a proper from-identity. | 🔍 |

## 6 · Outbound webhooks / n8n — ✅
Event bus (12 event types incl. `client.cancelled`), HMAC signing, SSRF guard, timeouts, delivery log + admin UI; legacy `N8N_*` env URLs honored. Add subscriptions in Admin → Integrations when wanted.

## 7 · The one blocked item
This Claude session's **network policy** denies `backoffice.orengen.io` and `weshare.orengen.io` (proxy 403 on CONNECT — the Coolify token never even gets presented). Allowlist those two domains in the Claude Code environment settings and every 🔍 above that's checkable via API (envs, redeploy, loop test, health checks) gets done for you; until then they're 5-minute owner checks.

## The 10-minute live proof (after envs + redeploy)
```
BASE_URL=https://weshare.orengen.io \
WESHARE_API_KEY=... PARTNER_CODE=P... \
bash scripts/test-purchase-loop.sh
```
Then: submit a test application on `/partners/apply` (expect admin email + GHL contact), and open `/s/PCODE?dest=/get-started` in a private window → checkout button reaches Stripe. Chain witnessed, engagement at 100% → rotate the Coolify token.

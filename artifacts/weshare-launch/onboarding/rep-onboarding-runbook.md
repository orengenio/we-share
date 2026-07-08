# Rep Onboarding & Operations Runbook — OrenGen Sales Partners

Instantiated 2026-07-08 (Mode O). Replaces the ephemeral runbook lost with the prior session. **Never onboard from memory — run this list per rep.** Status column = what the system does automatically today vs. what's manual vs. gap.

## Stage 0 — Recruit (funnel, pre-system)

| Step | How | Status |
|---|---|---|
| Application received | GHL form → tag `WS Rep Applicant`, pipeline New | ⚙️ auto once funnel built (see `funnel/ghl-element-map.md`) |
| Intro + certification role-play booked | GHL calendar | ⚙️ auto once calendar built |
| Interview verdict | Human call — Handbook §6 role-play, skeptical-plumber scenario | 👤 manual (by design) |
| Approved → registration link sent | GHL workflow `WS Rep — Approved` → `weshare.orengen.io/register?type=PARTNER` (+`&leader=CODE`) | ⚙️ auto once workflow built |

## Stage 1 — Register (Day 0)

| Step | How | Status |
|---|---|---|
| Account + partner code created | `/register?type=PARTNER`; leader upline honored via code | ✅ live |
| Welcome email (next-steps rail) | Fires on registration via GHL sending (crm.orengen.com — warmup stage 1, watch daily caps) | ✅ live |
| Synced to GHL as tagged contact | `syncPartnerToGHL`, `partner.registered` webhook event | ✅ live |
| Sign docs — Payment Authorization / Contractor Tax | **GAP — blocked on W-9-vs-Stripe decision.** Stripe Express collects tax info + issues 1099; decide if a separate signed doc is still wanted. Doc draft: §Appendix A | 🔶 decision open |

## Stage 2 — Payouts (Day 0–1)

| Step | How | Status |
|---|---|---|
| Stripe Connect Express onboarding | Dashboard → Settings; hosted onboarding | ✅ live |
| "Payouts live → certification next" email | Fires once on the pending→enabled flip | ✅ live |

## Stage 3 — Certify (Day 1–3)

| Step | How | Status |
|---|---|---|
| Certification role-play (if not done at interview) | Handbook §6 armory; pass = cleared to sell | 👤 manual (by design) |
| Admin marks Certified | Admin → Partners → Certify (email fires once) | ✅ live |
| Admin assigns A2P company number | Admin → Partners → Assign # (prompt) → "your number is ready" email + dashboard display | ✅ live (number itself provisioned manually in GHL Phone System; A2P campaign approval takes **days** — set expectation at interview, in writing) |
| CRM access granted | **GAP — blocked on access-model decision** (shared limited seat vs. per-rep seat). Reps already see their own pipeline in WeShare, so not hard-blocked | 🔶 decision open |

## Stage 4 — Leads on (Day 3–7)

| Step | How | Status |
|---|---|---|
| Admin unlocks leads | Admin → Partners → Unlock ("you're in rotation" email: the 4-Hour Rule + CRM hygiene) | ✅ live |
| Lead assigned | Admin → Leads → assign (email: 4-hour clock) · 4h SLA tracked, breach alert, recycling | ✅ live |
| Self-sourced prospects | Register-a-Prospect + CSV import; ownership-by-entry, claim protection; GHL contact+opportunity tagged to rep | ✅ live |
| Personal tracking link | `/s/<code>` + custom campaign links (Partner → Links) | ✅ live |

## Stage 5 — Close & get paid (ongoing)

| Step | How | Status |
|---|---|---|
| Deal Won | Rep marks Won (GHL stage syncs) or payment event lands | ✅ live — ⚠️ policy open: GHL-Won mints a conversion without payment (dedupe-protected; commissions still gated by NET-15 maturity + admin approval) |
| Purchase attributed | Stripe webhook / GHL → `POST /api/v1/track/purchase` with `ws_partner_code` (needs `WESHARE_API_KEY` env) | ✅ code live; 🔶 GHL workflow + env pending |
| Commission created | 25% setup ($249.25) + 25% residual ($61.75/mo), NET-15 maturity, clawback-protected (incl. paid-refund netting) | ✅ live |
| Customer order confirmation | "Your build starts now" email on checkout | ✅ live |
| Payout | Admin payout run (auto-matures first) → Stripe transfer → payout email | ✅ live |
| Retention save call | Cancellation signal → rep notified (highest-percentage save is the closer who sold them) | 🔶 partial — wire `customer.subscription.deleted` to a rep alert (small code task) |

## Operating rules (rep-facing, enforce always)

- **The 4-Hour Rule:** first touch within 4 hours or the lead recycles.
- Same-day CRM logging; the CRM record is the commission record.
- Sell the website only ($997 + $247/mo). Never discuss commissions, upsells, add-ons with prospects. No income claims. Consented SMS only, 8am–9pm local, STOP honored instantly.
- Exit in good standing = lifetime residuals continue. Termination for cause = forfeiture. (Handbook §10–11.)

## Gap list (priority order)

1. `WESHARE_API_KEY` env + GHL purchase workflow → full attribution loop live (test: `scripts/test-purchase-loop.sh`).
2. Recruitment funnel pages + 6 workflows in GHL (owner clicks; copy ready in `funnel/`).
3. Decisions: W-9 doc · CRM access model · GHL-Won conversion policy.
4. Cancellation → rep save-call alert (small code task, no migration).
5. Sending-domain warmup: respect stage-1 daily caps before bulk onboarding emails.

## Appendix A — Payment Authorization / Contractor Tax (draft, pending decision #1)

> I, [Partner Name], operating as an independent contractor (not an employee), authorize OrenGen Worldwide LLC to remit commission payments to my connected Stripe account. I understand: (1) I am responsible for my own taxes; OrenGen will report payments as required (Form 1099 issued via Stripe where thresholds are met); (2) commissions mature on a NET-15 hold and are subject to clawback on customer refund within 30 days; (3) my W-9 information is collected and held via Stripe Connect onboarding [OR: attached separately — per decision]; (4) residual commissions continue per Handbook §10 upon exit in good standing.
> Signed · Date · Partner Code

*(Have counsel review before first use — standard practice for contractor payment docs.)*

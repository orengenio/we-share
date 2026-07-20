# STATE — WeShare Launch (Mode O)

**Engagement:** weshare-launch · OrenGen internal (Mode O — Brand Guard constants verbatim)
**Phase:** BUILD → LAUNCH prep
**Updated:** 2026-07-08 (SOVEREIGN v3 absorbed — see registers below)

## SOVEREIGN v3 capability register (absorbed 2026-07-08, PR #39)

| Command | Does | OrenGen invokes when |
|---|---|---|
| `/og-products` | Digital Product Factory: price-laddered packaged products, GHL+Stripe-first, 7-day launch cadence | Template-stripping engagement artifacts into SKUs; pricing-band checks |
| `/og-apps` | App Revenue Channel: 2-of-4 bid/no-bid gate before any native build | Whenever a native app is contemplated (default: web-on-Coolify wins) |
| `/og-capture` | RFP Capture: Shipley compliance-matrix proposals, review gates, negotiation floors, >$10k → /og-board | Govcon/enterprise RFPs; rep negotiation-floor doctrine |
| `/og-grants` | Grant Acquisition: eligibility-first bid/no-bid, pre-signature award inspection | Non-dilutive funding scans |
| `/og-legal` | Legal Support Machine: contract risk maps, case prep — mandatory ATTORNEY REVIEW gate, hard UPL guardrail | Any contract/terms/consent artifact |
| `/og-executive` | Fractional Executive Machine: execution diagnosis, choice cascade, cadence packs | Fractional C-suite offers; board-ready strategic framing |
| `/og-systems` | Systemization Machine: owner/SOP/SLA per chain link, founder-independence scoring, **Osterwalder gate on all new offers** | SOP-ifying ops; pre-launch offer validation |
| `masters-library.md` | Registry of modeled masters — patterns mandatory, voices banned, no implied endorsement | Standing constraint on all content |

## v3 artifact-impact verdict

- **GATE FAILURE → logged below:** Contractor Agreement live with Attorney Review pending (Mode 23 makes it mandatory). Risk map produced: `legal/contract-risk-map.md`.
- **CONDITIONAL HOLD:** `funnel-architecture.md` [PROPOSED] pricing — Mode 25's Osterwalder gate requires a value-proposition canvas per service before pricing goes live; owner sign-off alone no longer suffices.
- **CLEAN:** emails, both funnels, runbook, Call Armory, commission engine — no gate they passed has changed.

## Attorney-review log (Mode 23 gate record)

| Artifact | Status | Opened | Notes |
|---|---|---|---|
| Partner Payment Authorization & Contractor Agreement v1-2026-07-08 | **SUPERSEDED by v2** | 2026-07-08 | Risk map at `legal/contract-risk-map.md` drove the v2 fills. |
| Sales Representative Agreement v2-2026-07-09 (live in-app + `/partner-agreement`) | **CLOSED — owner-confirmed 2026-07-11 (Andre Mandel)** | 2026-07-09 → closed 2026-07-11 | Owner supplied an attorney-reviewed template; filled per `legal/sales-representative-agreement.md` (Appendix A lists every fill/addition). v2 closes risk-map V1 (cause defined), G1–G3 (via ToS incorporation). **Both flagged items confirmed by Andre Mandel on 2026-07-11:** (#9) the uncapped lifetime-residual obligation on good-standing exit is accepted as written and matches the published promise; (#10) incorporation-by-reference of the ToS (TX law/Tarrant County arbitration/liability cap/indemnity) + Handbook is accepted as sufficient. Re-acceptance is version-aware — v1 acceptors re-accept v2. |

## v3 unlocked queue (ranked)

1. ✅ Contract risk map (done — above; counsel send = Andre)
2. Osterwalder canvases ×7 services (blocked on [CONFIRM] scopes; OrenWeb canvas can lead)
3. Pricing decision memo w/ Mode 19 band pressure-test
4. Negotiation floors + battlecard addendum (post-pricing)
5. SOP library for commission-engine human edge cases
6. Template-strip artifacts into product SKUs (WeShare reps as distribution)

## Active deliverables & gate log

| Asset | Edge Score | Guard pass | Status |
|---|---|---|---|
| Onboarding email set (7 emails, `src/lib/email.ts`) | 8/10 | ✅ (forbidden-phrase lint clean, Trusted Counselor, no earnings claims to prospects) | SHIPPED in code |
| Rep recruitment funnel (`funnel/`) | 8/10 | ✅ (comp facts + FTC disclaimer block; "Referral Partner" on SMS-adjacent lines) | READY — needs GHL build (owner clicks) |
| Rep Onboarding & Ops Runbook (`onboarding/`) | n/a (internal SOP) | ✅ | READY |
| Purchase-loop e2e test (`scripts/test-purchase-loop.sh`) | n/a | n/a | READY — needs WESHARE_API_KEY + run from allowed network |

## Decisions register (delegated to Claude 2026-07-08, executed)

| Decision | Call | Basis |
|---|---|---|
| GHL-Won mints conversion without payment? | **No — env-gated `GHL_WON_CREATES_CONVERSION`, default off.** Commissions follow money; GHL payment workflows call `/api/v1/track/purchase`. Flip the env only if GHL payments can't reach that path. | Money-integrity: stage moves are process, payments are revenue. |
| Rep GHL access model | **(B) Individual limited seats per rep**, provisioned at certification: role User, "Only Assigned Data" ON, permissions = Contacts + Conversations + Calendars only. Shared logins kill audit trails, per-user CRM hygiene, and A2P accountability, and expose the full pipeline on rep exit. `crmSeatGrantedAt` already exists to track it. | GHL supports assigned-data-only visibility; industry practice for commission reps. |
| W-9: separate doc vs Stripe | **Stripe covers tax identity** — Connect Express collects certified W-9/TIN at payout onboarding and 1099s issue through Stripe. The app records the **contractual** acknowledgment instead: Payment Authorization & Contractor Agreement, in-app accept (banner + modal → `w9Submitted` + audited timestamp/version). No duplicate PII stored. | Stripe Connect W-8/W-9 + 1099 product; PII minimization. |
| Customer upsell pricing | **Proposed, not locked** — full ladder with [PROPOSED] anchors in `funnel-architecture.md`; revenue pricing stays Andre's signature. | Pricing = business call; proposals ready to react to. |

## Pending approvals (approval queue)

- Recruitment funnel copy → Andre sign-off before GHL build.
- `funnel-architecture.md` [PROPOSED] prices + [CONFIRM] scopes → Andre, then full customer funnel copy packs get written.

## Known blockers

- Session network policy blocks `weshare.orengen.io` + `backoffice.orengen.io` → live test + Coolify env writes need allowlisting or owner-run.
- W-9 vs Stripe decision gates the "sign docs" email + runbook §3 doc pack.

## Next actions

1. Andre: paste env block into Coolify (incl. `WESHARE_API_KEY`) + redeploy.
2. Andre: approve funnel copy → build pages in GHL per `funnel/ghl-element-map.md`.
3. Run `scripts/test-purchase-loop.sh` end-to-end; log result here.
4. First live close → write winning lines to `winners-library.md`.

## Voiceprint (Mode O — seeded from Brand Guard + Handbook §6)

- **Signature moves:** long-setup/short-punch rhythm · name the uncomfortable thing out loud ("this is a cold call — you can hang up") · receipts-first claims (exact dollars, exact days) · the named-enemy turn.
- **Named mechanisms:** the Mockup Close™ · the 4-Hour Rule (first-touch SLA) · Close Once, Paid Monthly (lifetime residual model) · your Book of Business.
- **Enemy + stakes:** dependency — rented visibility for customers; one-and-done commission jobs for reps.
- **Never-say swaps:** "opportunity" → "the math" · "join our team" → "claim a territory of work" · "passive income" → "residuals you already earned".

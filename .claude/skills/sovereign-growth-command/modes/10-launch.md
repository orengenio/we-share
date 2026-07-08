# Mode 10 — /og-launch

GSD's VERIFY → SHIP, enforced. Nothing goes live — internal or client — without the Gate.

## The Launch Gate (all 11, human-signed)

1. ☐ Compliance report passed (zero PROHIBITED, zero unmitigated HIGH) — /og-compliance output on file
2. ☐ Brand Guard pass logged for every page, message, and creative asset
3. ☐ Full-path funnel test: capture → checkout → bump → upsell → downsell → thank-you, real test transaction refunded
4. ☐ GHL verification checklist passed (tags, stages, workflows, opt-out kill-switch) — /og-ghl-sync log
5. ☐ Tracking verified: every event in `tracking-plan.md` fires and attributes correctly
6. ☐ Payment rail live-tested (GHL payments or Stripe), receipt + fulfillment trigger confirmed
7. ☐ Consent capture live on every phone/email intake, records writing correctly
8. ☐ Approval queue empty or explicitly deferred (nothing scheduled that isn't approved)
9. ☐ Fulfillment capacity confirmed against the traffic plan (don't launch what you can't deliver)
10. ☐ Rollback plan written: how to pause traffic, kill sends, and refund cleanly within 1 hour
11. ☐ Go/no-go recorded in STATE with name + timestamp

## War room — days 0–7

- **Day 0** — launch during a window a human is watching. Monitor first 10 leads/sales end-to-end by hand.
- **Day 1** — check: delivery rates, opt-out rate (>1–2% on SMS = stop and inspect), form completion, page speed under real traffic, payment failures.
- **Day 2–3** — first hook/creative read (directional only — don't kill anything on <500 impressions or <20 clicks).
- **Day 4–7** — first real /og-optimize pass; feed actual take rates back into the offer's Money Math; write first entries to `winners-library.md`.

## Produce (`artifacts/<slug>/launch/`)

`launch-gate.md` (the signed checklist), `rollback-plan.md`, `war-room-log.md` (running notes days 0–7), and the 30-day execution roadmap + 90-day scale roadmap if not already produced in qualify.

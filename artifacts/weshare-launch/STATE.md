# STATE — WeShare Launch (Mode O)

**Engagement:** weshare-launch · OrenGen internal (Mode O — Brand Guard constants verbatim)
**Phase:** BUILD → LAUNCH prep
**Updated:** 2026-07-08

## Active deliverables & gate log

| Asset | Edge Score | Guard pass | Status |
|---|---|---|---|
| Onboarding email set (7 emails, `src/lib/email.ts`) | 8/10 | ✅ (forbidden-phrase lint clean, Trusted Counselor, no earnings claims to prospects) | SHIPPED in code |
| Rep recruitment funnel (`funnel/`) | 8/10 | ✅ (comp facts + FTC disclaimer block; "Referral Partner" on SMS-adjacent lines) | READY — needs GHL build (owner clicks) |
| Rep Onboarding & Ops Runbook (`onboarding/`) | n/a (internal SOP) | ✅ | READY |
| Purchase-loop e2e test (`scripts/test-purchase-loop.sh`) | n/a | n/a | READY — needs WESHARE_API_KEY + run from allowed network |

## Pending approvals (approval queue)

- Recruitment funnel copy → Andre sign-off before GHL build.
- GHL-Won-creates-conversion policy (env-gate or keep) — decision open.

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

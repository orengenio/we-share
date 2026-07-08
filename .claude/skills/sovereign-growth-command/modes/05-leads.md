# Mode 05 — /og-leads

The evolving lead engine. Requires: profile categories D and G. Scoring rules: `references/lead-scoring-rubric.md`. Channel legality: `references/compliance-rules.md` — classify every source before touching it.

## Source registry (classify each: official API / approved partner / manual-assisted / PROHIBITED)

- **Inbound**: GHL forms, GHL webhooks, website forms, quiz/survey funnels, content CTAs, GBP.
- **Imported**: CSV lists (verify consent provenance before any outreach), existing contact lists.
- **Researched**: Google Maps/business data where API-compliant, directory research, provided-URL website extraction, government portals (Tango MCP when connected — hand to /og-opportunities for govcon).
- **Social**: LinkedIn prospecting = manual-assisted (no automation against ToS), X/social listening where API-permitted, DM outreach only with human approval per message batch.
- **Partner**: referral partners, affiliates/sales agents (use "Referral Partner" vocabulary on all carrier-adjacent surfaces), strategic partnerships.

Anything requiring login-wall scraping, purchased lists of unknown consent, or rate-limit evasion → PROHIBITED, logged, not argued with.

## Pipeline per lead

intake → enrich (site, socials, firmographics) → classify industry → dedupe → score (10 dimensions, rubric) → grade A–F → route:

- **A** → outreach draft + follow-up cadence → **approval queue** (never auto-send)
- **B** → nurture sequence assignment
- **C** → low-priority pool, quarterly re-score
- **D** → disqualified with reason logged
- **F** → do-not-contact registry (compliance-fail or explicit opt-out)

## Produce (`artifacts/<slug>/leads/`)

`lead-source-map.md` · `lead-list.csv` (scored + graded) · `outreach-approval-queue.md` (draft + channel + consent basis + risk rating per message) · `follow-up-cadence.md` · `ghl-lead-routing-map.md` (grade → pipeline stage + tags + workflow).

## Personalization standard

Every A-grade outreach draft references one specific, verifiable fact about the lead (their site, review, posting, award). Generic blasts are what SOVEREIGN exists to kill.

## Evolution rule

After every 25 closed outcomes (won or lost), /og-optimize adjusts scoring weights and this mode re-grades the active pool. Log every weight change in `winners-library.md` with the evidence.

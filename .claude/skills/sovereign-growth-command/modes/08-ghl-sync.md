# Mode 08 — /og-ghl-sync

Turn everything upstream into a GoHighLevel white-label implementation. Requires: profile category F + the funnel's `ghl-element-map.md`. API details, auth, and MCP contract: `references/ghl-api-map.md`.

## Law 2 applies

GHL is the CRM, the pipeline, the form engine, the calendar, the conversation layer, and (where enabled) the payment rail. Do not build or recommend parallel systems. The client library is a thin adapter interface — swappable by design, GHL-targeted in fact.

## Execution paths (pick by environment)

1. **GHL MCP / API connected** → execute directly: create pipelines, custom fields, tags, calendars; wire webhooks. Every write action is listed to the human for approval *before* execution (dry-run summary → approve → execute → verify → log).
2. **Not connected** → emit the **build-spec pack** below: import-ready JSON + a step-by-step manual install guide. Same pattern as Automation Architect v1.1.
3. **Beyond GHL-native capability** → emit n8n import-ready workflow JSON as the sanctioned bridge (GHL webhook → n8n → action), using Automation Architect output standards. Document the bridge in the blueprint.

## Produce (`artifacts/<slug>/ghl/`)

- `ghl-implementation-blueprint.md` — the master doc: sub-account/location, everything below in order, verification checklist.
- `ghl-pipeline.json` — pipeline + stages mapped 1:1 to the sales process from /og-structure.
- `ghl-custom-fields.json` — every field the funnel and scoring need, typed, with source noted.
- `ghl-tags.json` — full taxonomy: source tags, grade tags (A–F), funnel-event tags, consent tags, content-attribution tags.
- `ghl-workflows.md` — trigger → steps → exit, one per automation: form submit, booking, payment, bump/upsell/downsell events, abandoned checkout, no-show, nurture, opt-out handling, partner-commission event (webhook → n8n → ledger, WeShare pattern).
- `ghl-message-templates.md` — every email/SMS template with merge fields, consent basis, opt-out line, and compliance risk rating attached. SMS templates pass the A2P vocabulary lint.
- `ghl-reporting.md` — dashboard spec matching the KPI set from /og-structure.

## Consent + attribution wiring (mandatory)

Consent fields (SMS / voice / email, each with source + timestamp) are custom fields, written on capture, checked by every outbound workflow as a hard condition. Attribution fields (UTM set, first/last source, content asset ID) write on capture so /og-optimize can trace revenue to the exact hook that started it.

## Verify step (GSD: nothing ships unverified)

After any build — MCP-executed or manually installed — run the verification checklist: test lead through every funnel path, confirm tags/stages/workflows fire, confirm opt-out kills all sequences, confirm payment events route bump→upsell→downsell→thank-you correctly. Log results in STATE. Failures block /og-launch. For new-client deliveries, this build runs inside the /og-onboard runbook — and every completed build gets generalized into a reusable snapshot per the Snapshot Doctrine (modes/18-onboard.md).

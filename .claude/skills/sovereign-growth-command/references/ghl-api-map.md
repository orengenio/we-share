# GHL API Map

The white-label operating layer. Official docs: `https://marketplace.gohighlevel.com/docs/` — **verify current endpoints, scopes, and rate limits there before writing integration code**; this map is orientation, not gospel.

## Auth modes

- **Private Integration Token** — per-location token, fastest path for owned sub-accounts. Store in runtime env only.
- **OAuth 2.0 app** — for multi-tenant/marketplace distribution; agency vs. location scopes differ. Refresh handling + scope minimization required.
- Always pin the **location (sub-account) ID** explicitly; never assume agency-level context.

## Core objects SOVEREIGN touches

contacts (+ custom fields, tags) · opportunities (+ pipelines/stages) · conversations (SMS/email/etc.) · calendars (+ bookings) · forms & surveys · payments (invoices/links where enabled; Stripe as alternate rail per profile) · workflows (triggered via native builders + inbound webhooks) · custom values · webhooks (inbound + outbound).

## MCP tool contract (when a GHL MCP/bridge is available, expose/use these)

`create_contact` · `update_contact` · `search_contacts` · `add_tag` · `remove_tag` · `create_opportunity` · `update_opportunity` · `create_conversation_message` · `create_calendar_booking` · `list_calendars` · `create_payment_link` · `handle_webhook_event` · `sync_lead_to_highlevel` · `sync_funnel_event_to_highlevel`

Operational requirements for any live execution: dry-run summary → human approval → execute → verify read-back → audit log entry. Retry with backoff on 429/5xx; respect documented rate limits; verify webhook signatures on every inbound event.

## Build-spec fallback (no live connection)

Emit the pack from modes/08-ghl-sync.md — `ghl-pipeline.json`, `ghl-custom-fields.json`, `ghl-tags.json`, `ghl-workflows.md`, `ghl-message-templates.md` — plus a numbered manual-install guide with screenshots-by-description ("Settings → Custom Fields → Add Field…"). The human installs; SOVEREIGN then runs the verification checklist against test leads.

## n8n bridge (sanctioned extension pattern)

When GHL-native workflows can't express the logic (multi-system joins, ledger writes, complex branching, external APIs): GHL webhook → n8n workflow → action, emitted as **n8n import-ready JSON** per Automation Architect v1.1 standards. The WeShare commission flow (GHL/Stripe webhooks → n8n → Postgres ledger) is the house reference implementation. Document every bridge in the blueprint so nothing becomes invisible plumbing.

## Adapter doctrine (Law 2, engineering form)

All GHL calls route through one thin client module with a neutral interface (`crm.createContact(...)` etc.). Today it has exactly one implementation: GHL. The interface exists so ownership is never hostage to a vendor — not so a second CRM sneaks in. Anyone proposing implementation #2 routes through /og-board first.

# Sanctifier Lead Router — import notes & corrections

Import `sanctifier-lead-router.json` at n8n (n8n.orenautomation.com) → New Workflow → paste/import. It receives Sanctifier's scraped-lead payload, has Claude write a one-sentence factual call hook, round-robins the lead across the state pool, and upserts it into GHL assigned to the right rep.

## What was corrected from the Google-AI draft (do not re-import the draft)

| Draft said | Corrected to | Why |
|---|---|---|
| Claude endpoint `https://anthropic.com` | `https://api.anthropic.com/v1/messages` | The draft URL isn't an API endpoint — calls would fail. |
| `"model": "claude-3-5-sonnet-20241022"` | `claude-sonnet-5` | Old model id; use the current generation. |
| GHL endpoint `https://leadconnectorhq.com` | `https://services.leadconnectorhq.com/contacts/upsert` + `Version: 2021-07-28` header + agency PIT bearer credential | The draft URL is not the API host and had no auth/version headers. |
| Switch node with 4 hardcoded states all wired to the same output | Code node with a per-state pool map + persistent round-robin | The draft's switch did nothing (every branch hit the same node) and couldn't do pools. Rotation index survives restarts via workflow static data. |
| Separate "Commission Split Engine" node computing 25/25/5 from Stripe webhooks | **Deliberately omitted** | WeShare already computes the full ledger — 25% setup, 25% residual, 5% leader override, $50 fast-start, 72-hour maturity, clawbacks — from Stripe/track-purchase events. Rebuilding it in n8n creates a second source of truth that will drift. n8n routes leads; WeShare owns money. (The draft's math also forgot to subtract the 5% override from corporate net.) |

## Before activating

1. Create two Header-Auth credentials and attach them: **Anthropic** (`x-api-key: <your key>`) on the Claude node; **GHL** (`Authorization: Bearer <agency-level PIT>`) on the GHL node.
2. Edit the `POOLS` map in the Code node — one line per state, listing the GHL **user IDs** of that pool's reps, plus `FALLBACK_ADMIN` for blank/misspelled states.
3. Create the six custom fields in GHL (Settings → Custom Fields, contact-level) with these exact keys: `lead_score`, `ssl_status`, `mobile_responsive`, `current_cms`, `instant_mockup_url`, `custom_hook`.
4. Point Sanctifier's export at `https://<your-n8n-host>/webhook/sanctifier-inbound-leads` (production URL — the workflow must be **Active**, or you'll get the "webhook not registered" 404).
5. The webhook currently has **no auth** — before going live, add Header Auth on the webhook node and send the matching secret header from Sanctifier (same lesson as the WeShare→n8n 403: n8n webhook auth must match what the sender actually sends).

## Related

- `weshare-partner-lifecycle.json` — existing partner lifecycle workflow (WeShare events → n8n).
- WeShare's outbound events (`partner.registered`, `partner.promoted_leader`, `commission.created`, …) are signed with `X-WeShare-Signature` (HMAC-SHA256) when a secret is set — verify inside n8n rather than relying on webhook-node Basic Auth.

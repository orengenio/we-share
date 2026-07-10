# GHL Setup Runbook — WeShare Partner Pipeline

**For:** Andre (owner). **Time:** one sitting, ~75–90 minutes. **Rule:** do it in this order — later steps depend on earlier ones. Nothing here requires judgment calls; every decision is already made.

**Have open before you start:** GHL location `dMEB004RUX8JRRi42Kzq` (sub-account, not agency view), Coolify (for env values), your Google account. The **WeShare Partner Pipeline** (`5kXJgKVijokWag4enbJ5`) already exists with stages New / Contacted / Appointment / Proposal / Won / Lost / Nurture — these map 1:1 to the `GHL_STAGE_NEW|CONTACTED|APPOINTMENT|PROPOSAL|WON|LOST|NURTURE` envs. Don't rename stages; the app syncs by stage ID.

---

## Part 1 — Custom fields (do first; everything writes into these)

**Path:** Settings → Custom Fields → **+ Add Field** → object: Contact.

Create all 11 as **Single Line** text (the app writes string values by key; a mismatched type or missing key gets silently dropped). After saving each, click the field and confirm its **Unique Key** matches the table exactly — the key, not the label, is what the API writes to.

| # | Unique Key | Label (suggested) | Holds |
|---|---|---|---|
| 1 | `ws_affiliate_code` | WS Affiliate Code | Referral Partner tracking code |
| 2 | `ws_partner_code` | WS Partner Code | Sales Partner code (drives commission attribution) |
| 3 | `ws_rep_city_state` | WS Rep City/State | Application: location |
| 4 | `ws_rep_experience` | WS Rep Experience | Application: commission experience answer |
| 5 | `ws_rep_sold_what` | WS Rep Sold What | Application: what they've sold |
| 6 | `ws_rep_hours` | WS Rep Hours/Week | Application: availability |
| 7 | `ws_rep_objection_answer` | WS Rep Objection Answer | Application: "think about it" answer |
| 8 | `ws_rep_start` | WS Rep Start Timing | Application: when they can start |
| 9 | `ws_rep_referrer` | WS Rep Referrer | Leader code, if someone sent them |
| 10 | `ws_consent_service_at` | WS Consent Service At | Timestamp: service-communication consent |
| 11 | `ws_consent_sms_mkt_at` | WS Consent SMS Mkt At | Timestamp: SMS marketing consent — **empty = no marketing SMS, ever** |

---

## Part 2 — The six workflows (exact order; kill-switch first)

**Path for each:** Automation → Workflows → **+ Create Workflow** → Start from Scratch. Publish each before starting the next. All SMS copy says **"Referral Partner"** or **"Sales Partner"** — never "Affiliate" — and every marketing SMS ends with "Reply STOP to opt out."

### Workflow 1 — `WS — STOP kill-switch`
| Piece | Setting |
|---|---|
| Trigger | Customer Replied → filter: Reply Channel = SMS, Message Body contains `STOP` (add branches/filters for `UNSUBSCRIBE`, `QUIT`, `CANCEL`, `END`) |
| Actions | 1. Contact → Enable DND (all channels). 2. Remove From All Workflows. 3. Add Tag `WS Opt-Out`. |
| Also | Confirm Settings → Business Profile → default SMS compliance (STOP/HELP handling) is ON. |

Nothing else ships until this is live. Every message rail below assumes this net exists.

### Workflow 2 — `WS Rep — Application Received`
The app (not a GHL form) creates the contact, writes the fields, adds the tag, and files the opportunity at **New** (`GHL_STAGE_NEW`). This workflow only messages.

| Piece | Setting |
|---|---|
| Trigger | Contact Tag Added = `WS Rep Applicant` |
| Settings | Allow re-entry: OFF. Goal: this workflow ends when tag `WS Rep Interview Booked` is added. |
| Action 1 | Send Email — application-received confirm, with interview booking link. From: OrenGen Team / team@crm.orengen.com. |
| Action 2 | If/Else — `ws_consent_sms_mkt_at` **is not empty** → send SMS confirm + booking link ("Referral Partner" wording, STOP line). Else: skip. No consent, no SMS — no exceptions. |
| Action 3 | Wait 24h → If tag `WS Rep Interview Booked` not present → nudge email with booking link. |
| Action 4 | Wait 48h more (72h total) → same check → final nudge email. |

### Workflow 3 — `WS Rep — Interview Reminders`
| Piece | Setting |
|---|---|
| Trigger | Appointment Booked → filter: Calendar = **OrenGen Partner Intro** |
| Actions | 1. Add Tag `WS Rep Interview Booked`. 2. Update Opportunity → WeShare Partner Pipeline, stage **Appointment** (`GHL_STAGE_APPOINTMENT`). 3. Remove From Workflow → `WS Rep — Application Received`. 4. Wait → Event/Appointment Time, **24 hours before** → reminder email; If/Else `ws_consent_sms_mkt_at` not empty → reminder SMS. 5. Wait → Appointment Time, **1 hour before** → short reminder email; same consent-gated SMS. |

### Workflow 4 — `WS Rep — No-show`
| Piece | Setting |
|---|---|
| Trigger | Appointment Status = No Show → filter: Calendar = OrenGen Partner Intro |
| Actions | 1. Add Tag `WS Rep No-Show`. 2. Send Email — **one** rebook invitation with the calendar link (consent-gated SMS twin). 3. Wait 72h. 4. If tag `WS Rep Interview Booked` was not re-added (no new booking) → Update Opportunity → stage **Nurture** (`GHL_STAGE_NURTURE`). |
| Rule | One rebook offer. It does not loop, and it does not chase. |

### Workflow 5 — `WS Rep — Approved` (manual — you fire it after the interview)
| Piece | Setting |
|---|---|
| Trigger | Contact Tag Added = `WS Rep Approved` (you add this tag on the contact) |
| Actions | 1. Send Email with registration link: `https://weshare.orengen.io/register?type=PARTNER` — and if `ws_rep_referrer` holds a leader code, use `https://weshare.orengen.io/register?type=PARTNER&leader={{contact.ws_rep_referrer}}`. 2. Update Opportunity → stage **Proposal** (`GHL_STAGE_PROPOSAL`). 3. Remove From Workflow → Application Received and Interview Reminders. |
| Handoff | Once they register, the app owns the sequence (welcome → Stripe → certification → leads). GHL goes quiet on this contact by design. |

### Workflow 6 — `WS Rep — Declined` (manual)
| Piece | Setting |
|---|---|
| Trigger | Contact Tag Added = `WS Rep Declined` (you add this tag) |
| Actions | 1. Send close-out email — respectful, door stays open. 2. Update Opportunity → **Lost** (`GHL_STAGE_LOST`). 3. Remove From All Workflows. |

---

## Part 3 — Calendar: "OrenGen Partner Intro"

1. **Calendars → Calendar Settings → + New Calendar** → Event/Simple calendar. Name: `OrenGen Partner Intro`. Duration: **15 minutes**. Set your availability windows and a 15-min buffer between events.
2. **Connect Google:** Settings → My Profile → Calendar Settings → **Connect Google Calendar** → sign in → set it as the **primary calendar for two-way sync** and check it under **conflict/blocked calendars** so a busy Google slot never gets booked.
3. Open the calendar → copy the **booking link (permalink)**.
4. **Coolify → weshare app → Environment Variables:** paste it as `NEXT_PUBLIC_PARTNER_CALENDAR_URL`, then **redeploy** (env changes only apply on redeploy). Until this is set, `/partners/thanks` falls back to "watch your inbox" — booking is dark.

---

## Part 4 — Inbound webhook (GHL → WeShare stage sync)

The app endpoint `https://weshare.orengen.io/api/webhooks/ghl` requires header `x-ghl-signature` = **HMAC-SHA256 (hex) of the raw request body**, keyed with `GHL_WEBHOOK_SECRET`. GHL's native webhook action sends only static headers — it can't compute an HMAC — so route it through n8n (the sanctioned bridge). Fifteen minutes, once:

1. **GHL workflow** `WS — Sync to WeShare`: two triggers — **Opportunity Stage Changed** (filter: WeShare Partner Pipeline) and **Contact Changed**. Single action: **Custom Webhook** → POST `https://n8n.orengen.io/webhook/ghl-sync` (include all trigger data).
2. **n8n**, three nodes: **Webhook** (path `ghl-sync`) → **Code/Crypto** (build the body below as a string, compute `HMAC-SHA256(bodyString, GHL_WEBHOOK_SECRET)` hex) → **HTTP Request**: POST `https://weshare.orengen.io/api/webhooks/ghl`, headers `Content-Type: application/json` and `x-ghl-signature: <hmac>`, body = the exact same string you signed.
3. Body shape the endpoint parses — `type` is `"OpportunityStageUpdate"` for stage moves, `"ContactUpdate"` for contact edits:

```json
{ "type": "OpportunityStageUpdate", "locationId": "dMEB004RUX8JRRi42Kzq",
  "data": { "id": "<ghl opportunity id>", "pipelineId": "5kXJgKVijokWag4enbJ5",
            "pipelineStageId": "<new stage id>", "status": "open" } }
```

Without this, moves you make inside GHL never reach the WeShare dashboard.

## Part 5 — Purchase reporting (GHL payment → commission ledger)

Commissions follow money, so `GHL_WON_CREATES_CONVERSION` stays `false` — dragging a card to Won mints nothing. When a payment succeeds in GHL, report it:

**Workflow** `WS — Purchase → WeShare`: Trigger **Payment Received** (or Order Submitted / Invoice Paid — whichever rail collected). Action: **Custom Webhook** → POST `https://weshare.orengen.io/api/v1/track/purchase`, headers `Content-Type: application/json` and `X-WeShare-Api-Key: <WESHARE_API_KEY from Coolify — must be set or the endpoint is dead>`. Body, exactly:

```json
{ "email": "{{contact.email}}", "amount": 1244, "type": "SETUP_FEE",
  "partnerCode": "{{contact.ws_partner_code}}" }
```

| Payment | `amount` | `type` |
|---|---|---|
| Standard close, day one ($997 setup + $247 first month) | `1244` | `SETUP_FEE` |
| Each recurring month | `247` | `MONTHLY_MAINTENANCE` |

The app does all the math — 25% + 25% lifetime rep commission ($249.25, then $61.75/mo on the standard close) and NET-15 maturity. GHL reports the money fact; nothing else. The endpoint is idempotent (one SETUP_FEE per client, one MONTHLY per client-month), so a double-fire won't double-pay — but build the trigger clean anyway.

## Part 6 — Sending identity + warmup pacing

1. **Settings → Email Services → Dedicated Domain (`crm.orengen.com`) → Header:** it currently reads "Name/Email not provided." Set **Name: OrenGen Team**, **Email: team@crm.orengen.com**, save. Every workflow email above sends from this identity.
2. **Warmup:** the domain is **Stage 1** with daily send caps. Transactional volume (confirmations, reminders) is fine; hold all bulk/marketing sends until GHL shows the warmup has progressed. Diary note: after 2–4 clean weeks, tighten DMARC from `p=none` to `p=quarantine` in Cloudflare.

---

## Verification — run all 10 before calling it live

| # | Check | Pass looks like |
|---|---|---|
| 1 | Settings → Custom Fields | All 11 fields present, Unique Keys exactly as Part 1 |
| 2 | Submit a test application at `/partners/apply` (your own mobile, SMS consent ON) | Contact created, tag `WS Rep Applicant`, ws_* fields populated |
| 3 | Same test contact | Opportunity in WeShare Partner Pipeline at **New** |
| 4 | Inbox | Confirmation email from OrenGen Team <team@crm.orengen.com> — not "not provided" |
| 5 | Phone + a second test with consent OFF | SMS arrives on consented test only; wording says "Referral Partner"; STOP line present |
| 6 | Book a slot on OrenGen Partner Intro | Tag `WS Rep Interview Booked`, stage → **Appointment**, event appears in Google Calendar (and a Google busy block prevents double-booking) |
| 7 | Open the contact's workflow enrollment | Interview Reminders enrolled, sitting at the 24h-before wait step |
| 8 | Reply STOP to the test SMS | DND set, contact removed from every workflow, tag `WS Opt-Out` |
| 9 | Drag the test opportunity to another stage | n8n executes, WeShare admin webhook log shows the GHL event, lead status updates |
| 10 | `BASE_URL=https://weshare.orengen.io WESHARE_API_KEY=... PARTNER_CODE=P... bash scripts/test-purchase-loop.sh` | Exactly one SETUP_FEE ($249.25 commission) and one MONTHLY ($61.75), both maturing NET-15; duplicates rejected |

Ten for ten, and the pipeline is live end to end. Anything short of that, stop and fix the failing step before sending a single real applicant in.

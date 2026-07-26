# WeShare Partner Onboarding Generator — GHL AI Studio Prompt Pack
**Reworked from the "2026 AI Business Generator" master prompt — repurposed from building a customer business to onboarding OrenGen Sales Partners.**

**Key change from the original:** the ChatGPT middle-step is deleted. The original had you paste a master prompt into ChatGPT to *generate* three GHL prompts. Below are the **three final prompts, already generated and filled with the real WeShare program** — copy each straight into the matching GHL AI tool. (A blank re-runnable master template is at the end if you ever want to regenerate.)

---

## ⚠️ Capability map — read this first
Verified against GoHighLevel's official API spec and help docs (July 2026):

| Piece of onboarding | Automatable? | How |
|---|---|---|
| Onboarding workflow (emails, SMS, waits, tags, 72-hour timers) | ✅ Yes — AI-generated | Paste **Prompt 1** into the Workflow AI Builder (Automation → Workflows → "Build using AI"). It generates the full multi-step draft; you review the to-do list it flags (pick email account, calendar, etc.) and hit publish. |
| Rep-facing AI assistant ("Luna for Partners") | ✅ Yes | **Prompt 2** into Conversation AI / Ask AI's Voice-agent setup — Ask AI can build Voice AI agents and Knowledge Bases with a confirm step. |
| Onboarding hub page | ✅ Yes, with a caveat | **Prompt 3** into AI Studio ("Vibe Coder"). Caveat: AI Studio pages live only inside AI Studio — they can't be moved into the Sites/Funnels builders, and you must explicitly tell it to connect any form/calendar. |
| **VoIP number purchase per rep** | ✅ **Yes — via API (n8n), not via AI prompts or workflows** | There is a documented buy endpoint: `POST /phone-system/numbers/location/{locationId}/purchase` (+ an availability search endpoint that filters by area code = local presence per state). No workflow action or AI tool can buy numbers. The **Rep Provisioner** n8n workflow below does it automatically. |
| **Rep user seat creation (locked-down permissions)** | ✅ **Yes — via API (n8n)** | `POST /users/` with the granular permissions object — `assignedDataOnly: true`, bulk actions off, no funnels/settings/workflows access — exactly the decision-B seat template, created programmatically. Ask AI cannot create users. |
| Number → rep assignment (inbound line) | ❌ **The one manual click** | LC Phone has no write API for user assignment. After the provisioner runs: Settings → My Staff → the rep → Call & Voicemail Settings → Inbound Number → pick their new number. ~15 seconds per rep. |
| Pipelines / custom fields creation | ❌ Manual or API | Ask AI can't create pipelines or custom fields — create the onboarding custom fields once by hand (list below) before running Prompt 1. |

**Two caveats from the docs:** (1) if "Enhanced Security" is enabled at agency level, API user-creation is blocked — toggle it if the seat call 403s; (2) first-time number purchases in a location can require one-time Persona/KYC verification in the UI — your location already buys numbers, so this should be cleared.

---

## PROMPT 1 — GHL AUTOMATION BUILDER (the onboarding master workflow)

==================================================
COPY & PASTE INTO GOHIGHLEVEL AUTOMATION BUILDER (AI)
==================================================

Build ONE centralized workflow named "WeShare Partner Onboarding — Master". Do not split into multiple disconnected workflows. This workflow onboards independent 1099 Sales Partners for OrenGen Worldwide LLC (brand: WeShare, portal: weshare.orengen.io). Voice for every message: warm, direct, professional — a trusted counselor, never hype. Every SMS ends with "Reply STOP to opt out."

TRIGGER: Inbound Webhook (this workflow starts when the WeShare platform fires its partner.registered event) OR Tag Added = "Partner: New".

STEP 1 — CONTACT SETUP. Create/update the contact. Add tags: "Sales Partner", "Onboarding: Started", "Pool Request: {{contact.state}}". Set custom field "onboarding_stage" = "provisioning".

STEP 2 — WELCOME EMAIL (immediate). Subject: "Welcome to WeShare — your next 3 steps". Body must cover, in this order: (1) accept the Sales Representative Agreement in the WeShare dashboard; (2) connect Stripe from the dashboard so Friday payouts can reach them; (3) heads-up that their CRM seat + local phone number arrive after certification, and that once provisioned, the 72-hour activation window applies. State the comp facts exactly: 25% of setup fee + 25% monthly residual for the life of the client; $50 fast-start bonus on the first settled deal; commissions lock 72 hours after the client's payment clears; paid every Friday via Stripe. Add this line verbatim at the end: "Commissions are earned solely on completed, paid customer sales; results depend on individual effort and are not a guarantee of income."

STEP 3 — WAIT for Tag "Partner: Certified" (added when they pass the role-play certification). If not certified within 7 days → send one nudge email ("your certification call is the only thing between you and live leads") and notify admin.

STEP 4 — PROVISIONING NOTICE. When Tag "Partner: Certified" is added: set "onboarding_stage" = "provisioned", notify admin (internal notification: "Provision CRM seat + local number for {{contact.name}} — state pool {{contact.state}}"), and WAIT for Tag "Partner: Number Assigned".

STEP 5 — THE NUMBER EMAIL + SMS. When Tag "Partner: Number Assigned" is added, send email "Your line is live — the 72-hour window is open" containing: their assigned number (custom field "assigned_voip_number"), login link to the portal, where the scripts live (Handbook §6 + in-CRM script library), and the software-access clause framed exactly like this: "To keep your company-funded seat, line, and lead feed active, log your first outbound dials within 72 hours of this email. This is a software-access condition, not a work schedule — your hours are always your own." Send a matching short SMS. Start a 48-hour wait.

STEP 6 — 48-HOUR CHECK. If custom field "first_dial_logged" is still empty at hour 48 → send the reminder SMS: "Your WeShare seat goes inactive in 24h if no dials are logged. Everything you need is in your dashboard. Reply STOP to opt out." At hour 72 with no dials → add Tag "Seat: Revoked - Inactive", set onboarding_stage = "revoked", notify admin to release the seat and trigger the waitlist blast.

STEP 7 — ACTIVATION COMPLETE. When "first_dial_logged" is set → add Tag "Partner: Active", set onboarding_stage = "active", send the congratulations email pointing at their state-pool Hot Opportunities list, and stop the timers.

Also handle: Tag "Partner: Promoted Leader" (fired by the WeShare platform at 5 settled deals) → send the Leadership Addendum for e-signature and the "you've unlocked 5% team overrides" email — facts: they keep their full 25/25 on personal deals; 5% override on direct team setup fees and residuals; one tier only.

==================================================
END AUTOMATION BUILDER PROMPT
==================================================

## PROMPT 2 — CONVERSATION AI (rep-facing concierge, "Luna for Partners")

==================================================
COPY & PASTE INTO CONVERSATION AI / ASK AI (BOT SETUP)
==================================================

Create a Conversation AI assistant named "Luna" for INTERNAL use with OrenGen Sales Partners (not customers). Luna answers partner questions in SMS and chat, warm and precise, like the best operations manager they've ever had. She never invents policy — when unsure she says who to ask (partners@orengen.io).

Luna knows these facts cold and answers with them exactly:
- Comp: 25% of setup fee + 25% of monthly maintenance, for the life of every client the partner closes. Standard package $997 + $247/mo → $249.25 upfront + $61.75/mo per client. Professional $2,497 + $497/mo → $624.25 + $124.25/mo. Premium $4,997 + $997/mo → $1,249.25 + $249.25/mo.
- $50 fast-start bonus on the first settled deal, automatic.
- Commissions lock 72 hours after the client's payment clears (Texas right-of-rescission window); paid every Friday via Stripe; $25 minimum rolls forward.
- The 72-hour activation window is a software-access condition on the company-funded seat/line/leads — never described as required work hours (partners are independent contractors who set their own schedule).
- Partner Leader: 5 settled personal deals → automatic promotion, 5% override on direct team setup + residuals, one tier deep, personal 25/25 unchanged.
- Selling rules: fixed pricing ($997 + $247/mo standard), official checkout only, no discounts without written approval, first touch on assigned leads within 4 hours, log everything same-day, scripts live in Handbook §6.
- Compliance: call 8am–9pm prospect local time only; honor every opt-out instantly; company number only; no income promises to prospects, ever.
Luna never discusses: customer upsell products or their pricing (not part of partner compensation), other partners' data, or anything not in the Handbook — those go to partners@orengen.io.

==================================================
END CONVERSATION AI PROMPT
==================================================

## PROMPT 3 — VIBE CODER (rep onboarding hub page)

==================================================
COPY & PASTE INTO GOHIGHLEVEL VIBE CODER
==================================================

Build a single mobile-first internal page: "WeShare Partner Launch Pad". Brand: deep navy #00254B background sections, burnt orange #CC5500 buttons, clean white cards, Public Sans-style modern sans. No stock-photo clichés. Sections in order: (1) hero: "Your first 72 hours" with a 4-step checklist (Accept agreement → Connect Stripe → Pass certification → Log your first dials); (2) "Your numbers" card grid stating the comp facts exactly ($249.25 upfront + $61.75/mo per Standard client, $50 fast-start, 72-hour lock, Friday payouts) with the income disclaimer line in the footer of the section; (3) "Scripts & battlecards" section linking to the Handbook and the in-CRM script library; (4) FAQ accordion answering: when do I get paid, what is the 72-hour lock, what happens if I don't dial in 72 hours (software-access framing), how do I reach Partner Leader; (5) footer with partners@orengen.io and the standard FTC income disclaimer. Every claim must match the numbers above exactly — do not invent testimonials, projections, or additional benefits.

==================================================
END VIBE CODER PROMPT
==================================================

---

## The n8n/API bridge — the Rep Provisioner (`artifacts/n8n/rep-provisioner.json`)

Import into n8n. This is the piece that kills the manual entry: fired once per certified rep, it runs the whole provisioning chain in ~10 seconds.

**Flow:** `partner.certified` webhook (or manual fire with the rep's details) → maps their state to local-presence area codes (all 50 states pre-mapped) → searches GHL's purchasable inventory for that area code → **purchases the number into your location** → **creates their locked-down GHL user seat** (assigned-data-only, no exports/bulk/settings/funnels — the decision-B template, plus a random 16-char first-login password) → tags the contact `Partner: Number Assigned` and stores `assigned_voip_number` — which is exactly the tag your onboarding master workflow (Prompt 1, Step 5) is waiting on, so the "your line is live, 72-hour window open" email fires automatically.

**Before activating:**
1. Attach ONE credential: your **agency-level PIT** on all GHL nodes — **verified live 2026-07-26**: the agency token authorizes the phone-system endpoints (your location key returned 401; either fix its scopes or just use the agency token, which the workflow now defaults to).
2. Replace `REPLACE_WITH_AGENCY_COMPANY_ID` in the create-seat node with your agency Company ID (Settings → Company → copy ID).
3. Wire WeShare's `partner.certified` outbound event (Integrations page → Add webhook → this workflow's URL) or fire it manually per rep while volumes are small.
4. After each run, do the one manual click: **My Staff → rep → Inbound Number → select their new number.** Then log/verify their `first_dial` tracking field exists.

**Seat template & verification — it now copies the Demo User verbatim:** the live Demo User's granular permission layer (19 scopes + only-assigned-data on calendars/contacts/opportunities, read from the account 2026-07-26) is baked into the create call, so every rep seat is checkbox-identical to the demo template. The read-back verify asserts the created seat's scopes match the demo set exactly, that no affiliate-manager scope is present (audited live: affiliate access is admin-only across all users), and that only-assigned-data applied. If the Demo User's template ever changes intentionally, re-read its scopes and update the workflow's list — the template stays in version control, so UI drift can't silently change future seats.

**(Original note, still true for the legacy layer):** GHL's API has no "duplicate user" endpoint, so the provisioner doesn't copy a demo account — it writes the full lockdown template explicitly on every create (`assignedDataOnly: true`, Contacts/Conversations/Opportunities/Calendars/Phone on, everything else off). That's deliberate: a demo user can drift if anyone edits it in the UI; the code template is identical every run and version-controlled. And because writing settings isn't proof they applied, the workflow then **reads the new user back and hard-fails if any lockdown flag didn't stick** — a mis-provisioned seat can never silently reach a rep. On your one-time first run, also eyeball the seat in My Staff once (a couple of niche UI toggles aren't exposed in the API's permission object), then trust the pipeline.

**Cost note:** each purchase bills your location's Twilio/LC Phone wallet (~$1.15/mo per local number) — 50 reps ≈ $57.50/mo, matching the ops-pack estimate.

**Also wire (already emitted by WeShare):** `partner.promoted_leader` → trigger the Leadership Addendum e-sign send in GHL (Prompt 1 handles the congratulations email once the tag is applied).

---

## Reusable master template
To regenerate any of the above with changed facts (new tiers, new bonus), edit the numbers in the prompts directly — they are the source of truth. There is deliberately no ChatGPT intermediary step: every fact above is locked program-of-record, and a generator step would only add drift risk.


---

## Verification log (how we know this works — tested 2026-07-26)

**Proven by live execution against your accounts:**
- `GET /phone-system/.../available` — real endpoint, agency PIT authorized, returned **34 purchasable numbers** across TX area codes 469/972/817/512 in exactly the `numbers[].phoneNumber` shape the workflow parses. (Also caught two fixes: 214 has zero inventory → demoted from TX primary; the location key 401s → workflow now uses the agency credential.)
- Audit script executed end-to-end in dry-run (flow, scoring, unreachable-skip all exercised); detection regexes validated against live orengen.io HTML (viewport ✓, CMS ✓, copyright-year ✓, no false e-commerce flag).
- All 4 n8n JSONs structurally linted (nodes/connections/reachability); the provisioner's embedded JS compiles; all 50 states present in the area-code map.
- MailWizz API + GHL contacts/opportunities/email paths verified live earlier in the engagement.

**Verified against official docs only (not yet executed):**
- `POST .../purchase` (the actual buy — costs ~$1.15/mo, so it's reserved for the controlled first run below) and `POST /users/` (creates a real seat). Both confirmed to exist in GHL's official OpenAPI spec with the exact fields used here.
- GHL AI-tool behavior (Workflow AI / Ask AI / AI Studio) per official help docs — generation is inherently variable; GHL itself mandates the human review step before publishing.

**The controlled first run (do this once, ~5 minutes):**
1. Import the provisioner, attach the agency credential, set your Company ID.
2. Fire it manually with **one real rep** (your first certified partner — or yourself as a test rep).
3. Watch the execution: search → purchase (this buys ONE number, ~$1.15/mo — it's the rep's real number, nothing wasted) → seat creation → contact tagged.
4. Do the one manual click (My Staff → rep → Inbound Number), confirm the onboarding workflow's "your line is live" email fired.
5. If the seat call returns 403: Agency Settings → toggle "Enhanced Security" off for API user management (documented GHL behavior).
That single supervised run converts every remaining docs-only claim into an executed one — then batch freely.

**First-run attempt log (2026-07-26):** executed live up to the wall that's yours to open — read the Demo User's real permissions (its `assignedDataOnly: True` matches the template; three deltas adopted from it: tags off, lead-value on, agent/reporting on, custom-menu links on; `affiliateManagerEnabled` deliberately NOT copied — confirm if you want it), fetched the agency companyId (now baked into the workflow), then the seat-create POST returned **401 "not authorized for this scope"** — the agency PIT can read users but lacks `users.write`. **Fix (30 seconds): Agency Settings → Private Integrations → edit the integration → add the Users write scope (and confirm Phone Numbers write while you're there) → save.** If GHL rotates the token when scopes change, update it in n8n + Coolify. Then re-fire the seat test.

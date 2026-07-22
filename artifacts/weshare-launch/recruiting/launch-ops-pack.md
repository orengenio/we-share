# Rep-Launch Ops Pack — Jul 22 → Aug 1

**For:** Andre (owner). **Source:** the Google-AI planning conversation of Jul 22 (later turns supersede earlier ones — this pack carries only the final calls). **Voice/compliance:** Brand Guard, Trusted Counselor.
**Companions:** `onboarding/ghl-setup-runbook.md` (the click-path detail), `onboarding/rep-onboarding-runbook.md` (per-rep stages), `scripts/call-armory.md` + Handbook §6 (scripts), `legal/sales-representative-agreement.md` (the paper).

**Precedence note.** Where this pack and older artifacts disagree, this pack is newer. The 72-hour Texas rescission lock is **already shipped in the WeShare app** (engine default, Handbook v1.2, Agreement v3-2026-07-22) — the only ops step left is setting `COMMISSION_MATURITY_DAYS=3` (or removing it) in Coolify so the env doesn't override the new default.

**Executor tags:** `[Owner/GHL-UI]` = Andre clicks it (GHL, ad platforms, Sequence). `[n8n]` = built/run on the self-hosted instance at orengenautomation.com. `[WeShare-app]` = lives in the app at weshare.orengen.io (code/config).

---

## 1 · GO vs NO-GO decision matrix

What we are executing, what we scrapped, and why. This is the source's Definitive Strategy Map updated with every later-turn change.

| # | GO — executing | NO-GO — scrapped | Why the call went this way |
|---|---|---|---|
| 1 | **Shared state pools, weighted round-robin.** 3–5 reps can work a state like TX or FL; first rep to 5 settled deals earns the leader seat for that pool. | 100% single-rep state exclusivity. | One stalled rep was going to bottleneck an entire state's revenue. Pools keep routing clean and scale without renegotiating the map. |
| 2 | **72-hour Texas rescission payout lock** (TX Bus. & Com. Code Ch. 601). Commission locks 72 hours after the client's payment clears; from hour 73 it is final. Paid Fridays via Stripe, $25 minimum. | 30-day clawback window (and the engine's current NET-15 hold). | The website policy is no refunds except the statutory right of rescission. Once the 3-day window closes, the client can't get money back — so holding the rep's money 30 days protected nothing. Fast lock is also the single strongest recruiting line we own. |
| 3 | **Hybrid automation.** The machine scrapes, scores, writes the per-lead hook, and pre-builds the mockup. The rep places a 60-second permission call, then fires the send with one click. | Fully automated cold audit emails to prospects. | Unsolicited automated audits get spam-filtered, read as low-effort, and burn both the lead data and the sending domain. The permission call turns the same email into requested mail — and the rep has plainly earned the 25%. |
| 4 | **Locked GHL scopes.** Individual seat per rep (never shared logins), role User, Only Assigned Contacts ON, Bulk Actions OFF, Export Contacts OFF. Visible modules: **Conversions (pipelines), Conversations, Calendars — nothing else.** | Open org access — Websites, Marketing, Automations, bulk export. | Protects the lead database, keeps audit trails and A2P accountability per rep, and means a departing rep walks out with nothing but their own book of business. |
| 5 | **Two-tier framework.** 5 settled deals → Partner Leader: keeps the personal 25%/25%, adds a flat **5% override** on direct recruits' setup fees and monthly residuals. **One tier deep, hard cap.** | Any multi-level matrix (tier 3+, recruit-of-recruit overrides). | One earned tier is sales management. Deeper than that is an MLM problem we refuse to have. Leadership is earned at 5 settled deals — never bought. |
| 6 | **n8n carries the heavy logic** at orengenautomation.com: Sanctifier webhook in, Claude writes the per-lead hook, a single Switch node routes by state, round-robin assigns within the pool, clean POST into GHL. | A 50-branch If/Else routing stack inside GHL workflows. | Fifty nested conditions inside GHL is slow, fragile, and miserable to maintain. One Switch node in n8n does the same job and keeps the CRM light. |
| 7 | **Sanctifier = scraper + screener; fulfillment = GHL.** Sanctifier finds businesses, flags site flaws, grades rep applicants. Client sites ship from master niche templates (or GHL Build-with-AI) with the client's name, logo, and colors swapped in. | Treating Sanctifier as the website builder. | Direct answer from the source: Sanctifier does not code finished sites. Templates are how 150+ builds ship without hiring designers — and the mockup engine reuses the same templates. |
| 8 | **Software-access clause, not work commands.** The 72-hour first-dial rule and the 250 contact-attempts/week baseline are license terms on company-funded seats. | Daily dial quotas, set hours, "you must" activity orders. | Commanding a 1099 contractor's time is behavioral control — that's misclassification exposure. Controlling access to our own software is not. Same filter, no legal cliff. See §8. |
| 9 | **Volume recruiting funnel:** always-on hiring, 3-question DM screen, Sanctifier grading, certification role-play as the interview, onboarding in waves of 15–20. Channels: X Premium, LinkedIn at $50–100/day, 15+ FB groups; CommissionCrowd is budget-gated (roughly $1,800 up front + 1% on payouts — Sanctifier reverse-sourcing covers the same ground at $0). | 1-on-1 phone interviews for 250 applicants; paying directory fees before free channels are exhausted. | 250 phone screens in 9 days breaks the calendar. The DM filter plus the Handbook §6 role-play finds the same closers in a tenth of the time. |
| 10 | **Sequence money routing.** Stripe payout → the 25% commission pot and 5% override pot wall off automatically → balance to corporate holding. | Thursday-night spreadsheet math to figure out who's owed what. | Rep money that's walled off can't be accidentally spent on ops. The ledger (§7) records it; Sequence physically moves it. |

Plan on the survival curve: roughly **250 signups → ~50 active core closers**. That's the standard 1099 outbound reality, not a failure — the funnel, the 72-hour clock, and the waitlist exist to cycle it.

---

## 2 · The 9-day countdown (Jul 22 → Aug 1)

Order matters: **harden before traffic.** If the ads go live before the backend is ready, 250 DMs land with no system to sort them.

### Day 1–2 — Wed Jul 22 · Thu Jul 23 — GHL hardening + backend plumbing

- [ ] `[Owner/GHL-UI]` Build the **"Sales Partner — Limited" user-permission template**: role User, **Only Assigned Contacts ON**, **Bulk Actions OFF**, **Export Contacts OFF**; visible modules Conversions + Conversations + Calendars only. Every wave provisions from this template — no per-rep judgment calls. Individual seats only, granted at certification (`crmSeatGrantedAt` tracks it).
- [ ] `[Owner/GHL-UI]` Create the **lead-side custom fields** the Sanctifier payload writes into: `lead_score`, `ssl_status`, `mobile_responsive`, `google_maps_connected`, `current_cms`, `instant_mockup_url`, `custom_hook`. (Contact fields, single-line — same discipline as the 11 `ws_*` fields in the setup runbook.)
- [ ] `[Owner/GHL-UI]` Build the **50 state smart lists** — `[State] — Hot Opportunities`, filtered `State = [pool state] AND lead_score >= 50` (recipe in §3).
- [ ] `[Owner/GHL-UI]` Publish the **72-hour seat-clock workflow** (`WS Rep — 72-Hour Seat Clock`): seat provisioned → tag `Onboarding Pending` → wait 48h → if no first dial logged, one reminder SMS (carrier-safe wording, STOP line) → wait 24h → if still zero: notify admin, tag `Seat Revoked — Inactive`, disable the seat, fire the waitlist offer. The clock starts at credentials, per the agreement's access clause.
- [ ] `[Owner/GHL-UI]` Confirm **TCPA time-zone locking** on dialing/SMS windows — 8:00am–9:00pm in the *recipient's* local time — and confirm the STOP kill-switch workflow is live before anything else sends.
- [ ] `[Owner/GHL-UI]` Build the admin dashboard widgets: leaderboard (dials today / wins), **Danger Zone** (last activity > 48h — catch reps before the clock does), open pipeline value at Proposal.
- [ ] `[n8n]` Build the **master lead-routing workflow** at orengenautomation.com: webhook receiver (`sanctifier-inbound-leads`) → Claude node writes the one-sentence `custom_hook` from the scraped flaws → state Switch node → weighted round-robin across the pool's active reps → POST the contact into GHL with all custom fields + smart-list injection.
- [ ] `[n8n]` Build the **Stripe ledger listener**: `invoice.paid` → splits math (25% rep; +5% leader when an upline exists; balance corporate) → append the ledger row (§7) → report the purchase to the app's `/api/v1/track/purchase` so commissions follow money, exactly as decided.
- [ ] `[n8n]` Build the **attribution fallback**: missed call / after-hours callback / conversation-AI close on a rep's tracked number stays credited to that rep's pool assignment. No leaks — the rep who worked the lead gets paid on it.
- [x] `[WeShare-app]` **Commission engine aligned to the 72-hour rescission lock** — SHIPPED 2026-07-22 (engine default → 3 days, clawback = rescission-window only, Handbook v1.2 §2, Agreement v3 with version-aware re-acceptance). Remaining owner step: `[Owner/Coolify]` set `COMMISSION_MATURITY_DAYS=3` or delete the variable (a stale `=15` overrides the new default).
- [ ] `[Owner/GHL-UI]` Configure **Sequence flows**: Stripe payout in → 25% commission pot + 5% override pot walled off → balance to corporate holding.

### Day 2–3 — Thu Jul 23 · Fri Jul 24 — Sanctifier tuning, then traffic

- [ ] `[n8n]` Point Sanctifier's export at the production webhook; run the **first lead scrape** overnight so state lists start seeding — flaws flagged, scores computed, mockup URLs attached before any rep exists to see them.
- [ ] `[n8n]` Stand up the **mockup engine**: on a hot-scored lead, the headless-browser step drops the prospect's name, logo, and colors into the matching niche template, snapshots it, and writes the link to `instant_mockup_url`. This is the ammunition for the Mockup Close™.
- [ ] `[n8n]` Configure the **applicant-grading rubric** (1.0–5.0; commission-only/1099/closing signals score up; salary-expectation profiles auto-fail) and the reverse-sourcing query set ("independent sales representative," "1099 closer," "commission only").
- [ ] `[Owner/GHL-UI]` **Post the X Premium job listing** (final copy: the pool-model version with the 72-hour lock line — not the old exclusivity draft).
- [ ] `[Owner/GHL-UI]` **Launch LinkedIn promoted posts at $50–100/day**, high-intent keywords: 1099 sales, remote closer, SaaS sales, commission only.
- [ ] `[Owner/GHL-UI]` **Drop the social variant into 15+ FB sales groups** (High Ticket Closers, SaaS Sales Jobs, independent-rep communities).
- [ ] `[Owner/GHL-UI]` **CommissionCrowd — decision gate:** post only if the free + paid-social pipeline is underfilling by Jul 26. Cost is roughly $1,800 up front plus 1% on payouts; Sanctifier reverse-sourcing reaches the same population at $0.
- [ ] Standing rule from here: every reply routes to the **3-question DM screen** (sales background · biggest commission-only close · confirms the 72-hour seat clause). No 1-on-1 phone interviews at this volume — the certification role-play *is* the interview.

### Day 4–6 — Sat Jul 25 → Mon Jul 27 — Screening runs

- [ ] `[n8n]` **Nightly Sanctifier applicant grading** over the day's applicants; advance ≥4.0 only.
- [ ] `[Owner/GHL-UI]` Work the graded pool through the DM screen; passers get the booking link for the **certification role-play** (OrenGen Partner Intro calendar; Handbook §6 skeptical-plumber scenario).
- [ ] `[Owner/GHL-UI]` Run role-plays in blocks; verdict on the call, tag `WS Rep Approved` or `WS Rep Declined` (existing workflows 5/6 handle the rest).
- [ ] `[n8n]` Keep lead scrapes running until **all 50 Hot Opportunities lists** hold a live queue of 50+ scored leads with mockup URLs.

### Day 7–9 — Tue Jul 28 → Fri Jul 31 — Batch onboarding, waves of 15–20

Waves of **15–20 per day**, not one big bang: it staggers the 72-hour clocks, keeps admin cleanup sane, and respects the crm.orengen.com sending-domain warmup caps.

- [ ] `[Owner/GHL-UI]` Fire `WS Rep — Approved` per passing candidate → registration link goes out.
- [ ] `[WeShare-app]` Candidate registers (partner code minted; leader code honored if referred) → **accepts the Sales Representative Agreement v2 in-app** (attorney-reviewed, closed 2026-07-11; version-aware acceptance) → **Stripe Connect Express onboarding** — Stripe collects the certified W-9/TIN and issues 1099s; no separate W-9 document, per the standing decision.
- [ ] `[Owner/GHL-UI]` **Batch-provision VoIP numbers early in the wave** with area codes matching each rep's pool state, and attach every number to the registered A2P campaign *before* dial day — campaign attachment can lag days; set that expectation in writing at approval.
- [ ] `[Owner/GHL-UI]` At certification: provision the GHL seat **from the permission template** (never hand-built), assign the number, record `crmSeatGrantedAt`.
- [ ] `[Owner/GHL-UI]` Unlock leads → rep enters rotation; credentials email starts the 72-hour seat clock automatically.
- [ ] `[n8n]` **Waitlist backfill live:** a revoked seat fires the offer to the next graded candidate the moment it opens. Always-on hiring — the funnel never closes.
- [ ] `[Owner/GHL-UI]` Stand up the **250-rep tracking ledger** (§7) and confirm n8n is appending rows.

### Launch — Sat Aug 1

- [ ] `[Owner/GHL-UI]` **Run the launch call** (~10 minutes): the math ($249.25 + $61.75/mo per standard close, $50 fast-start on the first settled deal, Fridays via Stripe), the tools, the 72-hour seat clause read as written, the Partner Leader track. Record it and post the replay in the portal — attendance is never mandated (see §8). Aug 1 is a Saturday: run the call live, and treat **Monday Aug 3** as the first full-power dial day.
- [ ] `[n8n]` Confirm every active rep's queue is loaded and routing is round-robining cleanly.
- [ ] `[Owner/GHL-UI]` Final verification pass: the setup runbook's 10 checks plus `scripts/test-purchase-loop.sh` — one SETUP_FEE ($249.25) and one MONTHLY ($61.75) commission, no duplicates.
- [ ] Payout expectation, said out loud on the call: deals whose 72-hour lock clears by the Friday run pay that **Friday (first run: Aug 7)**, $25 minimum.

---

## 3 · Lead-scoring framework

Scores are computed by Sanctifier at scrape time and travel into GHL as `lead_score`. Reps never score anything — they open a pre-ranked queue.

| Modifier | Signal | Why it matters |
|---|---|---|
| **+30** | No SSL certificate ("Not Secure") | Visible trust break in every modern browser — the easiest flaw to show a prospect. |
| **+25** | Zero mobile responsiveness | Broken mobile costs a local business the majority of its traffic. |
| **+20** | No Google Business Profile connected | Invisible on local Maps searches — the customer literally can't find them. |
| **+15** | Last update > 2 years (stale copyright footer) | An abandoned site signals an owner who knows it and hasn't found the fix. |
| **−50** | E-commerce installed | The $997 + $247/mo build isn't scoped for complex checkout. Don't let a rep pitch what we can't fulfill — route these to corporate. |

**Smart-list recipe (all 50 lists):** name `[State] — Hot Opportunities`, filter **`State = [pool state] AND lead_score >= 50`**. Below 50 stays in the general pool for nurture — never in a dial queue. A 50+ score means at least two visible, demonstrable flaws: the rep opens the call with receipts, not adjectives.

---

## 4 · 4-week training syllabus

One **30-minute group call per week**, owner-led, recorded, replay posted to the portal. (Attendance is invited, never required — §8 explains why that word matters.)

| Week | Focus | On the call | The goal |
|---|---|---|---|
| **1** | The cold opener | Drill the Permission-Based Opener: "This is a completely cold call — you can hang up now, or give me 30 seconds." Name the uncomfortable thing first; it's the signature move. | Break the telemarketer pattern; kill dial reluctance. |
| **2** | The 60-second audit | Read the three fatal flaws off the contact record (`ssl_status`, mobile, GBP) and off Wappalyzer/BuiltWith live. Diagnose like a clinician, not a pitchman. | Turn the call from a pitch into a diagnostic the prospect wants to hear. |
| **3** | Objections + value framing | Run the Handbook §6.4 battlecards: "already have a site," "send an email," "why $247/mo," "no budget." Reframe the site from expense to the employee that works around the clock. | Hold the line on $997 + $247/mo without flinching. |
| **4** | Pipeline + the leader track | GHL pipeline hygiene (Follow-Up / Proposal / Nurture — nothing hot leaks), the Mockup Close™ as the call-one win, and the math to 5 settled deals → Partner Leader + 5% override. | Zero leaked leads; closers aiming at the milestone. |

Week 5 restarts the loop with live call tape from the floor. Winning lines go to `winners-library.md`.

---

## 5 · Interviewer screening FAQ

Hand this to anyone screening applicants. **Read the answers as written.** Every activity requirement in this program is a *software-access clause* — a license term on company-funded tools — never an order about the contractor's time. That distinction is what keeps 1099 status clean (§8), and an interviewer improvising "you'll need to make X dials a day" undoes it.

**Q1 — Is there a base salary?**
"No — this is a 1099 independent-contractor position, and we're direct about that. The math: a flat 25% of the $997 setup fee — $249.25 per standard close — plus a 25% monthly residual, $61.75 per active account, for the life of the customer. There's a $50 fast-start bonus on your first settled deal. Payouts run every Friday via Stripe. And the infrastructure most reps pay for — CRM seat, dedicated local VoIP line, scored lead feed — is company-funded."

**Q2 — Can I set my own hours?**
"Completely. We never set hours, schedules, or call quotas — your time and methods are yours, and the agreement says so. One clause to know: the company-funded seat, line, and lead feed stay provisioned while the seat shows baseline use — 250 logged contact attempts per week under the software-access clause. Below that, the license frees up for the waitlist. It governs our software spend, not your calendar."

**Q3 — How do territories work?**
"You're placed in a state pool with weighted round-robin routing — scored leads land directly in your queue, and you only see leads assigned to you. It's not one-rep-per-state: pools keep a big state from bottlenecking on any one person. Callbacks and after-hours closes on your tracked number stay credited to you. And the first rep in a pool to 5 settled deals becomes that pool's Partner Leader, with a 5% override on their direct team."

**Q4 — What's the 72-hour rule?**
"It's the seat-activation clause. When your credentials land, a 72-hour window opens to log into the workspace, claim your line, and log your first outbound activity. If the seat shows zero activity at hour 72, the license auto-releases to the next person on the waitlist. It's how we allocate paid software seats to people who actually use them — a resource-allocation term on company-owned tools, not a performance demand on you."

> Mirror the 250/week and 72-hour numbers in the Handbook's software-access clause so interviewers, the FAQ, and the paper all say the same thing.

---

## 6 · Rep asset kit checklist

Everything a certified rep receives in the portal on their first morning. Build once, hand to every wave.

- [ ] **Station rules card.** The 72-hour seat clock (license clause, as worded in §5 Q4). The 4-Hour Rule on assigned leads — first touch inside 4 hours or the lead recycles. Same-day CRM logging: the CRM record *is* the commission record. Sell the website only ($997 setup + $247/mo) — never discuss commissions, upsells, or add-ons with prospects; no income claims. Consented SMS only, 8am–9pm recipient-local, STOP honored instantly. Payouts: commissions lock 72 hours after payment clears, pay Fridays via Stripe, $25 minimum.
- [ ] **Browser toolkit.** Install **Wappalyzer** and **BuiltWith** (free Chrome extensions). Two seconds on any prospect site shows the CMS, missing pixels, and security posture — live conversational proof without generating a report.
- [ ] **Scripts — where they live.** Handbook §6 is the rep-facing canon: the cold opener, the Mockup Close™, the §6.4 battlecards. The live per-call copy is mirrored into **GHL custom values**, and per-lead ammunition arrives on the contact record itself: `custom_hook` (the one-sentence opener written for that exact business), `ssl_status` and friends (the flaws), `instant_mockup_url` (the pre-built preview). Reps read what's on the record — no improvised claims.
- [ ] **Permission-Gate flow card.** The 60-second call earns the send: flag the flaw, offer the audit/mockup, get the email address, fire the send with one click *while on the phone*. Never blind-send — that's the whole hybrid model (§8).
- [ ] **Partner Leader milestone card.** 5 settled deals → Partner Leader. You keep the full personal 25%/25%; you add a flat **5% override** on every setup fee and monthly residual your direct recruits generate. One tier deep, hard cap. Maintenance: the team keeps the override live with at least one settled contract per calendar month; a fully inactive 60-day stretch lapses it and routes sub-reps back to admin.

---

## 7 · 250-rep tracking ledger spec

One spreadsheet, two tabs. n8n appends rows from onboarding and Stripe events so the sheet stays current without manual entry; Andre reads it, he doesn't feed it.

**Tab 1 — "Rep Master Pipeline"** (every account ever provisioned)

| Col | Header | Format / options | Purpose |
|---|---|---|---|
| A | Rep ID | e.g. `ORG-001` | Unique tracking identifier |
| B | Rep Name | Text | The contractor |
| C | Assigned State (pool) | Dropdown: AL … WY | Pool membership — feeds round-robin weighting |
| D | Sourcing Platform | Dropdown: X, LinkedIn, Salesfolks, CC, FB | Reveals the highest-quality hiring channel |
| E | Onboarding Date | MM/DD/YYYY | Starts the 72-hour clock |
| F | 72-Hr Expiration | **`=E2+3`** | Auto-computed deactivation date |
| G | First Dial Logged? | Dropdown: Yes / No | The seat-clause compliance fact |
| H | Current Status | Dropdown: Pending, Active, Deactivated, Leader | Operational standing |
| I | Personal Deals Won | Integer | Distance to the 5-deal leader milestone |
| J | Churn Reason | Dropdown: Ghosted, Low Output, Resigned, N/A | Why drop-offs drop |

**Tab 2 — "Corporate Financial & Churn Analytics"**

- Total signups logged: `=COUNTA('Rep Master Pipeline'!B:B)-1`
- Total active reps: `=COUNTIF('Rep Master Pipeline'!H:H, "Active")`
- Gross platform churn rate: `=COUNTIF('Rep Master Pipeline'!H:H, "Deactivated") / COUNTA('Rep Master Pipeline'!A:A)`
- Highest-yield hiring source: `=INDEX('Rep Master Pipeline'!D:D, MATCH(MAX(COUNTIF('Rep Master Pipeline'!D:D, 'Rep Master Pipeline'!D:D)), COUNTIF('Rep Master Pipeline'!D:D, 'Rep Master Pipeline'!D:D), 0))`

Read it weekly against the survival curve (~250 in → ~50 active core). If a sourcing platform's rows churn at double the rate of another's, move the ad budget — that's the whole reason column D exists.

---

## 8 · Ops guardrails appendix

**1099 misclassification guardrail.** The line is behavioral control. We never command a contractor's time: no set hours, no daily dial quotas, no mandatory meetings, no "you must work." What we do instead is control access to our own property — the software-access clause: the 72-hour seat activation and the 250 contact-attempts/week baseline are license terms on company-funded seats, lines, and lead feeds. Same filter for passengers, no employee-status cliff. The Sales Representative Agreement v2 (attorney-reviewed, closed 2026-07-11) already frames the relationship this way — contractor controls hours, location, and methods. Two more walls that keep the program clean: the **override is capped at exactly one tier** — a Partner Leader earns 5% on direct recruits and nothing below them, which keeps this a sales-management structure, not an MLM; and **leadership is earned, never bought** — the only door to Partner Leader is 5 settled deals. No buy-ins, no fees, no inventory, ever.

**TCPA hours + DNC.** Outbound calls and texts run 8:00am–9:00pm in the *recipient's* local time — GHL's time-zone locking enforces it so an East Coast rep can't accidentally violate a Pacific number at 6am. Scrub dial lists against the National DNC registry and honor internal opt-outs permanently. The STOP kill-switch stands in front of every message rail: STOP → DND all channels, removed from all workflows, tagged. Marketing SMS only ever goes to contacts with a consent timestamp on file — empty consent field means no marketing SMS, no exceptions. The voicemail/AI callback fallback keeps missed calls answered inside the same rules, with attribution preserved.

**A2P 10DLC.** Already registered per the owner — SMS, AI voice, and conversation AI run under the approved company campaign. Two operational notes: every newly provisioned rep number must be **attached to the registered campaign before its first dial day** (attachment can take days — provision early in each wave), and all SMS-adjacent copy uses carrier-safe vocabulary: **"Referral Partner" or "Sales Partner," never "Affiliate"**; no SHAFT-C content; no manufactured urgency; branded links only, no shorteners.

**Why hybrid, not full automation.** Full automation lost on the merits, not on principle. Blind-blasting AI-generated audits to scraped addresses gets flagged by Google and Microsoft filters, poisons the sending domain, reads as low-effort to the exact owner we want trusting us, and burns premium lead data at scale for near-zero conversion. The hybrid model keeps every efficiency that mattered — the machine scrapes, scores, writes the hook, and builds the mockup before the rep ever dials — and adds the one thing automation can't fake: a human asking permission. The 60-second call converts a cold send into requested mail, deliverability and conversion both climb, and the rep who opened that gate has plainly earned the 25%. The machine loads; the rep opens the gate. That division of labor is the business model.

# SOP Library — WeShare Commission Engine, Human Edge Cases

Mode 25 (/og-systems) deliverable · instantiated 2026-07-10. Companion to `rep-onboarding-runbook.md`.
Doctrine: every link gets an owner, an SOP, an SLA, and a metric — or it's a wish, not a system.
Each SOP carries a founder-independence score (0–5: "runs correctly without the founder for 30 days")
and the single change that raises it. Machine does the math; these SOPs cover the parts that still need hands.

---

## SOP-1 · Monthly Payout Run

- **Owner:** Payout Operator (today: founder). **Trigger:** 1st business day of each month, for the prior month.
- **Steps:**
  1. Open **Admin → Payouts** and click **Generate Batch** for the prior period (calls `POST /api/admin/payouts` with `periodMonth: "YYYY-MM"`). The mature sweep auto-runs inside this call (`matureEligibleCommissions`) — NET-15 pending commissions and overrides flip to APPROVED before aggregation, so nothing is silently excluded. A 409 means the batch (`YYYY-MM Weekly-Friday`) already exists — stop and review it instead of retrying.
  2. Review the batch on **Admin → Payouts → [batch]** (`GET /api/admin/payouts/[id]`): recipient count, total, and per-item amounts. Sanity anchors: a standard close pays $249.25 setup and $61.75/mo residual per rep. Rows under the $25 minimum roll forward automatically (they stay unlinked) — do not chase them.
  3. Spot-check any recipient with a missing Stripe account (blank `stripeAccountId`) — nudge them to finish Connect onboarding before executing, or accept that their item will fail and roll forward.
  4. Click **Execute Transfers** (`POST /api/admin/payouts/run`). Stripe Connect transfers fire per item; each completed transfer marks that recipient's ledger rows PAID and sends the payout email. Failed items are marked FAILED and their rows are released to a future batch — money is never marked paid without a transfer.
  5. Verify: batch status COMPLETED, `successCount`/`failCount` in the response, `PAYOUT_EXECUTED` audit-log entry, and at least one payout email confirmed received (check a known rep or the email log).
  6. Log failures with reasons in the ops journal; recurring "No Stripe Connect account configured" failures go to SOP-escalation.
- **SLA:** batch generated and executed within 2 business days of month start.
- **QA check:** batch total = sum of items; every COMPLETED item has a `stripeTransferId`; no APPROVED rows from the period left linked to the batch but unpaid.
- **Escalation:** any failCount > 20% of recipients, or a batch stuck in PROCESSING → founder + Stripe dashboard review same day; do not re-run the batch (status guard blocks it) — fix root cause, regenerate next period.
- **Metric moved:** on-time payout rate (target 100%).
- **Founder-independence: 2.** *One change:* a monthly cron that generates the batch and posts a review link, so the human role shrinks to review-and-execute.

## SOP-2 · Clawback Execution

- **Owner:** Payout Operator. **Trigger:** a refund lands (Stripe notice, client email, or dispute outcome).
- **Steps:**
  1. Verify the webhook did the work: find the conversion in **Admin → Commissions** and confirm `charge.refunded` was processed — conversion shows `refundedAt`, `stripeRefundId`, and reason, and `processClawback` ran with reason "Customer refund within 30-day window", executor `STRIPE_WEBHOOK`.
  2. If the webhook did NOT fire (check **Admin → Integrations → Webhook Deliveries**), run the clawback manually from the commission detail view — never edit ledger rows by hand.
  3. Confirm the ledger picture: PENDING/APPROVED rows for that conversion → CLAWBACK; previously-APPROVED rows have negative VOID mirror entries; associated overrides → CLAWBACK.
  4. **Paid-netting check** — the edge case this SOP exists for: if any row was already PAID, the engine creates a negative APPROVED entry (`voidMemo: "Clawback (already paid — nets against next payout)"`). Verify it exists and that the rep's next-payout balance reflects the deduction. The debt settles automatically in the next batch aggregation; no manual invoice, no demand letter.
  5. Rep communication within 1 business day, Trusted Counselor voice: what happened (client refunded within the 30-day window), what it means (commission reversed per the agreement's NET-15/clawback terms, Handbook §10), and — if paid-netting applies — that the amount nets quietly against their next payout. No surprises on payday is the whole point of this step.
- **SLA:** verification + rep notice within 1 business day of refund.
- **QA check:** `commission.clawback` event shows `paidNetted` count matching the negative APPROVED entries; sum of original + netting entries for the conversion = 0.
- **Escalation:** clawback on a conversion inside an open dispute → freeze rep comms, route to SOP-3. Netting that would push a rep's next payout below zero for 2+ consecutive months → founder decision on a payment plan.
- **Metric moved:** clawback-to-notice lag (target ≤1 business day).
- **Founder-independence: 3.** *One change:* auto-send the rep clawback email from the `commission.clawback` event, leaving the human only the dispute-adjacent cases.

## SOP-3 · Dispute Ladder (Handbook §12)

- **Owner:** Dispute Referee (today: founder — by design, until volume forces delegation). **Trigger:** a rep files a commission dispute.
- **Steps:**
  1. Acknowledge receipt to the rep within 1 business day; state the 5-business-day ruling clock and mark the dispute UNDER_REVIEW in **Admin → Disputes**.
  2. Ledger trace, in order: (a) the conversion record — type, `grossRevenue`, attribution (`ws_partner_code` on the `/api/v1/track/purchase` call or Stripe webhook); (b) every commission row on that conversion — status, `rankAtTime`, rate, `maturesAt`; (c) any override rows; (d) any VOID / netting entries and their `voidMemo`; (e) the audit log (`COMMISSIONS_MATURED`, `PAYOUT_CREATED`, `PAYOUT_EXECUTED`) for the period in question.
  3. Rule against the written terms, not memory: 25% setup + 25% lifetime residual, NET-15 maturity, 30-day refund clawback, $25 payout minimum roll-forward. Most "missing commission" disputes are a roll-forward or a maturity hold — show the rep the exact row and date.
  4. Record the ruling via **Admin → Disputes → Resolve** (`PATCH /api/admin/disputes` with `disputeId`, written `resolution`, status RESOLVED or REJECTED). The resolution text is the record — write it so a stranger could reconstruct the reasoning.
  5. If the ruling favors the rep, create the corrective entry through the engine (adjustment commission), never by editing rows; it flows into the next batch normally.
- **SLA:** ruling within 5 business days of filing (Handbook §12).
- **QA check:** every RESOLVED/REJECTED dispute has `resolvedById`, `resolvedAt`, and a resolution referencing specific ledger rows.
- **Escalation:** disputes alleging misattribution between two reps, or any dispute unresolved at day 5 → founder rules same day; pattern of 3+ disputes on the same root cause → PDSA improvement cycle, fix the system before blaming people.
- **Metric moved:** dispute cycle time; repeat-cause dispute count (target: trending to zero).
- **Founder-independence: 1.** *One change:* a written ruling precedent log (one paragraph per resolved dispute) so a delegated referee inherits case law instead of the founder's memory.

## SOP-4 · Rep Application No-Response Guard

- **Owner:** Recruiting Coordinator (today: founder). **Trigger:** application received — GHL form fires, contact tagged `WS Rep Applicant`, pipeline stage New.
- **Steps:**
  1. Promise: every applicant gets a human reply within 1 business day. The auto-acknowledgment email (GHL workflow) does not count as the reply — it buys time, it doesn't keep the promise.
  2. Daily check, every business morning by 10:00: open the GHL pipeline, filter stage New, sort oldest first. Anything older than 1 business day is a breach.
  3. For each applicant: reply personally, book the certification role-play (Handbook §6, skeptical-plumber scenario), and move the pipeline stage. No verdict by email — the role-play is the interview.
  4. On breach: reply immediately with a straight apology (own it, no excuses), log the breach and its cause in the ops journal, and run the Deming line — a missed follow-up is a system problem first: was the trigger, routing, or alert missing?
  5. Weekly: count of applications vs. count answered inside SLA goes on the scorecard.
- **SLA:** first human reply ≤1 business day; role-play booked ≤3 business days.
- **QA check:** GHL pipeline stage New contains nothing older than 1 business day at the 10:00 check.
- **Escalation:** 2+ breaches in a week → the daily check gets a second owner and a GHL stale-stage alert is built that week, not "someday".
- **Metric moved:** applicant response SLA hit rate; application → certification conversion.
- **Founder-independence: 2.** *One change:* a GHL automation that alerts (SMS to the coordinator) when any contact sits in stage New past 20 business hours — turning the guard from a habit into a tripwire.

## SOP-5 · Certification → Leads Unlock → A2P Number Assignment

- **Owner:** Partner Operations (today: founder). **Trigger:** rep passes the Handbook §6 certification role-play.
- **Steps (strict order — each admin action fires its own email, so sequence is the message):**
  1. Confirm prerequisites: registration complete, contractor acknowledgment accepted (dashboard agreement modal, audited), Stripe Connect payouts enabled (the "payouts live → certification next" email already fired on the flip).
  2. **Admin → Partners → Certify.** Fires the certification email, once. This is the "you're cleared to sell" moment — do not certify before the role-play verdict is recorded.
  3. Provision the rep's company number manually in GHL Phone System, then **Admin → Partners → Assign #** (prompt). Fires the "your number is ready" email and surfaces the number on the rep dashboard. A2P campaign approval takes days — that expectation was set at the interview, in writing; do not let a rep cold-SMS on a personal number while waiting. All SMS: consented contacts only, 8am–9pm local, STOP honored instantly.
  4. Provision the CRM seat per the decided model: individual limited GHL seat — role User, "Only Assigned Data" ON, permissions Contacts + Conversations + Calendars only. Record `crmSeatGrantedAt`.
  5. **Admin → Partners → Unlock.** Fires the "you're in rotation" email carrying the 4-Hour Rule and CRM-hygiene expectations. Only unlock after steps 2–4 — a rep in rotation without a number or seat burns leads.
  6. First lead assignment via **Admin → Leads → Assign** (fires the 4-hour-clock email; SLA tracking and recycling are automatic).
- **SLA:** certify-to-unlock ≤2 business days (A2P campaign approval excluded — it runs on carrier time).
- **QA check:** rep dashboard shows number + certified badge; all three emails (certified, number ready, in rotation) present in the email log, in that order; CRM seat matches the limited template exactly.
- **Escalation:** A2P approval stalled >7 days → check the campaign registration in GHL, then carrier escalation; any rep found with broader CRM permissions than the template → correct same day and audit the other seats.
- **Metric moved:** certification-to-first-lead lag.
- **Founder-independence: 2.** *One change:* a per-rep activation checklist inside the admin partner view (checkboxes gating the Unlock button) so the order is enforced by the interface, not by memory.

## SOP-6 · Save-Call Follow-Through

- **Owner:** Client Success (today: founder). **Trigger:** `customer.subscription.deleted` fires — the save-call email goes to the owning rep automatically (client contact info + the Handbook §10 save script: find out what changed, fix what's fixable, and only then talk price), and the `client.cancelled` event is emitted.
- **Steps:**
  1. Rep has a 48-hour window from the alert to make the save call and log the outcome in the CRM (same-day logging rule — the CRM record is the commission record).
  2. Admin check at hour 48: open the CRM record for the cancelled client. Look for a logged call with an outcome.
  3. Outcome logging, one of four, recorded on the opportunity: **SAVED** (subscription resumed — confirm in Stripe before celebrating), **LOST-PRICE**, **LOST-PRODUCT** (route the reason to delivery QA), **NO-CONTACT** (client unreachable after documented attempts).
  4. If the rep made no attempt inside 48 hours: the save attempt passes to the admin immediately (the client's clock matters more than the rep's), and the miss is logged. First miss = coaching conversation; pattern of misses = Handbook standing review.
  5. Monthly: tally outcomes. LOST-PRODUCT clusters trigger a PDSA cycle on delivery, not a rep blame session — most misses are system misses.
  6. Residual note: cancellation ends the client's monthly billing, so the rep's $61.75/mo residual on that client stops with it — a saved client is the rep keeping their own annuity. Say it that plainly in coaching; never in client-facing words.
- **SLA:** rep first attempt ≤48h; admin check at exactly 48h; outcome logged ≤72h from alert.
- **QA check:** every `client.cancelled` event has a matching CRM outcome entry within 72h — zero orphaned cancellations.
- **Escalation:** 3+ cancellations from one rep's book in a month → founder reviews that rep's client list and delivery record together; save rate below 20% for a quarter → revisit the §10 script itself.
- **Metric moved:** save rate; cancellation-to-outcome-logged lag.
- **Founder-independence: 3.** *One change:* a 48-hour follow-up task auto-created (GHL or n8n bridge off the `client.cancelled` webhook) assigned to the admin queue, so the hour-48 check cannot be forgotten.

---

## Scorecard summary

| SOP | Function | Score | The one change |
|---|---|---|---|
| 1 | Payout run | 2 | Cron-generated batch, human review-and-execute only |
| 2 | Clawback | 3 | Auto rep email off `commission.clawback` |
| 3 | Disputes | 1 | Ruling precedent log for a delegated referee |
| 4 | Application guard | 2 | GHL stale-stage tripwire alert |
| 5 | Activation chain | 2 | Checklist-gated Unlock button in admin UI |
| 6 | Save-call | 3 | Auto-created 48h admin task off the webhook |

Exit question, standing: what breaks if the owner takes a month off? Today: disputes and payouts.
The plan is the right column. Review these scores at each 30-day PDSA cycle.

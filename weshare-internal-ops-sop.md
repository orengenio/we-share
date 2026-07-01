# WeShare — Internal Operations SOP (Admin)
**OrenGen Worldwide · Confidential · v1.0 (June 2026)**

## 1 · Application Review
- **Referral Partners:** auto-approve unless flags fire — disposable email, duplicate identity (email/phone/Connect match), prior termination, suspicious volume from one IP. Flagged → manual review within 1 business day.
- **Partners:** screening call → verify phone/communication skills → agreement + W-9 + Connect → certification role-play → provision CRM seat + number → assign first lead batch. Target: application-to-live ≤ 5 business days.

## 2 · Daily Checklist (10 min)
1. `events` table: any rows `status='failed'` → reprocess or escalate.
2. Fraud flags queue: self-referral matches, click anomalies (one IP > 50 clicks/day), lead-quality complaints.
3. Lead SLA monitor: leads with no first touch in 4+ business hours → warn partner; 48h → recycle.
4. Cancellation signals → notify closing partner for save call.

## 3 · Weekly Payout Run (Fridays, 9:00 AM CT)
1. Open admin payout view: all `approved` commissions, prior week, grouped per user.
2. Verify: total out vs. Stripe revenue for the week (out should be ≤ ~40% of collected setup + ~37.5% of collected MRR — anything higher, stop and trace).
3. Exclusions auto-applied: balances < $25 (rollover), no Connect account (notify), first-payout 14-day holds, accounts under review.
4. Click **Approve** → n8n WF-E executes transfers → commissions flip to `paid` → statements email automatically.
5. Spot-audit 3 random payouts to the ledger. File the run summary.

## 4 · Fraud Review SOP
**Signals:** burst clicks from one IP/UA, lead email domains matching referral partner, fake-pattern form fills, refund rate > 20% on one referral partner's deals, recruits with zero clicks but instant "sales."
**Actions ladder:** hold payout → request traffic-source explanation (48h) → void fraudulent commissions (ledger `void`, memo reason) → strike or terminate per handbook. Document everything in the user record; the ledger is the evidence.

## 5 · Dispute Resolution SOP
1. Intake via dashboard form (30-day window from statement).
2. Trace: commission → `source_event_id` → raw webhook payload → attribution chain (click → lead lock → deal).
3. Rule within 5 business days, in writing, with the trace attached.
4. If we erred: corrective ledger entry (never edit the original row). If we didn't: cite the rule and the trace.

## 6 · Clawback Execution
Stripe `charge.refunded` auto-creates negative entries (WF-D). Manually verify: all beneficiaries on the deal reversed (partner + referral partner + override), deal marked `refunded`, affected users notified with statement note.

## 7 · Termination Procedure
1. Document violations + evidence in user record.
2. For-cause: set user `suspended` → revoke portal/CRM access → void unpaid commissions with memo → written notice citing handbook section.
3. Without-cause / program exit: pay out all earned commissions next cycle; partner residuals continue per handbook §10.
4. Partners: reassign open leads to pool same day; recover number assignment.

## 8 · KPIs to Watch Weekly
Referral Partner activation rate (signup → first sale ≤ 14 days — Fast Start is working if this is > 20%) · clicks → lead → close conversion by source · effective payout % of revenue · refund rate · partner SLA compliance · residual churn rate · Builder+ promotion velocity (your army-growth leading indicator).

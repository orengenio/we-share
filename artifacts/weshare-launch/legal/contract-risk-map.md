# Contract Risk Map — Partner Payment Authorization & Contractor Agreement (v1-2026-07-08)

**/og-legal · Adams-doctrine review. NOT LEGAL ADVICE.** This is attorney-ready preparation
produced by the legal-support machine: clause classification, vague-language flags, and
missing-clause gaps, severity-ranked so licensed counsel can act on it in one pass.
**Status: agreement is LIVE in-app (dashboard modal, reps actively accepting) with the
Attorney Review gate OPEN.** Gate log: `../STATE.md §Attorney-review log`.

**Document under review:** the 5-clause acceptance modal in
`src/components/dashboard/agreement-banner.tsx` + acceptance record
(`w9Submitted` + audited version/timestamp/IP via `/api/partners/me/agreement`).
Related canon: Partner Handbook §§5, 9–11.

## Clause map (what exists)

| # | Clause (live text, condensed) | Class | Notes |
|---|---|---|---|
| 1 | Independent contractor, not employee; own taxes | risk allocation | Standard; see gaps G1, G7 |
| 2 | Payment via connected Stripe account; W-9/TIN + 1099 through Stripe Connect | obligation (company) / condition | Matches implementation (decision register 2026-07-08) |
| 3 | NET-15 maturity; 30-day refund clawback incl. netting against future payouts | condition + remedy | Matches engine exactly (maturesAt, processClawback paid-netting) |
| 4 | Client/lead/script/pricing data is OrenGen property; no off-platform diversion | obligation (rep) / IP-confidentiality | Mirrors Handbook §9; see G3 |
| 5 | Exit in good standing → residuals continue; termination for cause → forfeiture | right / remedy | Mirrors Handbook §§10–11; see V2, G5 |

## Findings — severity-ranked

### HIGH
- **G1 · No governing law / venue / dispute-resolution clause.** Handbook §12 has an internal
  dispute ladder, but the signed agreement itself names no governing state (Texas?), forum, or
  arbitration election. First thing counsel will add.
- **G2 · No indemnity or liability-cap clause.** Rep misconduct in the field (TCPA violation on
  a personal phone, misrepresentation to a prospect) currently has no contractual indemnity
  running to OrenGen, and OrenGen's own liability to the rep is uncapped.
- **V1 · "Termination for cause" is undefined in the signed text.** Clause 5 forfeits
  commissions on it, but "cause" is only defined in the Handbook (fraud, circumvention,
  compliance breach). Forfeiture provisions with undefined triggers are classic
  dispute-generators. *Tighter candidate:* "…for cause, meaning fraud, client circumvention,
  or material compliance breach as defined in Partner Handbook §§9–12, which is incorporated
  by reference."

### MEDIUM
- **G3 · Handbook not incorporated by reference.** The agreement leans on Handbook terms
  (comp %, guardrails, strikes) without binding the rep to the Handbook or to its amendment
  process. One sentence fixes it — and makes Handbook updates enforceable.
- **G4 · No amendment/notice mechanism.** How comp or terms change (email notice + continued
  participation = acceptance?) is unstated.
- **V2 · "Residuals continue … per the Partner Handbook" — for life?** The Handbook promises
  lifetime residuals in good standing; the clause says "continue" without duration. If
  lifetime is the promise (it's the recruiting headline), counsel should confirm the company
  can honor it as written and say "for the life of the client account" explicitly.
- **G5 · No clawback-after-exit mechanics.** If a client refunds after a rep has exited and
  been paid out, netting has nothing future to net against. Counsel may want a repayment or
  offset-against-continuing-residuals term.

### LOW
- **G6 · E-signature evidentiary posture.** Click-accept + audited timestamp/IP/version is a
  reasonable ESIGN/UETA pattern; counsel should bless the record format (we store version,
  user identity, timestamp, IP — exportable from AuditLog).
- **G7 · No non-solicitation of other reps** (poaching downline/colleagues on exit) — Handbook
  is silent too; business call for counsel.
- **G8 · Consent-to-contact for the rep themselves** (company SMS/calls to reps) — currently
  informal; fold into the agreement or the application consent block.

## What is RIGHT and should not change
Clauses 2–3 encode the implemented system 1:1 (Stripe-collected tax identity, NET-15,
paid-clawback netting) — no drift between contract and code. Clause 4/5 match the Handbook's
economics. Plain-English register (Garner) is already correct — counsel should preserve it.

## Recommended sequence
1. Send this map + the live modal text + Handbook §§5, 9–12 to counsel (one pass, findings
   table order). 2. Counsel returns v2 text → update `agreement-banner.tsx` + bump
   `AGREEMENT_VERSION` (re-acceptance flow already versioned). 3. Close the gate in STATE.
   Interim: acceptance flow may remain live — clauses are accurate to the system — but
   HIGH items G1/G2/V1 are the exposure counsel closes.

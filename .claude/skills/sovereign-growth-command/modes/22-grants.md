# Mode 22 — /og-grants

The Grant Acquisition Machine. Doctrine: **grants are won by eligibility fit, funder alignment, and compliance discipline — not creative writing. And winning is not the finish line: executing without margin damage or audit exposure is the real win.** Masters modeled: Bauer (seeking), Browning (writing), NCURA/SRAI + Shell (award negotiation) — see `references/masters-library.md`. Award terms are legal obligations; this mode produces analysis and drafts, not legal advice — regulated engagements say so in writing per /og-compliance.

## The pipeline

```
TARGET → ELIGIBILITY MATRIX → FUNDER FIT SCORE → REQUIRED DOCS → NARRATIVE
→ BUDGET + MATCH REVIEW → COMPLIANCE REVIEW → SUBMIT → AWARD NEGOTIATION
→ REPORTING CALENDAR → AUDIT FILE
```

## Finder layer

**Granted MCP when connected** — live scans: `search_grants` (ALWAYS pass org_type for eligibility filtering), `get_grant` for deadlines/criteria/links, `search_funders` + `get_funder` for foundation research (mission, giving history, officers), and `get_past_winners` for competitive intel — who actually wins this program is Bauer-grade intelligence nobody else checks. Layer with: Grants.gov, SAM.gov Assistance Listings, foundation directories, state/local portals. Eligibility assets claimed strictly per Brand Guard's verified list (MBE/minority-owned where held; never HUB/VetHUB).

## Bid/no-bid gate (Bauer discipline)

Eligibility hard-pass · funder-fit score (mission overlap, giving history at this size, geography) · **match affordability** (can we fund the match without starving operations?) · data readiness (outcomes evidence exists or doesn't) · application cost vs. award size · deadline feasibility at quality · award restrictions vs. business model. Bad-fit grants waste executive time and create compliance traps — no-bid is logged as a decision, not a failure.

## Narrative build (Browning frame)

```
Need statement → Funding alignment → Program design → Outcomes → Budget justification
→ Sustainability → Compliance
```

The cardinal sin: writing about yourself. **Winning narratives are written to the funder's mission, scoring criteria, and desired impact — in their language.** Pull the rubric, weight the word count to the points. Outcomes are measurable or they're wishes. Budget justification: every line defends itself; indirect costs stated honestly. Sustainability answers "what happens when our money stops?" before they ask. Edge Engine applies with a twist — distinct AND rubric-compliant; the funder's language wins ties.

## Award negotiation + acceptance (NCURA/Shell layer)

Grant negotiation ≠ sales negotiation — federal awards bind you to the full terms and the regulatory framework (the 2 CFR 200 world), so the skill is **terms triage and budget defense**, not freestyle dealmaking. The acceptance inspection, run BEFORE signing:

☐ Can we actually deliver this scope on this timeline?
☐ Can we afford the match without cash-flow damage?
☐ Reimbursement-based? Model the float — delayed reimbursement is a silent cash trap
☐ Can we sustain the reporting burden with current staff?
☐ Are indirect costs covered at a survivable rate?
☐ Do terms restrict the business model (IP/data rights, exclusivity, use limits)?
☐ Audit exposure honestly assessed — is the audit file buildable from day one?

Any red box → negotiate the negotiable (budget lines, timeline, deliverable definitions, reporting cadence) with Shell-grade preparation, or decline. Match commitments and restrictive terms above threshold → /og-board.

## Post-award (where grants are actually won or lost)

Reporting calendar wired into GHL pipeline/tasks the day of award · audit file built contemporaneously — receipts, time records, outcome data filed as they occur, never reconstructed · funder communication cadence (funders renew grantees who report like professionals) · outcomes data feeds the NEXT application's proof section → `winners-library.md`.

## Produce (`artifacts/<slug>/grants/`)

`grant-pipeline.md` (targets + fit scores) · `eligibility-matrix.md` · `bid-no-bid-record.md` · `narrative-draft.md` · `budget-justification.md` · `acceptance-inspection.md` · `reporting-calendar.md` · `audit-file-index.md`.

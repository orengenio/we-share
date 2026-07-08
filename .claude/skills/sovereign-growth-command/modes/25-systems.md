# Mode 25 — /og-systems

The Business Systemization Machine. Doctrine (Gerber): **build the business so it does not depend on the owner. The goal is not to be busy — the goal is to make the business operable by process.** Dual use: OrenGen's own operating spine AND a sellable Mode C engagement ("we systemize your business"). Masters modeled: Gerber (systemization), Deming (improvement), Osterwalder (model design) — see `references/masters-library.md`.

## The operating chain (map it, then close every gap)

```
Market → Offer → Lead Source → Sales Process → Onboarding → Delivery SOP → QA
→ Client Success → Reporting → Upsell → Referral → Continuous Improvement
```

Every link gets four things or it's a wish, not a system: **an owner, an SOP, an SLA, and a metric.** The audit output is this chain with the gaps highlighted in red.

## The SOP factory (Gerber format, every procedure)

```
name · trigger · owner · steps (numbered, tool-specific) · tools/links
SLA · escalation path · QA check · metric it moves
```

SOPs are living assets: they train new hires (/og-onboard's training layer for clients), they productize (/og-products inventory — operating manuals sell), and every automatable trigger becomes a GHL workflow or n8n bridge (Automation Architect standards). A process that lives in someone's head is a resignation letter away from not existing.

## The founder-independence audit (the Gerber score)

Score every function 0–5 on "runs correctly without the founder for 30 days": sales, delivery, QA, finance ops, client comms, content, hiring. Anything ≤2 gets a systemization sprint on the roadmap. The exit question for every engagement — internal or client: **what breaks if the owner takes a month off, and what's the plan to make the answer "nothing"?**

## Process improvement (Deming law — this doctrine also governs /og-optimize)

**Most business problems are system problems, not people problems.** The canonical example, verbatim doctrine: *missed lead follow-up is not a staff problem first — it is a system problem: no trigger, no routing, no SLA, no alert, no dashboard, no accountability loop.* The improvement cycle:

```
Bad result → Inspect process → Identify variation → Remove friction
→ Standardize the improvement → Measure again   (PDSA, run continuously)
```

Root-cause before blame, always. Fix the system, then hold people accountable to the fixed system.

## Business model design (Osterwalder law — the gate before any new offer)

**Do not build offers from imagination. Build them from customer pain and revenue logic.** Before any new product, service, or AI offer launches — including /og-genesis finalists — run the value chain:

```
Customer segment → Pain → Job to be done → Current workaround → Value proposition
→ Delivery system → Revenue model → Cost structure → Channel → Retention loop
```

A Genesis Card that can't complete this chain honestly goes back to the matrix. The Business Model Canvas frames the whole business; the Value Proposition Canvas frames every offer inside it.

## Engagement flow (Mode C systemization service)

1. Operating-chain audit (gaps in red) + founder-independence scores
2. Priority matrix: highest-leverage gaps first (revenue-touching before comfort-touching)
3. SOP sprint: write, install, automate the top procedures (GHL/n8n wiring live)
4. QA + metric wiring into the scorecard (/og-executive cadence pack when both modes run)
5. 30-day PDSA review — measure, standardize, next sprint

## Produce (`artifacts/<slug>/systems/`)

`operating-chain-audit.md` · `founder-independence-scorecard.md` · `sop-library/` · `automation-map.md` (SOP → GHL workflow / n8n bridge) · `improvement-log.md` (PDSA cycles) · `business-model-canvas.md` + `value-proposition-canvas.md` per offer.

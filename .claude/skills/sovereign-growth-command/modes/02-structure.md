# Mode 02 — /og-structure

Turn a qualified profile into an operating business design. Requires: completed profile (Gate).

## Supported business models

AI agency · consulting · SaaS · white-label software · local lead generation · government contracting · legal support services · credit/business funding support · recruiting/career services · digital products · subscription services · high-ticket services · retainer services · rev-share services · affiliate/sales-agent (partner-program) model. Hybrids are normal — name the primary cash engine and the equity play separately (e.g., "GHL services = cash engine, platform = equity play").

## Produce (in one structured document, `artifacts/<slug>/structure/business-structure.md`)

1. **Business model** — primary engine, secondary lanes, what is explicitly out of scope this quarter.
2. **Service lanes** — each lane: promise, buyer, delivery unit, capacity limit.
3. **Offer ladder** — skeleton only (full architecture happens in /og-offer): entry → core → premium → recurring, with target price bands.
4. **Pricing architecture** — one-time vs. recurring vs. hybrid; setup fee vs. retainer split; rev-share terms if applicable.
5. **Fulfillment map** — step-by-step from payment to delivered outcome, with owner per step (human, Buy-Lingual™ agent, GHL automation, n8n workflow).
6. **Sales process** — lead → qualified → booked → closed, mapped 1:1 to the GHL pipeline stages /og-ghl-sync will build.
7. **Tech stack** — GHL white-label at the center; everything else is a spoke. Name each tool and its single job.
8. **Team roles** — even a team of one: who approves outbound, who fulfills, who owns the number.
9. **KPI dashboard** — leads/wk, cost per lead, booking rate, show rate, close rate, AOV, MRR, payback period. Set a target and a red-line for each.
10. **Risk controls** — top 5 risks (compliance, key-person, platform dependency, cash gap, fulfillment capacity) with a mitigation each.
11. **Launch priorities** — the 30-day sequence: what ships week 1/2/3/4.

## Rules

- Attack dependency: prefer owned assets (list, domain, content library, GHL sub-account the client controls) over rented reach.
- Every lane must clear the Money Math sanity check (`references/direct-response-rules.md` §Money Math) — if LTV:CAC can't plausibly clear 3:1, flag it rather than decorating it.
- Structural decisions matching an escalation trigger (modes/00-router.md) go to /og-board before locking.

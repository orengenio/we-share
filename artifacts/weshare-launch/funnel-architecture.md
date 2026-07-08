# Customer Funnel Architecture — 7 Services (regenerated v2, 2026-07-08)

Offer/bump/upsell/downsell map for the customer-side funnels. **Company revenue only — nothing here is rep-facing** (reps sell OrenWeb at $997 + $247/mo, full stop; upsells live exclusively in customer checkout flows and post-purchase sequences).

⚠️ **Pricing status:** OrenWeb pricing is locked ($997 + $247/mo). Every other price below is **[PROPOSED]** — anchored to the $247/mo core so the ladder reads coherent — and needs Andre's confirmation before any funnel page is built. Product capabilities marked **[CONFIRM]** must match what fulfillment actually delivers before copy ships (never-claim discipline).

## The ladder (logic)

**OrenWeb is the cash-engine frontend** — lowest-friction, rep-driven, proves competence in 5 days. Everything else monetizes the trust it creates, in order of "next obvious pain": they have a site → now calls need answering (AI Voice) → now follow-up needs doing (AI Employees) → now content needs existing (OrenSocial) → the ambitious ones want the whole machine (Better Together / OrenNexus).

| # | Service | Role in ladder | Core price | Bump (at checkout) | Upsell (post-purchase) | Downsell |
|---|---|---|---|---|---|---|
| 1 | **OrenWeb** | Frontend / trust engine | **$997 + $247/mo** (locked) | Rush build 48h — [PROPOSED $297] | AI Voice trial (see 2) | none — price is the price (no fake discounts, Handbook) |
| 2 | **OrenWeb Talk** [CONFIRM scope: site chat widget + voice answering?] | First AI touch — attach to every OrenWeb | [PROPOSED $97/mo add-on] | — | AI Voice full (2→3 path) | pause-not-cancel: 30-day free park |
| 3 | **AI Voice (Buy-Lingual™)** | Missed-call money recovery | [PROPOSED $497 setup + $297/mo] | Spanish/second-language line [PROPOSED $97/mo] | AI Employees | OrenWeb Talk (lighter tier) |
| 4 | **AI Employees** [CONFIRM scope: follow-up/booking/review agents?] | Back-office leverage | [PROPOSED $997 setup + $497/mo] | Additional agent seat [PROPOSED $197/mo] | Better Together bundle | single-agent tier [PROPOSED $297/mo] |
| 5 | **OrenSocial** [CONFIRM scope: managed posting? content engine?] | Visibility flywheel | [PROPOSED $397/mo] | Review-response add-on [PROPOSED $97/mo] | Better Together | posting-only tier [PROPOSED $197/mo] |
| 6 | **Better Together** | The bundle (2+ services) | [PROPOSED: sum × 0.8, 12-mo commit] | — | OrenNexus (for agency-type buyers) | à-la-carte fallback |
| 7 | **OrenNexus™** | White-label CRM platform (B2B buyers, agencies) | [PROPOSED $497/mo + per-seat] | onboarding done-for-you [PROPOSED $997] | — | self-serve tier |

**Money-math floors (run before locking any [PROPOSED]):** bump take 20–35%, upsell 10–25% planning defaults; LTV:CAC must clear 3:1 with honest inputs or the price/offer changes, not the spreadsheet. Formulas: `references/direct-response-rules.md §Money Math`.

## Per-funnel skeleton (applies to each service funnel)

```
Landing (pain → named mechanism → proof → offer → CTA)
  → Checkout (order bump, ONE, above the pay button)
    → Success → Upsell page (one-click, pre-authorized where gateway allows)
      → accepted → Thank-you + intake
      → declined → Downsell → Thank-you + intake
```
Every arrow = GHL tag + stage move + workflow (abandoned checkout, intake chase, onboarding sequence). Consent checkboxes (service required; marketing SMS optional, never pre-checked, timestamped) on every form that takes a phone.

## Copy angles per funnel (headline thesis — full pages built per service on approval)

1. **OrenWeb:** "Your next customer just Googled you and found nothing." Enemy: invisibility. Proof: the mockup itself + five-days-or-less.
2. **OrenWeb Talk:** "Your website answers questions now — even the 2 a.m. ones."
3. **AI Voice:** "Every missed call is a job your competitor booked." Recover the calls you already paid to generate.
4. **AI Employees:** "The follow-up you keep meaning to do — done, every time, by something that never forgets."
5. **OrenSocial:** "Consistent online without you becoming a content creator."
6. **Better Together:** "One machine, one bill, every piece already talking to each other." Enemy: the duct-taped stack.
7. **OrenNexus:** "Run your clients on your platform — not rented seats on someone else's." Enemy: dependency (the house thesis, verbatim).

## Build order (recommendation)

1. OrenWeb funnel (rep-driven checkout target — unblocks the full attribution loop NOW)
2. OrenWeb Talk as the universal order bump/upsell
3. AI Voice (the strongest standalone pain)
4. The rest as fulfillment capacity confirms [CONFIRM] scopes.

**Next action for Andre:** confirm/adjust the [PROPOSED] prices + [CONFIRM] scopes in this file — then I write the full page copy packs per service (same format as the rep recruitment funnel) without inventing a single product fact.

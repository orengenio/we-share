# Mode 03 — /og-offer

Architect the money. Requires: profile categories B, C, D. Read `winners-library.md` first — proven offers beat clever ones. If no offer exists yet, run /og-genesis first and build from the selected Genesis Card; if personas exist, pull objections and voice-of-customer straight from them.

## Produce (`artifacts/<slug>/offer/offer-architecture.md`)

For each rung of the ladder: **core promise · target buyer · pain stack · result stack · mechanism (the named "how") · deliverables · bonuses · truthful guarantee · price · objection handling · risk reversal · proof requirements · fulfillment plan.**

## The ladder

Build 3–5 rungs. Reference pattern (OrenGen's proven digital ladder): $47 entry → $197 → $497 → $997 → $2,997 flagship, each rung solving the *next* problem the previous rung reveals. For services: entry diagnostic/audit → core implementation → premium retainer → rev-share/partner tier. Every rung names its job: traffic monetizer, cash engine, margin engine, or moat.

## Bump / Upsell / Downsell design rules

- **Order bump** — an impulse companion to the core purchase, ≤30% of core price, one checkbox, consumed *alongside* the core (template pack, priority setup, extended license). Never a competing decision.
- **Upsell** — more speed, more scale, or done-for-you on the *same result* the buyer just committed to. Presented post-purchase, one-click. Never a prerequisite hidden behind the sale.
- **Downsell** — a payment plan or a lite version with fewer deliverables. **Never the identical product at a discount** — that trains buyers to reject the first offer.
- Take-rate assumptions for planning: bump 20–35%, upsell 10–25%, downsell save 15–30%. Replace with actuals from /og-optimize as soon as they exist.

## Pricing rules (non-negotiable)

- No fake discounts, no invented "was" prices, no countdown timers on evergreen offers.
- Charm pricing (.97/.95) only when `profile.offers.charm_pricing = true`.
- "Most Popular" badge only with 3+ tiers, and it goes on the tier you actually want sold.
- Annual discount shows the crossed-out monthly comparison only when configured.
- Setup fee and recurring fee always displayed separately.
- Deposit + balance and paid-consult structures supported; wire them to GHL payments or Stripe per profile.

## Money Math (run it, show it)

Using `references/direct-response-rules.md` §Money Math, output a small table: AOV (with take rates), gross margin, LTV, CAC ceiling (LTV/3), breakeven ROAS, payback period vs. the profile's cash-engine target (≤30–60 days for cash-engine offers). If the math doesn't clear, say so and fix the offer — don't fix the spreadsheet.

## Gates

- Guarantee language must be honorable under worst-case volume; unbounded-liability guarantees → /og-board.
- Regulated-vertical claims (finance, credit, legal, health, government) route through /og-compliance before any copy is written.
- Brand Guard pass on all offer copy: forbidden phrases, voice, no hype-slop.

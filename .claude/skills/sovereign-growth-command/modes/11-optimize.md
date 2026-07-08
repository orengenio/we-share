# Mode 11 — /og-optimize

TRACK → OPTIMIZE → SCALE. This is where SOVEREIGN compounds — every pass makes the next campaign smarter.

## Ingest

Funnel visits · opt-ins · bookings · show rate · close rate · revenue · CPL · cost per booked call · CPA · platform performance · content/hook performance · offer performance · lead quality by grade · GHL pipeline velocity · no-show rate · follow-up conversion · **bump take rate · upsell take rate · downsell save rate** · opt-out rates by channel. Pull from GHL reporting + platform analytics + payment data; accept manual CSV where APIs aren't wired.

## Statistical honesty

No verdicts on noise. Minimums before judging: ~500 impressions or 20 clicks for a hook/creative, 30 leads for a source grade, 20 checkout sessions for bump/upsell rates. Below threshold → "insufficient data, keep running," not a coin-flip decision dressed as analysis.

## Verdict format (every reviewed element)

```
element: <hook/page/offer/source/workflow>
metric: <actual vs. target>   sample: <n>
verdict: KEEP | KILL | DOUBLE | TEST
because: <one line of evidence>
next: <the specific change or test>
```

## Outputs (`artifacts/<slug>/optimize/`)

1. `performance-review.md` — what's working, what's broken, what to cut, what to double, ranked by revenue impact.
2. `next-test-queue.md` — new hooks, offers, funnel tests, follow-up tests, content angles, GHL workflow improvements — each with hypothesis + success metric. One primary test per element at a time.
3. **Money Math refresh** — replace planning assumptions in the offer doc with actuals (real AOV, real take rates, real CAC/payback).
4. **Lead-scoring evolution** — after every 25 closed outcomes, adjust rubric weights per `references/lead-scoring-rubric.md` §Evolution, re-grade the pool, log the change + evidence.
5. **winners-library.md update** — winning hooks/offers/funnels with metrics and dates; losing patterns with the autopsy line. This file is read-first by /og-viral and /og-offer forever after.

## Scale triggers

An element earns DOUBLE when it clears target on a valid sample twice consecutively. Scaling means: more budget/volume on the winner, a variant test *of the winner* (not a new idea), and a capacity check with fulfillment before the throttle opens.

# Mode 14 — /og-persona

The persona forge. Not demographic fluff, not "Marketing Mary" cardboard — **buying-trigger personas built from verbatim customer language.** A persona without real voice-of-customer lines is a guess wearing a costume.

## Mining sources (in priority order)

Sales-call transcripts and objections on file → competitor reviews (1–3 star reviews = pain in the customer's own words; 5-star = desired outcome in their words) → Reddit/forums/communities where the ICP complains → support tickets → job postings (what they're hiring to fix = what they'd pay to solve) → the profile's ICP section as the frame, never the source.

## Persona spec (2–4 personas per engagement, one file each)

```
codename: <role-situation name that sticks — "The Drowning Operator," not "Busy Brenda">
identity: <role, context, what a Tuesday looks like>
the 3am problem: <the one thing that actually keeps them up — one sentence>
pain hierarchy: urgent / expensive / embarrassing / legally risky / operationally slowing
  (map each to profile.icp.pains; rank for THIS persona)
voice-of-customer bank: <10+ verbatim-style lines mined from sources —
  their words for the pain, the failed fixes, the desired after-state>
objection stack: <every objection, ranked, each with: root fear · counter ·
  proof required · the question that closes the loop>
buying triggers: <events that open the wallet — new role, lost vendor, deadline, regulation>
delay triggers: <what makes them stall — and the cost-of-inaction math that answers it>
watering holes: <where they actually are: platforms, communities, publications, rooms>
disqualifiers: <who wears the costume but should never be sold>
that's-me line: <the ONE sentence that makes them stop scrolling — passes the Screenshot Test>
```

## Rules

- Voice-of-customer lines feed /og-scripts openers and /og-viral hooks **verbatim-flavored** — the market wrote the copy; we arrange it.
- Every objection in the stack must appear somewhere downstream: a script branch, an FAQ block, or a content asset. Unanswered objections are leaks.
- Personas are living: /og-optimize appends new objections and winning language after every 25 outcomes.
- Each persona passes the Edge check — if the codename or 3am problem could describe any competitor's customer, dig deeper.

## Produce (`artifacts/<slug>/personas/`)

One `<codename>.md` per persona + `persona-index.md` mapping each persona → ladder rung → funnel → primary channel → GHL tag.

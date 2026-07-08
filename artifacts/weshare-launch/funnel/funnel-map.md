# Rep Recruitment Funnel — Map

**Type:** partner recruitment (application-gated — friction is the qualifier: we want closers, not clickers)
**Job:** one qualified sales-partner application per visit-cohort → certified rep in ≤7 days.
**Host:** GHL funnel pages on `orengen.io` paths (owner clicks — GHL funnels are UI-only). Registration handoff to `weshare.orengen.io/register?type=PARTNER`.

```
[Traffic: job boards · referrals · rep /s/ links · organic]
        │
        ▼
(1) /partners — Landing: "Close Once. Get Paid Every Month They Stay."
        │  CTA: "Show Me the Math" → scroll anchor → "Apply to Claim a Seat"
        ▼
(2) /partners/apply — Application (10 fields, qualifying)
        │  GHL: contact created, tag `WS Rep Applicant`, pipeline → New
        │  branch: consent boxes (service required; SMS marketing optional)
        ▼
(3) /partners/booked — Thank-you + certification booking
        │  GHL: calendar embed (intro + certification role-play slot)
        │  tag `WS Rep Interview Booked`, pipeline → Appointment
        ▼
(4) WeShare registration link (sent post-interview approval)
        │  weshare.orengen.io/register?type=PARTNER (+leaderCode when recruited by a Leader)
        ▼
(5) In-app onboarding rail (already live):
    welcome email → Stripe Connect → certification pass → leads unlocked → first lead
```

**Branches**
- Application abandoned → 2-touch email recovery (24h, 72h) — GHL workflow.
- Interview no-show → no-show script (scripts/battlecards) + one rebook link, then Nurture.
- Rejected → polite close-out, tag `WS Rep Declined`, 90-day re-apply window.

**Every arrow = GHL tag + stage move** — see `ghl-element-map.md`.

**Compliance gates:** FTC income disclaimer block on (1) and (2) · SMS consent checkbox unchecked-by-default on (2) · no earnings claims anywhere ("your results depend on your effort" language locked) · "Referral Partner" vocabulary on any SMS-quoted line.

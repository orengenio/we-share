# Onboarding Email Armory — /og-scripts pass log

Live copy is the source of truth in `src/lib/email.ts` — this file is the anatomy + gate log. Voice: Trusted Counselor, Boardroom-to-Block. Enemy present in every rep email: income that resets / invisibility online. Named mechanisms in play: **the Mockup Close™ · the 4-Hour Rule · book of business · Close Once, Paid Monthly**.

| # | Email | Trigger (code) | Persona/context | Edge move | Score |
|---|---|---|---|---|---|
| 1 | Partner welcome — "here's exactly how your first week goes" | registration (`/api/auth/register`) | new closer, deciding if this is real | receipts-first ("re-earn your living every 30 days" enemy turn) | 8 |
| 2 | Payouts live — "one door left: certification" | Stripe pending→enabled flip | rep mid-rail, momentum | name the gate honestly ("skeptical plumber") — scarcity that's real | 8 |
| 3 | Certified — "you're cleared to sell" | admin certify (flip-only) | validated, hungry | "don't wait on us" → self-source claim CTA | 7 |
| 4 | Leads unlocked — "the 4-Hour Rule is now your friend" | admin unlock (flip-only) | live rep, needs habits | reframe the rule as the thing feeding them | 8 |
| 5 | Lead assigned — "the 4-hour clock is running" | admin lead assignment | in-the-moment action email | one job, one line: speed-to-lead is the leverage | 7 |
| 6 | Customer order confirmation — "your build starts now" | `checkout.session.completed` / first conversion | buyer post-payment, mild buyer's remorse window | "done being invisible online" + exact next steps + anti-surprise-billing line | 8 |
| 7 | Company number ready | admin assign_number (change-only) | certified rep | compliance baked into the celebration (consent, quiet hours, opt-outs) | 7 |

**Guard pass:** forbidden-phrase lint clean · no earnings claims to prospects (emails 1–5,7 are internal rep comms; comp facts allowed, none promise income) · customer email (6) claim set limited to approved claims (five days or less; $247/mo scope) · nothing SMS-adjacent here (email channel), vocabulary lint n/a.

**Gaps (not in this set, by design):** "sign docs / W-9" email — blocked on decision #1 · "intake received" — GHL workflow territory · win-back/no-show sets — live in GHL workflows per `funnel/ghl-element-map.md`.

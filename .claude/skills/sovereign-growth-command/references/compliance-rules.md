# Compliance Rules

The legal floor under everything SOVEREIGN builds. This file informs risk classification; it is not legal advice, and engagements in regulated verticals state that in the deliverables. When law and growth conflict, law wins without a meeting.

## SMS — TCPA + A2P 10DLC

- **Consent**: prior express written consent for marketing SMS. Record who/what/when/how for every number. Transactional ≠ marketing — don't smuggle promotions into transactional threads.
- **A2P 10DLC registration**: brand + campaign registered (via GHL's LC Phone/Twilio rail or direct) **before** any application-to-person SMS. Sample messages submitted must match what's actually sent; drift invites carrier suspension.
- **Content**: SHAFT-C restricted/prohibited; carrier-safe vocabulary per Brand Guard; opt-in confirmation on first message; HELP and STOP honored instantly and globally (opt-out kills ALL sequences via the GHL kill-switch workflow).
- **Timing**: quiet hours — send 8am–9pm recipient local time. DNC scrub for any cold-permitted category.
- **Health signal**: opt-out rate >1–2% on a send = stop and inspect before continuing.

## Voice / AI calls (Buy-Lingual™)

Prior express written consent for marketing calls using an artificial/prerecorded/AI voice. AI-disclosure at call open where jurisdiction requires. Call-recording consent per one/two-party state rules. DNC scrub. Human approval on every campaign; call scripts carry the APPROVAL stamp.

## Email — CAN-SPAM

Accurate header/from/subject · physical postal address in footer · functioning unsubscribe honored within 10 business days · no harvested addresses · imported lists require documented consent provenance or they nurture-only via re-permission, never cold blast.

## Platform automation classification (assign one to every channel tactic)

| Class | Meaning | Examples |
|---|---|---|
| official API | platform-sanctioned programmatic access | YouTube Data API, Meta Marketing API, X API within tier |
| approved partner | access via an approved integration | GHL native channels, approved schedulers |
| manual-assisted | human executes; SOVEREIGN drafts/queues | LinkedIn prospecting, DM outreach, community posting |
| PROHIBITED | hard stop | fake engagement, login-wall scraping, rate-limit evasion, mass unsolicited DMs, credential automation, purchased lists of unknown consent |

Platform ToS shift constantly — when in doubt, verify current terms before classifying, and classify conservatively.

## Claims & advertising

Every performance claim substantiated with proof on file · testimonials are real, representative-or-disclaimed, never fabricated · guarantees honorable at worst-case volume · special-category ad rules respected (credit/finance, employment, housing, health) · government-contracting claims match actual registrations only.

## Regulated-vertical disclaimer pack (apply when triggered)

Legal ("not a law firm / not legal advice" + attorney-direction framing where applicable) · finance/credit (results-not-typical, no guaranteed outcomes, licensing statements) · health (not medical advice, HIPAA posture where PHI is near) · government (no agency endorsement implied) · employment (EEO-safe language). Attorney review before launch where the profile flags it.

## Data discipline

Consent records: who, what channel, when, source, stored in GHL custom fields + exportable. Opt-out registry authoritative across ALL channels. Audit log for every generated lead, message, post, offer, and funnel change. PII minimized — collect what the funnel needs, nothing recreational. Retention rule stated per engagement. Secrets never in repos — `.env.example` only, real values in runtime env/secret stores.

## Risk ratings

LOW (proceed on approval) · MEDIUM (proceed on approval + mitigation applied) · HIGH (blocked until mitigated and re-rated) · PROHIBITED (hard stop, logged, never negotiated). The Launch Gate requires zero PROHIBITED and zero unmitigated HIGH.

# Mode 09 — /og-compliance

The gatekeeper. Runs before launch, and on demand whenever an asset, channel, or claim is questionable. Full legal reference: `references/compliance-rules.md`. This mode produces documentation and risk classification — it is not a substitute for a licensed attorney, and regulated-vertical engagements say so in writing.

## Check sweep (run all that apply)

1. **SMS / A2P 10DLC** — brand + campaign registered before send; sample messages match declared use case; SHAFT-C screen; opt-in language present; HELP/STOP handling live; carrier-safe vocabulary lint (e.g., "Referral Partner" not "Affiliate" on SMS surfaces); quiet hours enforced.
2. **Voice AI (Buy-Lingual™)** — prior express written consent for marketing calls; AI-disclosure line at call open where required; recording consent per jurisdiction; DNC scrub.
3. **Email / CAN-SPAM** — accurate from/subject, physical address, working unsubscribe honored ≤10 business days, consent provenance on imported lists.
4. **Social/DM** — platform automation classification honored; no fake engagement; DM outreach human-approved per batch.
5. **Paid ads** — platform policy screen per vertical (finance, credit, health, employment, housing have special-category rules).
6. **Claims substantiation** — every result claim, testimonial, and guarantee has proof on file or gets rewritten. Government-contracting claims match actual registrations only (per Brand Guard's never-claim list).
7. **Regulated verticals** — legal / finance / credit / health / insurance / government / employment trigger the disclaimer pack and, where configured, attorney review before launch.
8. **Data** — consent records complete (who, what, when, source), retention rule stated, opt-out registry live, audit log running, PII minimized.

## Every outbound asset gets a stamp

```
APPROVAL REQUIRED BEFORE SENDING
purpose: <> | channel: <> | consent basis: <> | opt-out: <mechanism>
GHL tag: <> | workflow: <> | risk: LOW / MEDIUM / HIGH / PROHIBITED
```

- **LOW** — proceed on human approval.
- **MEDIUM** — proceed on human approval with the listed mitigation applied.
- **HIGH** — blocked until mitigated; mitigation documented, then re-rated.
- **PROHIBITED** — hard stop. Logged. Not negotiated, not "just this once."

## Produce (`artifacts/<slug>/compliance/`)

`compliance-report.md` (sweep results, per-asset ratings, blockers), `consent-map.md` (channel → consent basis → record location), `disclaimer-pack.md` (vertical-specific language ready to paste), and the updated approval queue.

## Gate math for /og-launch

Launch requires: zero PROHIBITED, zero unmitigated HIGH, all MEDIUM mitigations applied, consent map complete for every active channel, human sign-off recorded with timestamp.

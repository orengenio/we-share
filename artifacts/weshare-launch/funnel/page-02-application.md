# Page 2 — /partners/apply (Application)

persona: closer, now curious | context: clicked from landing — intent is real
pain activated: none — this page qualifies, it doesn't sell
edge move: friction-as-filter stated out loud ("short on purpose questions aren't")
CTA: "Submit My Application" | GHL tag: `WS Rep Applicant`, pipeline → New
compliance: consent checkboxes (service required, SMS marketing optional, never pre-checked, timestamped); FTC disclaimer repeat in footer
edge score: 7/10

---

## Copy

**Headline:** ## Ten questions. Five minutes. Then we talk.

**Deck:** The application is short on purpose — the questions aren't. We're staffing seats with people who'll actually work them, because every lead we assign to a dead seat is a business owner who never got a call.

## Form fields (→ `ghl-element-map.md` for field/tag wiring)

1. Full name *(required)*
2. Email *(required)*
3. Mobile phone *(required)*
4. City & state *(required — territory context)*
5. Have you sold on commission before? `Yes—full time / Yes—side income / No, but I can hold a hard conversation` *(required, radio)*
6. What have you sold? *(short text)*
7. Hours per week you'll actually work this: `<10 / 10–20 / 20–40 / 40+` *(required, radio)*
8. When a prospect says "I need to think about it," what do you say next? *(textarea — the real filter; we read every answer)*
9. How soon can you start? `This week / Within 2 weeks / Just exploring` *(required, radio)*
10. Who sent you? *(optional — referral / rep name / leader code)*

## Consent block (styled as part of the form, exact language)

☐ **(required)** I agree OrenGen may contact me by phone and email about my application. *(service consent)*
☐ **(optional, never pre-checked)** Text me updates about my application and partner program news. Msg & data rates may apply. Reply STOP to opt out, HELP for help. *(marketing SMS consent — timestamped to GHL custom field)*

**Submit button:** `Submit My Application →`

**Under-button line:** We reply within one business day. If it's a no, it's a fast, respectful no.

*(footer: FTC income disclaimer repeat + compliance footer)*

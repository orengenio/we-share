# Mode 01 — /og-qualify

Everything downstream is only as good as this. Output: a complete `GrowthCommandProfile.json` (schema: `references/questionnaire-schema.md`), an executive summary, and a gap list.

## Rules of the interview

- **Batch, don't interrogate.** 3–5 questions per message, grouped by category. Use the interactive options widget if available.
- **Every question ships with options.** 3–4 curated choices, one marked ⭐ recommended with a one-line rationale, plus "other." Never an open blank unless the answer is a proper noun (name, domain, URL).
- **Research before questions.** If a domain or URL is given, scrape/search it first and *confirm* findings instead of asking cold.
- **Adaptive depth.** Low-ticket local business ≠ govcon pursuit. Skip categories that don't apply; note the skip in the profile.

## Mode O fast-track (OrenGen internal)

Pre-fill `business`, `brand`, `compliance.certifications` from Brand Guard §OrenGen Constants. Then ask ONLY:
1. Which offer/sub-brand is this for? (existing ladder / Buy-Lingual™ / WeShare / new)
2. Immediate + 30-day revenue target
3. Funnel goal (lead capture ⭐ / booking / direct checkout / application / partner recruitment)
4. Channels in play this campaign
5. Anything that must NOT be claimed or touched this round

≤10 questions total, then write the profile and move.

## Mode C full interview — category map

Work through A→I. Full question banks are in the doc history; ask what the category needs, not every line.

**A. Business identity** — name, for-whom (OrenGen or client), B2B/B2C/B2G/hybrid, industry + niche, geography, domain, current vs. desired positioning, credibility assets (certs, SAM.gov, BBB, case studies, testimonials), *what must never be claimed*.

**B. Revenue objective** — immediate / 30-day / 90-day / annual targets, average and minimum deal size, model (one-time / recurring / retainer / hybrid / rev-share / performance), processor (GHL payments vs. Stripe), whether bumps/upsells/downsells are wanted.

**C. Offer architecture** — core offer, problem solved, who buys / who must not, inclusions/exclusions, delivery timeline, fulfillment process, entry + high-ticket + recurring + fast-cash offers, bonuses, *truthful* guarantee, top objections.

**D. ICP & buyer psychology** — best and worst buyer, which pain is urgent / expensive / embarrassing / legally risky / operationally slowing, current alternatives, buy-now triggers, delay triggers, hard no's.

**E. Funnel type** — pick from the table in modes/04-funnel.md.

**F. GHL white-label setup** — sub-account/location, existing vs. needed pipeline + stages, tags, custom fields, forms/surveys, calendars, workflow triggers (form submit / booking / payment / no-show / opt-out), required consent language.

**G. Lead generation channels** — which of: LinkedIn, X, IG, FB, TikTok, YouTube, Google Maps/GBP, local SEO, cold email, SMS, Voice AI (Buy-Lingual™), paid ads, organic search, webinars, partnerships, directories, government portals, existing lists, referral/affiliate/sales-agent partners. For each: organic/paid/outbound/inbound/partner, consent required?, approval required?, volume limits, platform constraints, conversion event.

**H. Social & virality** — priority platforms, style (founder-led / brand-led / avatar-led / educational / direct-response), competitors + aspirational creators, forbidden topics, tone, target CTA (leads / calls / DMs / follows / downloads / purchases), Higgsfield yes/no, AI avatar yes/no, UGC ads yes/no.

**I. Compliance** — SMS? Voice AI? Email? Social DMs? Paid ads? Regulated vertical (legal, finance, health, insurance, credit, government, employment)? Required disclaimers, opt-out language, consent source + storage, who approves outbound.

## Outputs

1. `GrowthCommandProfile.json` — written to engagement root, validated against the schema.
2. **Executive summary** — one page: who they are, what they sell, who buys, the number to hit, the recommended path through the router.
3. **Gap list** — every unanswered required field, each with a default recommendation so the human can approve gaps in one pass.

Then hand off: recommend the next command (usually /og-structure for new businesses, /og-offer when the model already exists).

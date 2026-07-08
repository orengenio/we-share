# Mode 04 — /og-funnel

Build the branded conversion machine. Requires: locked offer (or run the inline mini-offer confirmation), profile categories E and F. Apply `references/direct-response-rules.md` to every page and `references/brand-guard.md` to every word and pixel spec.

## Funnel types

Lead capture · booking · paid consultation · application · webinar · quiz · survey · direct checkout · high-ticket consult · AI agency · local business · government contracting · legal support · real estate · recruiting/career · SaaS demo · white-label reseller · **partner recruitment** (WeShare pattern: recruit referral partners, tiered commission display, partner portal handoff).

Short form for low-ticket; deeper application for high-ticket. Quiz/survey funnels double as segmentation engines — every answer maps to a GHL tag. Full multi-page websites (Home/Services/About/SEO pages) are /og-website's lane — offer pages built there inherit these funnel specs.

## Produce (`artifacts/<slug>/funnel/`)

1. **funnel-map.md** — the flow diagram, every page, every branch, every GHL event.
2. **Page-by-page copy** — one file per page, wireframe + full direct-response copy: headline, outcome subheadline, CTA above the fold, pain → mechanism → proof → offer → CTA body, social proof adjacent to every form/CTA, FAQ that kills the top objections, compliance blocks where required.
3. **ghl-element-map.md** — per page: form fields, survey questions, tags applied, pipeline stage movement, workflow triggers, custom values used. This file feeds /og-ghl-sync directly.
4. **tracking-plan.md** — analytics events per page (view, form start, submit, purchase, bump accept, upsell accept/decline, booking), pixel placement, UTM convention.

## Checkout session routing (persist state across every step)

```
capture → [qualify] → checkout (+ optional ONE-click order bump before the pay button)
  → purchase success → upsell
      → accepted  → thank-you
      → declined  → downsell
          → accepted → thank-you
          → declined → thank-you
```

Every arrow fires a GHL tag + pipeline stage move + (where configured) a workflow. Abandoned checkout, no-show, and post-purchase follow-ups are specified here and built in /og-ghl-sync.

## Multilingual variant (Buy-Lingual™ hook)

If `profile.social.languages` lists more than English, generate the funnel copy variant set per language and route voice/chat follow-up through Buy-Lingual™ agents. Language variants are full localizations, not translations of idioms.

## Gates

- Consent checkboxes (SMS/voice/email) with the exact language from /og-compliance wherever a phone or email is collected for marketing.
- Page-weight and mobile-first budget per direct-response-rules — a slow funnel is a broken funnel.
- No page ships to /og-launch without its Brand Guard pass logged in STATE.

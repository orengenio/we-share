# Mode 17 — /og-website

Full AI website creation — the whole site, not just funnel pages. Requires: brand locked (Brand Guard + voiceprint); personas sharpen every page. This mode serves the website-client revenue lane directly and every Mode C delivery that needs a home base.

## Build-path decision tree (pick before writing anything)

| Path | Choose when | Output |
|---|---|---|
| **GHL website/funnel builder** | client will self-manage, speed matters, it must live inside their GHL | page specs + element build-spec, or live build via MCP with approval |
| **Code site (Next.js/static) on Coolify** | SEO-heavy, performance-critical, owned-infrastructure doctrine applies | actual deployable code — in Claude Code/Cowork, build it for real; elsewhere, build-ready specs + copy |
| **Stitch-first** | design direction undecided | Stitch mocks from wireframes + Brand Guard tokens → then one of the two paths above |

Open-source-first bias: when the client can host, code-on-Coolify wins; when they can't, GHL wins. Never a third-party site builder that rents the asset back to them.

## Site architecture (generate the sitemap, then per-page specs)

Home · one page per service lane · one offer page per ladder rung (these ARE funnel pages — inherit /og-funnel specs) · Proof/case studies (with numbers or they wait) · About — written about the buyer, per Edge doctrine, not a company autobiography · Contact/Book · legal (privacy, terms, accessibility statement).

Every page declares its job: **convert** (DR spine applies: pain → mechanism → proof → offer → CTA) or **rank** (answer-first structure, internal links routing to converters). No orphan pages; every page routes somewhere — a soft CTA minimum.

## SEO layer

Schema (Organization/LocalBusiness/Service/FAQ) · per-page meta written like ad copy, not keyword soup · internal-link map from rank-pages into convert-pages. **Local lane** (the website-client business): GBP alignment, NAP consistency, service+city pages built from real service areas — never doorway-page spam.

## Wiring (every site is a GHL organ, not an island)

All forms → GHL (native embed or webhook) with consent blocks per /og-compliance · tracking plan events (extend the funnel's `tracking-plan.md`) · calendar embeds · **Buy-Lingual™ chat agent embed** — the site ships with its own virtual employee answering at 2am, which is also a live demo of the product line · UTM/attribution fields writing on capture.

## Floors (non-negotiable)

Speed budget site-wide (the funnel rule generalized: slow = leaking) · mobile-first · accessibility floor (Brand Guard token contrast, labeled inputs, keyboard nav) · **zero lorem ipsum, ever** — real Edge-passed copy or the page waits · every page logs its Edge score + Guard pass before the Launch Gate counts it.

## Produce (`artifacts/<slug>/website/`)

`site-map.md` · per-page copy files · `design-tokens.md` (Brand Guard → CSS variables) · `seo-plan.md` · the build itself (`/build` code dir or GHL build-spec) · site section of the Launch Gate checklist.

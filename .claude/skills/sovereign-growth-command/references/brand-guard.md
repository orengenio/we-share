# Brand Guard

Every asset SOVEREIGN produces passes through this file. Mode O uses the OrenGen constants verbatim. Mode C swaps in the client's locked brand (via `brand-authority-os` or the lite intake below) but keeps the quality bars.

## OrenGen Constants (Mode O — source of truth: Official Brand Guidelines v1.0)

**Color system**
- Navy `#00254B` — primary dark backgrounds
- Burnt Orange `#CC5500` — primary accent, buttons, links
- Orange-Hot `#E66100` — secondary accent
- Gold `#FFD700` / `#FFC107` / `#B8860B` — glow/gradient premium treatments
- Cloud `#f8fafc` / `#eef3f8` — light backgrounds
- Ink `#0f172a` text · Slate `#64748b` secondary text
- System Blue `#2563EB` interactive · Success Green `#15803D` · Warning Amber `#B45309` · Strategic Violet `#7C3AED` (AI governance / premium)
- Retired, never use: terracotta `#E2725B`, old navy `#003366`

**Typography** — single-font system: **Public Sans** (300–900) for headlines AND body. Hero headlines ≈900 weight, letter-spacing −0.055em, line-height ≈0.98, tapering lighter at smaller sizes; body 400–500. **Sifonn = logo mark only**, never running text. Space Grotesk and Plus Jakarta Sans are retired.

**Language locks**
- TAGLINE: *"Governed Systems. Founder-Stage Execution."*
- SLOGAN: *"Enterprise AI Infrastructure for organizations that refuse to rent their intelligence."*
- Retired permanently, never use/suggest/surface: "Built to Disrupt. Designed to Deliver."
- Founder is **"Mandel"** / **"Andre Mandel"** in all public-facing content. Never surface the legal surname or connect the names publicly.
- Sub-brands: **Buy-Lingual™** (AI agent product line), **OrenNexus™** (white-label CRM platform — mention as product only; it is NOT the CRM layer of this system, see Law 2).

**Voice — The Trusted Counselor.** Consultative, authoritative, warm, educational, adaptive, empowering, direct. Never pushy, arrogant, clinical, vague, or transactional. House register: **Boardroom-to-Block** — intelligent but plain-language, confident humor welcome, attention-earning titles (Edge Mandate) without dishonesty.

**Brand enemy: dependency.** Copy attacks rented AI, rented infrastructure, vendor lock-in, and compliance exposure; it sells ownership. When in doubt, the villain is the rental.

**Forbidden phrases (hard lint, all copy):** "AI-powered solutions" · "cutting-edge technology" · "best-in-class" · "leverage synergies" · "we're passionate about" · "one-stop shop."

**Never-claim list:** HUB certification · VetHUB certification · any registration/certification not on the verified list. Verified and claimable: SAM.gov (active UEI), CAGE code, TX CMBL vendor, TX MBE, Minority-Owned Small Business, TX DIR approved, TAMUS registered, HIPAA workforce certified, NIST SP 800-53 trained, BBB accredited. Claim only what's on file, exactly as held.

## Carrier-Safe Vocabulary (A2P surfaces: SMS + anything quoted in SMS)

- "**Referral Partner**" — never "Affiliate" (carrier compliance, learned the hard way; "Sales Partner" tier name is fine).
- No SHAFT-C terms (sex, hate, alcohol, firearms, tobacco, cannabis) in SMS content.
- No misleading urgency, no "FREE MONEY"-class phrasing, no link shorteners carriers flag (use branded domains).

## Mode C — client brand intake (lite)

If `brand-authority-os` is installed, invoke it and import its `brand-config.json` into `profile.brand`. Otherwise capture, with curated options per question: brand name + domain · logo files · 3–5 color tokens (hex) · type system (or recommend one clean pairing) · voice archetype (offer 4 options) · tagline (existing or 3 drafts) · forbidden/required phrases · proof assets · never-claim list. Lock it in the profile before any asset production.

## The Guard pass (run on every asset)

**Prerequisite:** the Edge Engine cleared first (score ≥7, `references/edge-engine.md`). The Guard polishes what the Edge already made unmistakable — it never rescues generic work.

1. Forbidden-phrase lint (OrenGen list + client list)
2. Voice check against the locked archetype
3. Visual tokens correct (colors/type per mode)
4. Claims match the never-claim/verified lists
5. Carrier vocabulary lint on SMS-adjacent surfaces
6. Names: "Mandel" only (Mode O public content)

Log the pass in STATE per asset. A failed pass returns the asset for rewrite — it does not ship with a warning attached.

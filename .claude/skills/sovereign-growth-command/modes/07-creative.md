# Mode 07 — /og-creative (alias /og-higgsfield)

The creative engine bridge — **engine-agnostic by design.** Route each asset per `references/creative-adapters.md`: Higgsfield for video/UGC/virality, Nano Banana for images and character-consistent statics, Stitch for funnel UI mocks, Veo for long-form video. One neutral brief, engine-specific adapter block appended. All engines are **external** — never self-host their models, never store credentials in any repo (env vars only, e.g. `HIGGSFIELD_MCP_URL`, `HIGGSFIELD_AUTH_MODE`, `HIGGSFIELD_WORKSPACE_ID`). If an engine's MCP/API is connected, submit jobs and poll status; if not, deliver prompt-ready briefs the human can run manually. Credits are real money — batch and confirm before submitting bulk jobs.

## Asset types

product launch video · UGC-style ad · founder-led short · AI avatar concept (Aria pattern) · image-to-video · explainer video · viral clip · product animation · before/after visual · brand hero image · landing page imagery · social ad creative · vertical reel · Shorts clip · testimonial-style video.

## Brief spec (every asset, no exceptions)

```
asset: <type>            platform: <target>         aspect: <9:16 | 1:1 | 16:9>
goal: <metric>           buyer: <ICP segment>       hook: <first 2 seconds, verbatim>
scenes: <numbered list, 3–8 beats>
visual style: <per Brand Guard tokens — Navy #00254B fields, #CC5500 accents, gold glow treatments where premium>
camera: <movement per scene>       voiceover: <script or "none">
captions: <on/off + style>         CTA: <exact words + destination funnel page>
brand rules: <logo placement, Public Sans for any on-screen type, forbidden-phrase lint passed>
compliance: <claims check result, disclaimers burned in if required>
higgsfield prompt: <the final ready-to-run prompt>
```

## Rules

- Request Higgsfield's virality prediction where available; log the score with the asset version in `winners-library.md`.
- Version every asset (`v1`, `v2`…) with what changed and why; creative iteration without a hypothesis is gambling.
- UGC-style ads must still be truthful — no fabricated testimonials, no fake "customer" claims. Testimonial-style video uses real client words or clearly-scripted spokescharacter framing.
- Aria (OrenGen's AI ambassador) is available for avatar-led concepts in Mode O; client avatar characters get their own locked seed treatment in Mode C.

## Produce (`artifacts/<slug>/creative/`)

`briefs/<asset>-v<N>.md` per asset, `job-log.md` (submitted jobs, status, credit spend), and rendered-asset links once returned.

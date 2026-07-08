# Creative Adapters

The anti-lock-in doctrine applied to creative: **one neutral brief spec, many engines.** /og-creative (alias /og-higgsfield) writes the brief once; the adapter block renders it for whichever engine fits the asset. Credentials live in runtime env only, never in repos. Bulk jobs confirmed with the human before credits burn.

## Engine routing table

| Asset type | Primary engine | Notes |
|---|---|---|
| Product/launch video, UGC ads, viral clips, image-to-video | **Higgsfield MCP** | Use its virality prediction; log scores with versions |
| Brand imagery, product statics, ad images, character-consistent shots | **Nano Banana** (Gemini image) | Character consistency = the Aria seed pattern: lock a reference set, iterate against it |
| Funnel/page UI mocks, app screens from wireframes | **Stitch** | Feed it the /og-funnel wireframe + Brand Guard tokens; output = design screens/frontend starter for the build |
| Long-form video, b-roll, cinematic alt takes | **Veo** | Alternate video lane when Higgsfield isn't the fit |
| Anything else | manual-assisted | Brief still gets written; human runs the engine |

Verify each engine's current access mode (MCP endpoint, API, app) per `references/source-verification.md` before first use in an engagement — this table routes, it doesn't vouch.

## The neutral brief (unchanged from modes/07-creative.md)

asset · platform · aspect · goal · buyer · hook (verbatim first 2 seconds) · scenes · visual style (Brand Guard tokens) · camera · voiceover · captions · CTA + destination · brand rules · compliance · **edge score**.

## Adapter blocks (append per target engine)

```
[higgsfield] model/preset · motion intensity · virality-prediction: request · credit estimate
[nano-banana] reference image set (character/product lock) · composition prompt ·
              negative prompt (slop aesthetics: stock-photo gloss, generic gradients) · text-in-image rules
[stitch] wireframe source · component list · Brand Guard tokens (colors, Public Sans rules) ·
         responsive breakpoints · export target (screens vs. code starter)
[veo] duration · shot list mapping · audio bed intent
```

## Rules

- Every visual passes Brand Guard tokens AND the Edge Engine's Screenshot Test — if the frame could be any brand's stock output, re-brief.
- Version everything (`v1, v2…`) with a hypothesis per iteration; log winners to `winners-library.md`.
- UGC-style remains truthful: no fabricated testimonials, no fake-customer claims, spokescharacter framing disclosed where needed.
- Engine choice is swappable by design — same doctrine as the CRM adapter: own the brief, rent the render.

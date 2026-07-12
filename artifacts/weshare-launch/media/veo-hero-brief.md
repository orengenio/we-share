# Veo Hero Video Brief — /get-started (OrenWeb funnel)

Per SOVEREIGN `references/creative-adapters.md`: external engines only — **own the
brief, rent the render.** Your `GEMINI_API_KEY` gives access to Google's **Veo**
video model through AI Studio / the Gemini API (this session can't call it —
network policy + the key lives only in Coolify), so generate it in
[aistudio.google.com](https://aistudio.google.com) → Veo, then:
1. Download the mp4 → upload to the GHL media library (or commit to `/public/media/`).
2. Coolify env: `NEXT_PUBLIC_HERO_VIDEO_URL=<mp4 url>` (+ optional `_POSTER`) → redeploy.
3. The video slot on `/get-started` renders automatically — muted autoplay loop with controls.

## Generation prompt (8s loop, 16:9 — run 2–3 seeds, keep the calmest)

> Cinematic slow push-in on a small-town plumber's work van at golden hour, the owner
> checking his phone with a slight frown; cut to the same phone showing a clean,
> professional business website loading — deep navy (#00254B) header, warm orange
> (#CC5500) call button, his business name in bold type; his expression lifts; final
> beat: the website on a laptop in a warmly lit office, a new call notification
> appearing. Photorealistic, warm natural light, shallow depth of field, steady
> unhurried camera, no text overlays, no logos, no people speaking.

**Negative prompt:** no captions, no watermarks, no fantasy elements, no fast cuts,
no stock-footage gloss, no visible brand names.

## Rules (Brand Guard applies to video too)
- No text overlays claiming anything — claims live in page copy, already approved.
- If any UI is shown, it must look like OUR palette (navy/orange) — regenerate if the
  model invents a different brand look.
- Keep it under ~10s and under ~8 MB (compress with `ffmpeg -crf 28`) — a slow funnel
  is a broken funnel (direct-response page-weight rule).

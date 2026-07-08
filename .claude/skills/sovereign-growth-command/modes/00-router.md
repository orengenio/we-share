# Mode 00 — Router

The traffic controller. Every session passes through here.

## Turn protocol

1. **Read state first.** `STATE.md` → `GrowthCommandProfile.json` → (if the request touches content or offers) `winners-library.md`. Never re-ask what state already answers.
2. **Confirm engagement mode** (O or C) if not already locked in STATE.
3. **Map the request to a command.** Explicit `/og-*` routes directly. Plain-language requests map by intent:
   - "get me clients / more leads" → /og-leads (profile permitting)
   - "sell this / price this / package this" → /og-offer
   - "build me a funnel / landing page / checkout" → /og-funnel
   - "content / posts / go viral / hooks" → /og-viral
   - "videos / ads / creative" → /og-higgsfield
   - "set up GHL / pipeline / automations" → /og-ghl-sync
   - "is this legal / can we send this" → /og-compliance
   - "we're live / launch it" → /og-launch (Launch Gate enforced)
   - "what's working / what's broken" → /og-optimize
   - "who should we go after" → /og-opportunities
4. **Validate inputs.** Each mode lists required profile fields. Missing fields → run a micro-qualify (only the gaps), never a full re-interview.
5. **Execute the mode.** Write artifacts to `artifacts/<engagement-slug>/<mode>/`.
6. **Close the turn.** Update `STATE.md`: phase, artifacts written, pending approvals, next 1–3 actions. Surface pending approvals to the human every turn until cleared.

## Sequencing rule

Natural build order for a fresh engagement:

```
qualify → genesis (if no offer exists) → structure → persona → offer → scripts
        → funnel → ghl-sync → compliance → launch → optimize
   (leads, viral, audience, creative run in parallel once offer + personas are locked)
```

If the user jumps ahead (e.g., asks for a funnel with no offer locked), do the minimum upstream work inline — a one-screen offer confirmation — rather than refusing or silently guessing.

## Escalation triggers → /og-board

Route to the AI Board of Directors skill (if installed) before locking:
- New pricing floor or >20% price change on an existing offer
- Killing or pivoting a core offer
- Entering a new vertical or business line
- Any single decision with >$10k exposure
- Guarantee terms with unbounded liability

If the Board skill isn't installed, present the decision with a structured pro/con + risk table and get explicit human sign-off instead.

# WeShare × Reference Repos — Integration Plan

**Date:** 2026-07-08  
**Status:** Analysis complete — ready for phased implementation  
**Scope:** `orengenio/we-share` only. Reference repos inform patterns; we do **not** wholesale fork any repo into production.

---

## Executive summary

WeShare is already a **production-grade, domain-specific** platform (dual-track referral + sales partner, rank ladder, army overrides, GHL v2, Stripe Connect Express, Redis fraud, disputes, compliance footer, onboarding tour, materials library, prospect registration with claim/dedup, bulk CSV import, partner email sequence). It is **ahead** of all five reference repos on business logic fit.

The reference repos are best used as **pattern libraries**, not replacements:

| Repo | Verdict | Primary value to WeShare |
|------|---------|--------------------------|
| [Refferq](https://github.com/Refferq/Refferq) | **Port patterns** (MIT) | Outbound webhooks, commission maturity, admin reports, partner groups, email template admin |
| [refref](https://github.com/amicalhq/refref) | **Reimplement ideas only** (AGPL-3.0) | Attribution embed script, event→reward rule engine, vanity campaign links, track API |
| [affiliate-management-system](https://github.com/prathammahajan13/affiliate-management-system) | **Skip as product** | Tier calc + link validation ideas only; most modules are stubs |
| [mlm](https://github.com/guruperl/mlm) | **Skip paradigm** | Ledger batch ideas only; binary MLM is off-brand and non-compliant with WeShare rules |
| [raider](https://github.com/valeriansaliou/raider) | **Port API shape** (MPL-2.0) | Per-campaign tracker schema, payment-reporting API contract, payout-request lifecycle |

**Sovereign Growth Command** (`sovereign-growth-command.skill` in repo root) is the **growth/ops OS** — funnels, GHL builds, compliance gates, offer genesis. It complements WeShare (partner ledger + attribution) but does not replace app code. Use it for **content, funnel, and GHL workflow** work; wire outputs into WeShare via webhooks and GHL sync.

---

## WeShare current state (post PR #29–#30)

### Live & merged (`main` as of `3b3264c`)

| Area | Implementation |
|------|----------------|
| **Attribution** | `/r/[code]`, 90-day cookie, lead lock, Redis burst fraud |
| **Sales partner ops** | Prospect register + claim/dedup, GHL opportunity sync, CSV bulk import |
| **Commissions** | Rank tiers, residuals, army overrides, leader overrides, clawback status |
| **Payouts** | Stripe Connect Express, Friday batch run, admin payout UI |
| **CRM** | GHL v2 client — contacts, tags, pipelines, email via GHL |
| **Compliance** | `ComplianceFooter` on all surfaces; role-gated PDFs in `/resources` |
| **Partner UX** | Onboarding checklist, guided tour, settings (avatar, leaderboard opt-in), materials library |
| **Admin** | Fraud review, disputes, commissions, leads, affiliates, partners, test email |
| **Email** | Affiliate welcome, partner welcome, Stripe-ready, certified, leads-unlocked |

### Still missing (from `HANDOFF.md` + this analysis)

| Priority | Item | Source inspiration |
|----------|------|-------------------|
| P0 | `/s/[code]` sales-partner tracking link + schema migration | Raider tracker pattern + WeShare `/r/` |
| P0 | GHL checkout → WeShare conversion webhook (close attribution loop for reps) | RefRef track API + Refferq inbound webhooks |
| P1 | Outbound admin webhooks (N8N/general) with HMAC + retry + delivery log | **Refferq** |
| P1 | Commission `maturesAt` hold before payout eligibility | **Refferq** + handbook NET-15 |
| P1 | Embeddable attribution script for orengen.io forms | **RefRef** (reimplement, AGPL) |
| P1 | A2P assigned number per rep (field + admin set + dashboard display) | HANDOFF #3 |
| P2 | Marketing consent capture (timestamped, separate checkboxes) | HANDOFF #5 + Sovereign compliance |
| P2 | Customer confirmation emails (order receipt, intake) | Sovereign `/og-onboard` + GHL workflows |
| P2 | Admin cohort/CSV export reports | **Refferq** scheduled reports |
| P2 | Partner groups (VIP rate overrides without rank change) | **Refferq** |
| P3 | Admin-editable email templates + send log | **Refferq** |
| P3 | Public API keys for external integrations | **Refferq** |
| P3 | Audit log UI expansion (schema exists) | **Refferq** |

### Explicitly do NOT port

- **Binary MLM tree / pairing** (mlm) — violates WeShare anti-MLM positioning and handbook
- **RefRef AGPL code** — reimplement attribution embed only
- **affiliate-management-system** fraud/AI/analytics stubs — WeShare `fraud.ts` + admin UI are real
- **Raider/Rust service** — stay on Next.js monolith
- **Upsell language on rep surfaces** — Sovereign + HANDOFF guardrails

---

## Feature-by-feature: best-of matrix

### From Refferq (MIT — safest to borrow code patterns)

1. **Outbound `Webhook` model** — event types: `commission.approved`, `payout.completed`, `fraud.flagged`, `lead.registered`
2. **`maturesAt` on Commission** — auto-approve after hold window; aligns with 30-day clawback
3. **`PartnerGroup`** — optional override rates for invited cohorts
4. **Scheduled reports** — weekly admin email of top performers, pending payouts
5. **EmailTemplate + EmailLog** — complement GHL; admin preview before send

### From RefRef (AGPL — ideas only)

1. **`@refref/attribution-script` pattern** — lightweight JS: read `?ref=` / cookie, inject hidden fields on orengen.io lead forms
2. **Event → rule → reward pipeline** — formalize WeShare's `Conversion` → `Commission` as idempotent rules
3. **Vanity `reflink` slugs** — extend `AffiliateLink` with human-readable slugs beyond random codes
4. **`POST /v1/track/signup|purchase`** — external integration surface for GHL checkout callbacks
5. **Participant widget** — optional embed for partner stats (lower priority; dashboard exists)

### From Raider (MPL — API/schema reference)

1. **Labeled tracker per campaign** — already have `AffiliateLink`; add aggregate stats API shape
2. **`POST /track/payment`** contract — amount, currency, trace ID → commission credit
3. **Payout request state machine** — partner-initiated request above minimum (Stripe transfer still admin-triggered)

### From affiliate-management-system (MIT — algorithms only)

1. **Link expiry + max-clicks** on campaign links
2. **Attribution model hooks** (last-click default; document we use lead-lock override)
3. **Volume bonus calculator** — only if product wants tier accelerators beyond rank table

### From mlm (LGPL — skip code, ledger concept only)

1. **Immutable ledger entries** with typed reasons — WeShare `Commission` is close; add `sourceEventId` audit chain everywhere
2. **Compensation preview (dry-run)** — admin "simulate payout" before Friday run

---

## Sovereign Growth Command — how it fits

The `.skill` bundle is OrenGen's **growth command OS** (qualify → offer → funnel → GHL → launch). It is **not** a codebase to merge into WeShare.

**Use Sovereign for:**
- Customer funnel copy + GHL element maps (7 services — ephemeral; re-request from owner)
- `/og-scripts` → handbook §6 battlecards (already partially in `orengen-partner-handbook.md`)
- `/og-compliance` → validate rep-facing copy before deploy
- `/og-ghl-sync` → pipeline/stage/tag blueprints (WeShare already syncs partners)
- `/og-onboard` → rep onboarding runbook content (complements in-app checklist)

**Wire Sovereign outputs into WeShare:**
- GHL workflows trigger `POST /api/webhooks/ghl` for stage changes
- n8n (`N8N_FRAUD_ALERT_WEBHOOK_URL` pattern) → generalize to outbound webhooks
- Funnel forms POST to `/api/track/lead` with consent fields

**Install for Cursor:** unzip `sovereign-growth-command.skill` → copy `sovereign-growth-command/SKILL.md` to project skills or reference from agent instructions.

---

## Integration architecture (target)

```
┌─────────────────────────────────────────────────────────────┐
│                     weshare.orengen.io                       │
│  Next.js 14 · Prisma · Postgres · Redis · JWT auth          │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ Public       │ Partner      │ Admin        │ APIs           │
│ /r/[code]    │ dashboards   │ ops console  │ /api/track/*   │
│ /s/[code] NEW│ prospects    │ webhooks NEW │ /api/v1/* NEW  │
│ calculator   │ materials    │ reports NEW  │ webhooks in    │
│ leaderboard  │ settings     │              │                │
├──────────────┴──────────────┴──────────────┴────────────────┤
│ attribution.js (NEW) — embed on orengen.io forms              │
├─────────────────────────────────────────────────────────────┤
│ GHL (agency PIT) │ Stripe Connect │ n8n outbound webhooks     │
└─────────────────────────────────────────────────────────────┘
```

---

## Phased implementation roadmap

### Phase 1 — Close attribution gaps (1 PR, needs migration + owner verify)

- [ ] Migration: `Click.partnerId` optional, `Click.affiliateId` optional (XOR constraint)
- [ ] `src/app/s/[code]/route.ts` mirroring `/r/[code]`
- [ ] `recordPartnerClick()` in `tracking.ts`
- [ ] GHL webhook handler: create `Conversion` with `partnerId` from checkout metadata
- [ ] Partner dashboard: "My tracking link" card

### Phase 2 — Integration hardening (Refferq patterns)

- [ ] `OutboundWebhook` + `WebhookDelivery` models
- [ ] Admin UI: configure URL, secret, event subscriptions
- [ ] HMAC signing + retry with exponential backoff
- [ ] `Commission.maturesAt` + cron or payout-run filter

### Phase 3 — External embed (RefRef-inspired, clean-room)

- [ ] `public/weshare-attribution.js` — cookie + URL param + form injection
- [ ] Docs page for orengen.io implementers
- [ ] CORS + allowed origins config

### Phase 4 — Ops & rep tooling

- [ ] `PartnerProfile.assignedPhone` + admin assign + email
- [ ] Consent model + capture on any WeShare forms
- [ ] Customer transactional emails (or document as GHL-only)
- [ ] Admin export: commissions CSV, cohort report

### Phase 5 — Sovereign-assisted content (non-code + GHL)

- [ ] Regenerate funnel copies via Sovereign `/og-funnel`
- [ ] GHL workflow pack for rep onboarding emails not yet in app
- [ ] Winners library → feed ad copy pack updates

---

## Environment & integrations (no secrets in repo)

All credentials via Coolify env vars. Owner will rotate after project completion.

| Integration | Purpose | WeShare touchpoints |
|-------------|---------|---------------------|
| GHL Agency PIT | CRM, email, pipelines | `src/lib/ghl.ts`, webhooks |
| GHL Location `dMEB004RUX8JRRi42Kzq` | Partner pipeline sync | env `GHL_LOCATION_ID` |
| Stripe Connect | Rep payouts | `src/lib/stripe.ts` |
| n8n | Automation bridge | outbound webhooks (Phase 2) |
| Cloudflare | DNS/proxy for weshare.orengen.io | infra only |
| Gemini | Optional AI in settings | `src/lib/gemini.ts` |

**Do not commit:** API tokens, PIT keys, JWT secrets, Cloudflare keys, n8n JWT.

---

## License compliance checklist

| Repo | License | Action |
|------|---------|--------|
| Refferq | MIT | Can adapt code with attribution in commit/NOTICE |
| refref | AGPL-3.0 | **Reimplement only** — no copy-paste into proprietary deploy |
| affiliate-management-system | MIT | Algorithms OK; skip stub modules |
| mlm | LGPL-2.1 | Do not embed Perl code |
| raider | MPL-2.0 | API design reference only |

---

## Fork strategy (GitHub)

When implementation begins, create **read-only forks** under `orengenio/` for reference:

- `orengenio/Refferq` (upstream sync quarterly)
- `orengenio/refref` (read-only; AGPL awareness)
- Others: shallow clone locally only unless team wants permanent forks

**WeShare remains the single production codebase.** No submodule imports of reference repos.

---

## Next actions for agent session

1. Owner confirms Phase 1 priority (`/s/[code]` + GHL conversion loop)
2. Reset working branch: `git checkout -B claude/affiliate-partner-program-p42c0p origin/main`
3. Implement Phase 1 migration + routes + tests
4. Deploy with owner reachable (auto-migrate on container start)
5. Rotate all tokens/keys after verification

---

## References

- `HANDOFF.md` — engineering handoff (2026-07-07)
- `sovereign-growth-command.skill` — OrenGen Growth Command OS v2.1
- Production: https://weshare.orengen.io
- GHL white-label: app.orengen.io / api.orengen.io

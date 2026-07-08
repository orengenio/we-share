# GHL Element Map — Rep Recruitment Funnel

Feeds /og-ghl-sync. Pipeline: **WeShare Partner Pipeline** (`5kXJgKVijokWag4enbJ5`); stage IDs are the `GHL_STAGE_*` env values.

## Page 1 — /partners (landing)
- No form. Tracking pixel event `rep_lp_view` (see tracking-plan).
- CTA → /partners/apply.

## Page 2 — /partners/apply
**Form: "WS Rep Application"** → creates/updates contact.

| Field | GHL mapping |
|---|---|
| Full name | contact first/last |
| Email | contact email |
| Mobile | contact phone |
| City & state | custom field `ws_rep_city_state` |
| Commission experience | custom field `ws_rep_experience` (radio value) |
| What sold | custom field `ws_rep_sold_what` |
| Hours/week | custom field `ws_rep_hours` |
| "Think about it" answer | custom field `ws_rep_objection_answer` |
| Start timing | custom field `ws_rep_start` |
| Who sent you | custom field `ws_rep_referrer` (leader code if present) |
| Service consent | custom field `ws_consent_service` + timestamp `ws_consent_service_at` |
| SMS marketing consent | custom field `ws_consent_sms_mkt` + timestamp `ws_consent_sms_mkt_at` |

**On submit:** tag `WS Rep Applicant` · opportunity in Partner Pipeline @ **New** (`GHL_STAGE_NEW`) · workflow `WS Rep — Application Received` (email confirm; SMS confirm ONLY if `ws_consent_sms_mkt` true).

## Page 3 — /partners/booked
- Calendar: **OrenGen Partner Intro** (15 min) — booking fires tag `WS Rep Interview Booked` · stage → **Appointment** (`GHL_STAGE_APPOINTMENT`) · workflow `WS Rep — Interview Reminders` (24h + 1h reminders; SMS gated on consent).

## Workflows to build (dependency order — opt-out kill-switch FIRST)
1. `WS — STOP kill-switch` (global; STOP/unsubscribe removes from ALL sequences, writes opt-out).
2. `WS Rep — Application Received` (instant email; +24h and +72h nudge if not booked).
3. `WS Rep — Interview Reminders`.
4. `WS Rep — No-show` (rebook link once, then stage → Nurture `GHL_STAGE_NURTURE`).
5. `WS Rep — Approved` (manual trigger post-interview): sends WeShare registration link `weshare.orengen.io/register?type=PARTNER` (+`&leader=CODE` when applicable) · stage → **Proposal** (`GHL_STAGE_PROPOSAL`). Registration itself flips the rail to the in-app sequence (welcome → Stripe → certification → leads).
6. `WS Rep — Declined` (manual): close-out email, tag `WS Rep Declined`, opportunity → Lost (`GHL_STAGE_LOST`).

## Vocabulary lint
Any line quoted into SMS says **"Referral Partner" / "Sales Partner"** — never "Affiliate."

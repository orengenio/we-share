# Tracking Plan — Rep Recruitment Funnel

**UTM convention:** `utm_source` (jobboard|referral|rep|organic|social) · `utm_medium` (cpc|post|dm|email) · `utm_campaign=rep-recruit-2026q3` · rep-shared links use their WeShare `/s/<code>?dest=https://orengen.io/partners` so the click is attributed in-app too.

| Event | Where | Fires |
|---|---|---|
| `rep_lp_view` | /partners | page view |
| `rep_lp_math_view` | /partners | Block 2 scroll-into-view (the math is the message — measure it) |
| `rep_apply_start` | /partners/apply | first field focus |
| `rep_apply_submit` | /partners/apply | form success → GHL |
| `rep_interview_booked` | /partners/booked | calendar confirm |
| `rep_registered` | WeShare | `partner.registered` outbound webhook (already emitted by the app) |
| `rep_certified` / `rep_leads_unlocked` | WeShare | admin actions (in-app emails already fire; mirror to analytics via outbound webhook subscription) |

**Funnel health reads (weekly):** LP→apply-start ≥20% · apply-start→submit ≥60% (10 fields is deliberate friction; below 40% = fields 8/6 too heavy) · submit→booked ≥50% · booked→registered ≥70%. Below floor two weeks running → /og-optimize pass.

**Pixels:** GHL native page tracking + (if Meta/Google spend starts) their pixels on all three pages, conversion event = `rep_apply_submit`, NOT lp_view.

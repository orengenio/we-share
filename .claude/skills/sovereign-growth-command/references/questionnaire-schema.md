# GrowthCommandProfile — Schema

The single source of truth. Written by /og-qualify, read by everything, updated the moment any decision locks. Template: `assets/GrowthCommandProfile.template.json`.

```jsonc
{
  "meta": {
    "engagement_slug": "",        // kebab-case, used for artifacts/ path
    "mode": "O | C",
    "created": "", "updated": "",
    "status": "qualifying | structured | building | launched | optimizing"
  },
  "business": {                    // Category A
    "name": "", "for_whom": "orengen | client",
    "market_type": "B2B | B2C | B2G | hybrid",
    "industry": "", "niche": "", "geography": "",
    "domain": "", "positioning_current": "", "positioning_desired": "",
    "credibility_assets": [], "never_claim": []
  },
  "revenue_targets": {             // Category B
    "immediate": 0, "day30": 0, "day90": 0, "annual": 0,
    "avg_deal": 0, "min_deal": 0,
    "model": "one_time | recurring | retainer | hybrid | rev_share | performance",
    "processor": "ghl | stripe", "wants": { "bump": true, "upsell": true, "downsell": true }
  },
  "offers": {                      // Category C — one object per ladder rung
    "ladder": [{ "name": "", "role": "entry | core | premium | recurring | fast_cash",
      "promise": "", "price": 0, "includes": [], "excludes": [],
      "delivery_timeline": "", "fulfillment": "", "guarantee": "", "objections": [] }],
    "bump": {}, "upsell": {}, "downsell": {},
    "charm_pricing": false, "annual_discount_display": false
  },
  "icp": {                         // Category D
    "best_buyer": "", "worst_buyer": "",
    "pains": { "urgent": "", "expensive": "", "embarrassing": "", "legal_risk": "", "operational": "" },
    "alternatives": [], "buy_now_triggers": [], "delay_triggers": [], "hard_nos": []
  },
  "funnel": {                      // Category E
    "type": "", "goal": "lead | booking | checkout | application | partner_recruitment | ...",
    "pages": [], "languages": ["en"]
  },
  "ghl": {                         // Category F
    "location_id": "", "pipeline": { "name": "", "stages": [] },
    "tags": [], "custom_fields": [], "forms": [], "surveys": [], "calendars": [],
    "workflow_triggers": ["form_submit", "booking", "payment", "no_show", "opt_out"],
    "consent_language": { "sms": "", "voice": "", "email": "" }
  },
  "lead_generation": {             // Category G — one object per channel
    "channels": [{ "name": "", "class": "official_api | approved_partner | manual_assisted | prohibited",
      "motion": "organic | paid | outbound | inbound | partner",
      "consent_required": true, "approval_required": true,
      "volume_limit": "", "conversion_event": "" }]
  },
  "social": {                      // Category H
    "platforms": [], "style": "founder | brand | avatar | educational | direct_response",
    "competitors": [], "aspirational_creators": [], "forbidden_topics": [],
    "cta_target": "", "higgsfield": true, "ai_avatar": false, "ugc_ads": false
  },
  "brand": {                       // Brand Guard payload (Mode O: OrenGen constants; Mode C: client)
    "colors": {}, "type": {}, "voice": "", "tagline": "",
    "forbidden_phrases": [], "proof_assets": [], "never_claim": []
  },
  "compliance": {                  // Category I
    "channels_active": { "sms": false, "voice_ai": false, "email": false, "dm": false, "paid_ads": false },
    "regulated_vertical": "none | legal | finance | credit | health | insurance | government | employment",
    "disclaimers_required": [], "consent_source": "", "consent_storage": "ghl_custom_fields",
    "outbound_approver": "", "attorney_review": false
  },
  "launch_plan": { "day30": [], "day90": [] },
  "optimization": { "kpi_targets": {}, "scoring_weights_version": 1 }
}
```

Validation rule: /og-qualify may leave fields empty only if they appear on the gap list with a recommended default. Gate-relevant fields (compliance.*, ghl.location_id when executing live, offers.ladder[0]) must be resolved before their dependent modes run.

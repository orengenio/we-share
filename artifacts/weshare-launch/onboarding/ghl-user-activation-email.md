# GHL User Activation Email — Replace the Cheesy Default

**What you saw:** `Activate Your Account | OrenGen Worldwide` from `noreply@donotreply.acct-mgmt.com` with *"We're thrilled to have you join our platform!"*

That is **GoHighLevel's system email** when you add a team user under **Settings → My Staff → Add User**. It is **not** sent by WeShare. GHL ships a generic template until you replace it.

**Goal:** On-brand OrenGen copy, navy/orange styling, no startup-cheese voice.

---

## Fix it in GHL (one-time, ~15 minutes)

### Path A — Agency account (recommended)

1. Open **Agency view** (not the sub-account).
2. Go to **Agency Settings → System Emails**.
3. Find **Welcome Email** (new user / activation).
4. Click **Change Template** → select sub-account **OrenGen Worldwide** (`dMEB004RUX8JRRi42Kzq`).
5. Either edit the existing template or create a new one under **Email Marketing → Templates**.
6. In the template **Settings** panel:
   - Upload OrenGen logo (navy mark on white or white on navy).
   - CTA button color: `#CC5500` (OrenGen orange).
   - Background accent: `#00254B` (navy).
7. Replace body copy with the block below (keep GHL's activation button block — do not delete it).
8. **Save.** Do not delete this template later or GHL reverts to the default cheesy version.

Help article: [Guide to changing Agency System Email Templates](https://help.gohighlevel.com/support/solutions/articles/155000004565-guide-to-changing-agency-system-email-templates)

### Path B — SaaS Configurator (if you provision SaaS sub-accounts)

1. **SaaS Configurator → Advanced Settings → Customize Welcome Email → Customize Now**
2. Select sub-account **OrenGen Worldwide**
3. Same branding + copy as Path A

---

## Copy-paste for GHL email builder

**Subject line** (GHL may force a prefix on some plans — customize what you can):

```
Your OrenGen CRM seat — activate login
```

**Preheader / preview:**

```
Set your password, then log touches same-day. Only Assigned Data is on by design.
```

**Headline (H1):**

```
Your CRM seat is ready, {{user.first_name}}
```

**Body paragraphs** (use the email builder's text blocks):

```
You have been added as a Sales Partner in the OrenGen CRM. This seat is limited by design: you see only the contacts and conversations assigned to you — not the full company pipeline.

Activate your login using the button below. You will use this CRM to log every call, text, and stage change on your leads. If it is not logged same-day, it did not happen for commission purposes.

After activation, bookmark your login: https://app.orengen.io

Operating rules (non-negotiable):
• Only Assigned Data — your leads, your book of business
• 4-Hour Rule on assigned leads — first touch inside 4 hours
• SMS only with prior consent; 8 AM–9 PM local; honor STOP instantly
• Never discuss commissions or income claims with prospects

Questions? Reply to team@crm.orengen.io — do not email passwords.
```

**Sign-off:**

```
— The OrenGen Team
OrenGen Worldwide LLC
```

**Keep GHL's built-in activation button** — it contains the secure one-time link. Label the button:

```
Activate my CRM login
```

---

## WeShare complement (after you add the user in GHL)

1. In GHL: **Settings → My Staff → Add User** (role: User, Only Assigned Data ON).
2. In WeShare: **Admin → Partners → Grant CRM seat** on that partner.

WeShare sends a **second, branded email** (`sendPartnerGHLAccessReady`) that explains the two-email flow and links to `GHL_LOGIN_URL`. The GHL activation email still must be customized as above — WeShare cannot override `acct-mgmt.com` system mail.

---

## What NOT to use GHL user invites for

| Flow | Right tool |
|------|------------|
| Rep applies / gets approved | GHL workflows → WeShare `/register?type=PARTNER` |
| Welcome + onboarding sequence | **WeShare** (`partner_welcome` → Stripe → certify → leads) |
| CRM seat at certification | GHL My Staff + customize System Welcome + WeShare **Grant CRM seat** |
| Transactional mail (payouts, leads) | **Mailwizz** via WeShare — not GHL |

---

## Voice lint (delete if you see these in GHL templates)

- "We're thrilled to have you join our platform!"
- "Welcome aboard!"
- "Click Here to Login" (use "Activate my CRM login" instead)
- Generic copyright footer with random admin personal email — use `team@crm.orengen.io`

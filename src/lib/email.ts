import nodemailer, { type Transporter } from "nodemailer";
import { isGHLConfigured, sendEmailViaGHL } from "@/lib/ghl";
import { isMailwizzConfigured, sendEmailViaMailwizz } from "@/lib/mailwizz";
import { buildBrandedEmail } from "@/lib/email-ai";
import { p, ol, ul, highlightBox, type EmailLayoutOptions } from "@/lib/email-layout";

export type EmailProvider = "mailwizz" | "ghl" | "smtp";

function isSmtpConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

function resolveEmailProvider(): EmailProvider {
  const explicit = (process.env.EMAIL_PROVIDER || "").toLowerCase();
  if (explicit === "mailwizz" || explicit === "ghl" || explicit === "smtp") {
    return explicit;
  }
  // Prefer Mailwizz/SMTP over GHL for transactional mail — GHL only authenticates
  // senders on crm.orengen.com; an @orengen.io From via GHL fails DMARC.
  if (isMailwizzConfigured()) return "mailwizz";
  if (isSmtpConfigured()) return "smtp";
  if (isGHLConfigured()) return "ghl";
  return "smtp";
}

// The deployment is configured for SMTP (mail.orengen.io) via SMTP_* env vars.
// Build the transporter lazily so a missing/incomplete mail config never
// crashes at module load — routes that send mail catch failures individually.
let transporter: Transporter | null = null;

function getTransport(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  // SMTP_SECURE=true → implicit TLS (465); otherwise STARTTLS (587).
  const secure = (process.env.SMTP_SECURE || "false").toLowerCase() === "true";

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS)");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
  return transporter;
}

const FROM = process.env.EMAIL_FROM || "noreply@orengen.io";
const REPLY_TO = process.env.EMAIL_REPLY_TO || "support@orengen.io";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://weshare.orengen.io";

async function send(to: string, subject: string, html: string) {
  const provider = resolveEmailProvider();

  if (provider === "mailwizz") {
    return sendEmailViaMailwizz(to, subject, html);
  }

  if (provider === "ghl") {
    return sendEmailViaGHL(to, subject, html);
  }

  return getTransport().sendMail({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject,
    html,
  });
}

export function getActiveEmailProvider(): EmailProvider {
  return resolveEmailProvider();
}

async function sendBranded(
  to: string,
  subject: string,
  templateKey: string,
  layout: EmailLayoutOptions
) {
  const html = await buildBrandedEmail(templateKey, layout);
  return send(to, subject, html);
}

// ─── Affiliate welcome ────────────────────────────────────────────────────────

export async function sendAffiliateWelcome(
  email: string,
  name: string,
  affiliateCode: string
) {
  const link = `${APP_URL}/r/${affiliateCode}`;
  return sendBranded(email, "Welcome to WeShare — your referral link is ready", "affiliate_welcome", {
    preheader: "Your unique tracking link is live — start sharing today.",
    headline: `Welcome, ${name}!`,
    bodyHtml: [
      p("You're officially a WeShare <strong>Referral Partner</strong>. Your unique tracking link:"),
      highlightBox(`<a href="${link}" style="color:#00254B;text-decoration:none;">${link}</a>`),
      p("Share this link. Every sale you refer earns a commission — plus monthly residuals that grow with your rank."),
      p(`Track clicks, leads, and earnings on your dashboard.`),
    ].join(""),
    cta: { label: "Open your dashboard", href: `${APP_URL}/affiliate` },
  });
}

// ─── Partner welcome ──────────────────────────────────────────────────────────

export async function sendPartnerWelcome(
  email: string,
  name: string,
  partnerCode: string
) {
  return sendBranded(email, "You're in — here's exactly how your first week goes", "partner_welcome", {
    preheader: "Your partner code is live. Three steps to your first close.",
    headline: `Welcome to the book-of-business side, ${name}.`,
    bodyHtml: [
      p("Most sales jobs make you re-earn your living every 30 days. Starting today, every client you close pays you on the way in <strong>and</strong> every month they stay."),
      highlightBox(`Your partner code: <strong>${partnerCode}</strong>`),
      p("<strong>Your first week, in order:</strong>"),
      ol([
        "<strong>Connect payouts.</strong> Stripe setup takes ~5 minutes on your dashboard. Money needs somewhere to land before you earn it.",
        "<strong>Study Handbook §6.</strong> The cold opener, the Mockup Close™, the battlecards. Your certification role-play comes straight from it.",
        "<strong>Pass certification.</strong> Then lead rotation switches on and the 4-Hour Rule starts working <em>for</em> you.",
      ]),
    ].join(""),
    cta: { label: "Open partner dashboard", href: `${APP_URL}/partner` },
  });
}

// ─── Partner onboarding sequence (milestone-triggered) ───────────────────────
// welcome (registration) → payouts ready (Stripe Connect enabled) → certified →
// leads unlocked → first lead assigned. Each fires once, on the event itself.

export async function sendPartnerStripeReady(email: string, name: string) {
  return sendBranded(email, "Payouts are live. One door left: certification.", "partner_stripe_ready", {
    preheader: "Stripe is connected — book your certification role-play next.",
    headline: `Money has somewhere to land now, ${name} ✅`,
    bodyHtml: [
      p("Stripe is connected and verified. From here, every commission you earn — upfront and monthly residuals — flows to your own account, visible per-client on your dashboard."),
      p("<strong>One door left before leads: the certification role-play.</strong> We play a skeptical business owner; you run Handbook §6. Nobody gets live leads without passing — which is exactly why the leads you'll get are worth getting."),
      ol([
        `Study §6 in the <a href="${APP_URL}/resources" style="color:#CC5500;">Partner Handbook</a> — cold opener, Mockup Close™, battlecards.`,
        "Reply to this email to book your role-play slot.",
        "Pass it. Rotation switches on.",
      ]),
    ].join(""),
    cta: { label: "View dashboard", href: `${APP_URL}/partner` },
  });
}

export async function sendPartnerCertified(email: string, name: string) {
  return sendBranded(email, "Certified. You're cleared to sell.", "partner_certified", {
    preheader: "You passed — lead rotation is being switched on.",
    headline: `You passed, ${name} 🎓`,
    bodyHtml: [
      p("You held the script under pressure — that's the whole test. Lead rotation is being switched on for your account; you'll get an email the moment you're live."),
      p("<strong>Don't wait on us to start earning:</strong>"),
      ul([
        `Every business you know that's invisible online is yours to claim — register it from <a href="${APP_URL}/partner/leads" style="color:#CC5500;">your Leads page</a>. First to register owns the account. Permanently.`,
        "Keep Handbook §6 open on every call — it's a call companion, not homework.",
      ]),
    ].join(""),
    cta: { label: "Go to Leads", href: `${APP_URL}/partner/leads` },
  });
}

export async function sendPartnerLeadsUnlocked(email: string, name: string) {
  return sendBranded(email, "You're in rotation — the 4-Hour Rule is now your friend", "partner_leads_unlocked", {
    preheader: "Live leads are heading to your dashboard now.",
    headline: `Rotation is on, ${name} 🚀`,
    bodyHtml: [
      p(`Live leads now land on <a href="${APP_URL}/partner/leads" style="color:#CC5500;">your Leads page</a>, with an email the moment each one arrives.`),
      p("Two rules keep your book growing instead of leaking:"),
      ul([
        "<strong>The 4-Hour Rule.</strong> First touch inside 4 hours, every lead. Untouched leads recycle to another rep.",
        "<strong>Same-day logging.</strong> The CRM record is the commission record. If it isn't logged, it didn't happen.",
      ]),
      p("Answer fast, run §6, ask for the mockup. That's the whole job."),
    ].join(""),
    cta: { label: "View my leads", href: `${APP_URL}/partner/leads` },
  });
}

export async function sendLeadAssigned(
  partnerEmail: string,
  partnerName: string,
  leadName: string,
  company?: string | null
) {
  const label = `${leadName}${company ? ` (${company})` : ""}`;
  return sendBranded(
    partnerEmail,
    `New lead: ${leadName} — the 4-hour clock is running`,
    "lead_assigned",
    {
      preheader: "Speed-to-lead wins. Contact details are on your Leads page.",
      headline: `${label} is yours, ${partnerName}.`,
      bodyHtml: [
        p("Assigned just now — which means the <strong>4-Hour Rule</strong> clock started just now. The rep who calls first usually closes."),
        p("Contact details are on your Leads page. Make the touch, log the touch."),
      ].join(""),
      cta: { label: "Open lead now", href: `${APP_URL}/partner/leads` },
      footerNote: "Miss the 4-hour window and this lead may recycle to another rep.",
    }
  );
}

export async function sendNumberAssigned(
  email: string,
  name: string,
  phoneNumber: string
) {
  return sendBranded(email, `Your company number is ready: ${phoneNumber}`, "number_assigned", {
    preheader: "Use this number for every prospect call and text.",
    headline: `Your company number is live, ${name} 📞`,
    bodyHtml: [
      p("All your prospect calls and texts now run through your assigned OrenGen number:"),
      highlightBox(phoneNumber),
      ul([
        "Use this number for <strong>every</strong> prospect call and text — carrier-compliant and logged.",
        "Texting rules: prior consent, 8 AM–9 PM local time, honor every opt-out instantly.",
      ]),
    ].join(""),
    cta: { label: "View on dashboard", href: `${APP_URL}/partner` },
  });
}

// ─── Rep application → admin notice ──────────────────────────────────────────
// The durable copy of every application (GHL contact is the CRM record).

const EXPERIENCE_LABELS: Record<string, string> = {
  full_time: "Yes — full-time commission",
  side_income: "Yes — side income",
  none_but_ready: "No, but can hold a hard conversation",
};
const HOURS_LABELS: Record<string, string> = {
  lt10: "<10", "10_20": "10–20", "20_40": "20–40", "40_plus": "40+",
};
const START_LABELS: Record<string, string> = {
  this_week: "This week", two_weeks: "Within 2 weeks", exploring: "Just exploring",
};

export async function sendPartnerApplicationNotice(
  adminEmail: string,
  app: {
    name: string; email: string; phone: string; cityState: string;
    experience: string; soldWhat?: string; hours: string;
    objectionAnswer: string; start: string; referrer?: string;
    smsConsent?: boolean; submittedAt: string;
  }
) {
  return send(
    adminEmail,
    `New rep application: ${app.name} (${app.cityState}) — ${START_LABELS[app.start] ?? app.start}`,
    `<h2>Rep application — ${app.name}</h2>
<p><strong>${app.email}</strong> · ${app.phone} · ${app.cityState}</p>
<table cellpadding="4" style="font-size:14px">
  <tr><td><strong>Commission experience</strong></td><td>${EXPERIENCE_LABELS[app.experience] ?? app.experience}</td></tr>
  <tr><td><strong>What they've sold</strong></td><td>${app.soldWhat || "—"}</td></tr>
  <tr><td><strong>Hours/week</strong></td><td>${HOURS_LABELS[app.hours] ?? app.hours}</td></tr>
  <tr><td><strong>Can start</strong></td><td>${START_LABELS[app.start] ?? app.start}</td></tr>
  <tr><td><strong>Referred by</strong></td><td>${app.referrer || "—"}</td></tr>
  <tr><td><strong>SMS marketing consent</strong></td><td>${app.smsConsent ? "YES (timestamped)" : "no"}</td></tr>
</table>
<p><strong>The filter question — "I need to think about it," what do you say next?</strong></p>
<blockquote style="border-left:3px solid #CC5500;padding-left:12px;color:#333">${app.objectionAnswer}</blockquote>
<p>Contact is in GHL tagged <code>WS Rep Applicant</code>. Reply within one business day — the page promises it.</p>
<p style="color:#6b7280;font-size:12px">Submitted ${app.submittedAt}</p>`
  );
}

// ─── Client cancellation → save-call alert ────────────────────────────────────
// The closer who sold them is the highest-percentage retention play — and it's
// their residual on the line. Fires when a client's subscription is cancelled.

export async function sendClientCancelledAlert(
  partnerEmail: string,
  partnerName: string,
  clientName: string,
  clientEmail: string,
  clientPhone?: string | null
) {
  return sendBranded(
    partnerEmail,
    `Save call needed: ${clientName} just cancelled`,
    "client_cancelled",
    {
      preheader: "Your residual on this client stops unless someone brings them back.",
      headline: `${clientName} cancelled, ${partnerName} — you're the best shot at saving them.`,
      bodyHtml: [
        p("Their subscription just ended, which means your <strong>$61.75/mo residual on this client stops</strong> unless someone brings them back. Nobody has a better win-back percentage than the person who sold them."),
        highlightBox(`${clientName} · ${clientEmail}${clientPhone ? ` · ${clientPhone}` : ""}`),
        p('The save call in one line: find out what broke ("What changed?"), fix what\'s fixable, and remind them what goes dark without the site.'),
      ].join(""),
      cta: { label: "Log the touch", href: `${APP_URL}/partner/leads` },
    }
  );
}

// ─── Customer order confirmation ─────────────────────────────────────────────
// Sent to the customer on checkout.session.completed — receipt + what happens
// next. Customer-facing: no upsell language, no earnings claims.

export async function sendOrderConfirmation(
  email: string,
  name: string,
  amountPaid: number
) {
  return sendBranded(email, "Order confirmed — your build starts now", "order_confirmation", {
    preheader: "Payment received. Here's exactly what happens next.",
    headline: `You're on the board, ${name}. 🎉`,
    bodyHtml: [
      p(`Payment of <strong>$${amountPaid.toFixed(2)}</strong> received — your business is done being invisible online. The build starts now.`),
      p("<strong>Exactly what happens next:</strong>"),
      ol([
        "<strong>Quick intake.</strong> A few short questions land in this inbox — services, hours, photos if you have them. Ten minutes total.",
        "<strong>We build.</strong> Our team designs and builds the whole thing. Most sites are live in five days or less — you never touch code.",
        "<strong>Launch &amp; ongoing care.</strong> Your $247/month plan covers hosting, maintenance, updates, and support. No surprise fees.",
      ]),
      p("Questions at any point? Reply to this email — a real person reads it, usually the same day."),
    ].join(""),
    footerNote: "OrenGen Worldwide LLC",
  });
}

// ─── Rank promotion ───────────────────────────────────────────────────────────

export async function sendRankPromotion(
  email: string,
  name: string,
  newRank: string
) {
  const rankEmoji: Record<string, string> = {
    BUILDER: "🔨",
    ARCHITECT: "🏛️",
    SOVEREIGN: "👑",
  };
  return send(
    email,
    `Congratulations — you've reached ${newRank} rank!`,
    `<h2>${rankEmoji[newRank] ?? "🎉"} You've been promoted to ${newRank}, ${name}!</h2>
<p>Your commission rate has increased. Log in to see your updated earnings structure:</p>
<a href="${APP_URL}/affiliate">${APP_URL}/affiliate</a>`
  );
}

// ─── Payout processed ────────────────────────────────────────────────────────

export async function sendPayoutNotification(
  email: string,
  name: string,
  amount: number,
  period: string
) {
  return sendBranded(
    email,
    `Your WeShare payout of $${amount.toFixed(2)} has been sent`,
    "payout_notification",
    {
      preheader: `Payout for ${period} is on its way to your Stripe account.`,
      headline: `Payout sent, ${name}!`,
      bodyHtml: [
        p(`Your payout for <strong>${period}</strong> of <strong>$${amount.toFixed(2)}</strong> has been transferred to your Stripe account.`),
        p("It typically arrives within 2–3 business days."),
      ].join(""),
      cta: { label: "View earnings history", href: `${APP_URL}/affiliate/earnings` },
    }
  );
}

// ─── Dispute received ─────────────────────────────────────────────────────────

export async function sendDisputeConfirmation(
  email: string,
  name: string,
  disputeId: string
) {
  return send(
    email,
    "Your dispute has been received — we'll respond within 5 business days",
    `<h2>Dispute Received, ${name}</h2>
<p>We've received your dispute (ID: <code>${disputeId}</code>). Our team will review it and respond within 5 business days.</p>
<p>You can track status at:<br>
<a href="${APP_URL}/affiliate/disputes">${APP_URL}/affiliate/disputes</a></p>`
  );
}

// ─── SLA breach alert (internal) ─────────────────────────────────────────────

export async function sendSLABreachAlert(
  partnerEmail: string,
  partnerName: string,
  leadEmail: string,
  leadName: string
) {
  return sendBranded(
    partnerEmail,
    `Action required: Lead ${leadName} has not been contacted within 4 hours`,
    "sla_breach",
    {
      preheader: "The 4-Hour Rule clock expired — contact this lead now.",
      headline: "SLA breach — immediate action required",
      bodyHtml: [
        p(`Hi ${partnerName},`),
        p(`Lead <strong>${leadName}</strong> (${leadEmail}) was assigned over 4 hours ago and has not been contacted yet.`),
        p("Reach out now to avoid lead recycling."),
      ].join(""),
      cta: { label: "Contact lead now", href: `${APP_URL}/partner/leads` },
      footerNote: "Repeated breaches may affect your lead rotation priority.",
    }
  );
}

// ─── Password reset ───────────────────────────────────────────────────────────

export async function sendPasswordReset(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  return send(
    email,
    "Reset your WeShare password",
    `<h2>Password Reset</h2>
<p>Click the link below to reset your password. This link expires in 1 hour.</p>
<p><a href="${resetUrl}">${resetUrl}</a></p>
<p>If you didn't request this, ignore this email.</p>`
  );
}

// ─── Admin diagnostic: test email ─────────────────────────────────────────────

// Sends a one-off test message so an admin can confirm SMTP is configured
// correctly. Unlike the notification helpers above (which are fire-and-forget),
// callers of this should await it and surface any error for diagnostics.
export async function sendTestEmail(to: string) {
  const provider = getActiveEmailProvider();
  const geminiNote =
    process.env.GEMINI_API_KEY && process.env.EMAIL_USE_GEMINI !== "false"
      ? " Gemini polish is active for partner emails."
      : "";
  const html = await buildBrandedEmail("test_email", {
    preheader: "If this looks good in your inbox, outbound mail is configured correctly.",
    headline: "Your email is working 🎉",
    bodyHtml: [
      p(`This is a test from your WeShare deployment via <strong>${provider}</strong>.`),
      p("Because it arrived in your inbox with the OrenGen branded layout, partners will receive polished welcome emails, payout notifications, and password resets."),
      p(`<span style="color:#6b7280;font-size:13px;">Sent from ${APP_URL}${geminiNote}</span>`),
    ].join(""),
    cta: { label: "Open WeShare", href: APP_URL },
  });
  return send(to, `WeShare email test ✅ (${provider})`, html);
}

import nodemailer, { type Transporter } from "nodemailer";
import { isGHLConfigured, sendEmailViaGHL } from "@/lib/ghl";
import { isMailwizzConfigured, sendEmailViaMailwizz } from "@/lib/mailwizz";

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

// ─── Affiliate welcome ────────────────────────────────────────────────────────

export async function sendAffiliateWelcome(
  email: string,
  name: string,
  affiliateCode: string
) {
  const link = `${APP_URL}/r/${affiliateCode}`;
  return send(
    email,
    "Welcome to WeShare — your referral link is ready",
    `<h2>Welcome, ${name}!</h2>
<p>You're officially a WeShare Referral Partner. Your unique tracking link is:</p>
<p><strong><a href="${link}">${link}</a></strong></p>
<p>Share this link. Every sale you refer earns you a commission — and monthly residuals that grow with your rank.</p>
<p>Log in to your dashboard to track clicks, leads, and earnings:<br>
<a href="${APP_URL}/affiliate">${APP_URL}/affiliate</a></p>
<p>Questions? Reply to this email.</p>
<p>— OrenGen Team</p>`
  );
}

// ─── Partner welcome ──────────────────────────────────────────────────────────

export async function sendPartnerWelcome(
  email: string,
  name: string,
  partnerCode: string
) {
  return send(
    email,
    "You're in — here's exactly how your first week goes",
    `<h2>Welcome to the book-of-business side, ${name}.</h2>
<p>Most sales jobs make you re-earn your living every 30 days. Starting today, every client
you close pays you on the way in <em>and</em> every month they stay. Your partner code —
the one your closes get credited to — is <strong>${partnerCode}</strong>.</p>
<p><strong>Your first week, in order:</strong></p>
<ol>
  <li><strong>Connect payouts.</strong> Stripe setup takes ~5 minutes on your dashboard. Money needs somewhere to land before you earn it.</li>
  <li><strong>Study Handbook §6.</strong> The cold opener, the Mockup Close™, the battlecards. Your certification role-play comes straight from it.</li>
  <li><strong>Pass certification.</strong> Then lead rotation switches on and the 4-Hour Rule starts working <em>for</em> you — every rep touches leads fast, or loses them to someone who will.</li>
</ol>
<p>Your dashboard: <a href="${APP_URL}/partner">${APP_URL}/partner</a></p>
<p>— The OrenGen Team</p>`
  );
}

// ─── Partner onboarding sequence (milestone-triggered) ───────────────────────
// welcome (registration) → payouts ready (Stripe Connect enabled) → certified →
// leads unlocked → first lead assigned. Each fires once, on the event itself.

export async function sendPartnerStripeReady(email: string, name: string) {
  return send(
    email,
    "Payouts are live. One door left: certification.",
    `<h2>Money has somewhere to land now, ${name} ✅</h2>
<p>Stripe is connected and verified. From here, every commission you earn — the upfront
and the monthly residuals — flows to your own account, visible per-client on your dashboard.</p>
<p><strong>One door left before leads: the certification role-play.</strong> It's us playing
a skeptical plumber, you running Handbook §6. Nobody gets live leads without passing it —
which is exactly why the leads you'll get are worth getting.</p>
<ol>
  <li>Study §6 in the <a href="${APP_URL}/resources">Partner Handbook</a> — the cold opener, the Mockup Close™, the battlecards.</li>
  <li>Reply to this email to book your role-play slot.</li>
  <li>Pass it. Rotation switches on.</li>
</ol>
<p>Your dashboard: <a href="${APP_URL}/partner">${APP_URL}/partner</a></p>
<p>— The OrenGen Team</p>`
  );
}

export async function sendPartnerCertified(email: string, name: string) {
  return send(
    email,
    "Certified. You're cleared to sell.",
    `<h2>You passed, ${name} 🎓</h2>
<p>You held the script under pressure — that's the whole test. Lead rotation is being
switched on for your account; you'll get an email the moment you're live.</p>
<p><strong>Don't wait on us to start earning:</strong></p>
<ul>
  <li>Every business you know that's invisible online is yours to claim — register it from
      <a href="${APP_URL}/partner/leads">your Leads page</a>. First to register owns the account. Permanently.</li>
  <li>Keep Handbook §6 open on every call — it's a call companion, not homework.</li>
</ul>
<p>— The OrenGen Team</p>`
  );
}

export async function sendPartnerLeadsUnlocked(email: string, name: string) {
  return send(
    email,
    "You're in rotation — the 4-Hour Rule is now your friend",
    `<h2>Rotation is on, ${name} 🚀</h2>
<p>Live leads now land on <a href="${APP_URL}/partner/leads">your Leads page</a>, with an
email the moment each one arrives. Two rules keep your book growing instead of leaking:</p>
<ul>
  <li><strong>The 4-Hour Rule.</strong> First touch inside 4 hours, every lead. Untouched leads recycle to another rep — the same rule that just started feeding you.</li>
  <li><strong>Same-day logging.</strong> The CRM record is the commission record. If it isn't logged, it didn't happen.</li>
</ul>
<p>Answer fast, run §6, ask for the mockup. That's the whole job.</p>
<p>— The OrenGen Team</p>`
  );
}

export async function sendLeadAssigned(
  partnerEmail: string,
  partnerName: string,
  leadName: string,
  company?: string | null
) {
  return send(
    partnerEmail,
    `New lead: ${leadName} — the 4-hour clock is running`,
    `<h2>${leadName}${company ? ` (${company})` : ""} is yours, ${partnerName}.</h2>
<p>Assigned just now — which means the 4-Hour Rule clock started just now. Speed-to-lead
is the single highest-leverage move in this business: the rep who calls first usually
closes.</p>
<p>Contact details are on your Leads page. Make the touch, log the touch:</p>
<p><a href="${APP_URL}/partner/leads">${APP_URL}/partner/leads</a></p>
<p>— The OrenGen Team</p>`
  );
}

export async function sendNumberAssigned(
  email: string,
  name: string,
  phoneNumber: string
) {
  return send(
    email,
    `Your company number is ready: ${phoneNumber}`,
    `<h2>Your company number is live, ${name} 📞</h2>
<p>All your prospect calls and texts now run through your assigned OrenGen number:</p>
<p style="font-size:22px;font-weight:700">${phoneNumber}</p>
<ul>
  <li>Use this number for <strong>every</strong> prospect call and text — it keeps you carrier-compliant and your outreach logged.</li>
  <li>Texting rules still apply: prior consent, 8 AM–9 PM local time, honor every opt-out instantly.</li>
</ul>
<p>It's also shown on your dashboard: <a href="${APP_URL}/partner">${APP_URL}/partner</a></p>
<p>— OrenGen Team</p>`
  );
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
  return send(
    partnerEmail,
    `Save call needed: ${clientName} just cancelled`,
    `<h2>${clientName} cancelled, ${partnerName} — and you're the best shot at saving them.</h2>
<p>Their subscription just ended, which means your <strong>$61.75/mo residual on this client
stops</strong> unless someone brings them back. Nobody has a better win-back percentage than
the person who sold them.</p>
<p><strong>Client:</strong> ${clientName} · ${clientEmail}${clientPhone ? ` · ${clientPhone}` : ""}</p>
<p>The save call, in one line: find out what broke ("What changed?"), fix what's fixable,
and remind them what goes dark without the site. Log the touch either way:</p>
<p><a href="${APP_URL}/partner/leads">${APP_URL}/partner/leads</a></p>
<p>— The OrenGen Team</p>`
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
  return send(
    email,
    "Order confirmed — your build starts now",
    `<h2>You're on the board, ${name}. 🎉</h2>
<p>Payment of <strong>$${amountPaid.toFixed(2)}</strong> received — and as of this email,
your business is done being invisible online. The build starts now.</p>
<p><strong>Exactly what happens next:</strong></p>
<ol>
  <li><strong>Quick intake.</strong> A few short questions land in this inbox — services, hours, photos if you have them. Ten minutes of your time, total.</li>
  <li><strong>We build.</strong> Our team designs and builds the whole thing. Most sites are live in five days or less — you never touch code.</li>
  <li><strong>Launch &amp; ongoing care.</strong> Your $247/month plan covers hosting, maintenance, updates, and support. No surprise fees — surprise billing is how the other guys lose customers, and we plan on keeping you.</li>
</ol>
<p>Questions at any point? Reply to this email — a real person reads it, usually the same day.</p>
<p>— The OrenGen Team<br>OrenGen Worldwide LLC</p>`
  );
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
  return send(
    email,
    `Your WeShare payout of $${amount.toFixed(2)} has been sent`,
    `<h2>Payout Sent, ${name}!</h2>
<p>Your payout for <strong>${period}</strong> of <strong>$${amount.toFixed(2)}</strong> has been transferred to your Stripe account.</p>
<p>It typically arrives within 2-3 business days.</p>
<p>View your earnings history:<br>
<a href="${APP_URL}/affiliate/earnings">${APP_URL}/affiliate/earnings</a></p>`
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
  return send(
    partnerEmail,
    `Action required: Lead ${leadName} has not been contacted within 4 hours`,
    `<h2>SLA Breach — Immediate Action Required</h2>
<p>Hi ${partnerName},</p>
<p>Lead <strong>${leadName}</strong> (${leadEmail}) was assigned to you over 4 hours ago and has not been contacted yet.</p>
<p>Please reach out now to avoid lead recycling:</p>
<a href="${APP_URL}/partner/leads">${APP_URL}/partner/leads</a>`
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
  return send(
    to,
    `WeShare email test ✅ (${provider})`,
    `<h2>Your email is working 🎉</h2>
<p>This is a test message from your WeShare deployment via <strong>${provider}</strong>.
Because it arrived in your inbox (not spam), outbound email is configured correctly —
partners will receive welcome emails, payout notifications, and password resets.</p>
<p style="color:#6b7280;font-size:13px;margin-top:16px">Sent from ${APP_URL}</p>`
  );
}

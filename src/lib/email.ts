import nodemailer, { type Transporter } from "nodemailer";
import { isGHLConfigured, sendEmailViaGHL } from "@/lib/ghl";

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
  // Prefer GHL's email system when configured — no external SMTP dependency,
  // and every recipient is kept in the CRM. Falls back to SMTP otherwise.
  if (isGHLConfigured()) {
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
    "Welcome to the OrenGen Sales Partner Program",
    `<h2>Welcome aboard, ${name}!</h2>
<p>Your Sales Partner account is active. Your partner code is: <strong>${partnerCode}</strong></p>
<p>Next steps:</p>
<ol>
  <li>Complete your Stripe Connect setup to receive payouts</li>
  <li>Submit your W-9</li>
  <li>Complete the certification role-play to unlock leads</li>
</ol>
<p>Access your dashboard:<br>
<a href="${APP_URL}/partner">${APP_URL}/partner</a></p>
<p>— OrenGen Team</p>`
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
  return send(
    to,
    "WeShare SMTP test ✅",
    `<h2>Your email is working 🎉</h2>
<p>This is a test message from your WeShare deployment. Because it arrived, outbound
email is configured correctly — partners will receive their welcome emails, payout
notifications, and password resets.</p>
<p style="color:#6b7280;font-size:13px;margin-top:16px">Sent from ${APP_URL}</p>`
  );
}

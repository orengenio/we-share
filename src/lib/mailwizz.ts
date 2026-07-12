/**
 * Mailwizz transactional email API (self-hosted).
 * Docs: POST /api/transactional-emails with X-Api-Key header.
 */

const FROM = process.env.EMAIL_FROM || "noreply@orengen.io";
const REPLY_TO = process.env.EMAIL_REPLY_TO || "support@orengen.io";

export function isMailwizzConfigured(): boolean {
  const key =
    process.env.MAILWIZZ_API_KEY ||
    process.env.ORENGEN_PRO_API_KEY;
  const base = process.env.MAILWIZZ_API_URL;
  return Boolean(key && base);
}

function apiBase(): string {
  const raw = process.env.MAILWIZZ_API_URL?.replace(/\/$/, "");
  if (!raw) throw new Error("MAILWIZZ_API_URL is not configured");
  return raw.endsWith("/api") ? raw : `${raw}/api`;
}

function apiKey(): string {
  const key = process.env.MAILWIZZ_API_KEY || process.env.ORENGEN_PRO_API_KEY;
  if (!key) throw new Error("MAILWIZZ_API_KEY or ORENGEN_PRO_API_KEY is not configured");
  return key;
}

export async function sendEmailViaMailwizz(
  to: string,
  subject: string,
  html: string,
  toName?: string
) {
  const local = to.split("@")[0] || to;
  const body = new URLSearchParams({
    to_email: to,
    to_name: toName || local,
    from_name: "OrenGen WeShare",
    from_email: FROM,
    reply_to_email: REPLY_TO,
    subject,
    body: html,
  });

  const res = await fetch(`${apiBase()}/transactional-emails`, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey(),
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mailwizz API error ${res.status}: ${text.slice(0, 500)}`);
  }

  return res.json().catch(() => ({}));
}

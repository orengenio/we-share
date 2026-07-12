/**
 * OrenGen / WeShare branded HTML email shell.
 * Table-based layout for Gmail, Outlook, and Apple Mail compatibility.
 */

const BRAND_NAVY = "#00254B";
const BRAND_ORANGE = "#CC5500";
const BRAND_CREAM = "#FFF8F3";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://weshare.orengen.io";

export interface EmailLayoutOptions {
  /** Inbox preview line (hidden in body) */
  preheader?: string;
  /** Main hero headline inside the card */
  headline: string;
  /** Inner HTML — paragraphs, lists, etc. */
  bodyHtml: string;
  /** Primary CTA button */
  cta?: { label: string; href: string };
  /** Small note above the footer */
  footerNote?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function wrapEmailLayout(opts: EmailLayoutOptions): string {
  const preheader = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(opts.preheader)}</div>`
    : "";

  const ctaBlock = opts.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 8px;">
        <tr>
          <td style="border-radius:8px;background:${BRAND_ORANGE};">
            <a href="${opts.cta.href}" target="_blank"
               style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">
              ${escapeHtml(opts.cta.label)}
            </a>
          </td>
        </tr>
      </table>`
    : "";

  const footerNote = opts.footerNote
    ? `<p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#6b7280;text-align:center;">${opts.footerNote}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(opts.headline)}</title>
</head>
<body style="margin:0;padding:0;background:#eef1f5;">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:${BRAND_NAVY};border-radius:12px 12px 0 0;padding:24px 32px;text-align:center;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.7);">OrenGen Worldwide</p>
              <p style="margin:6px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#ffffff;">WeShare Partner Platform</p>
            </td>
          </tr>
          <!-- Accent bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${BRAND_ORANGE},#e67e22);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <!-- Body card -->
          <tr>
            <td style="background:#ffffff;padding:36px 32px 28px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.3;color:${BRAND_NAVY};font-weight:700;">
                ${opts.headline}
              </h1>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#374151;">
                ${opts.bodyHtml}
              </div>
              ${ctaBlock}
            </td>
          </tr>
          <!-- Highlight strip (optional visual anchor) -->
          <tr>
            <td style="background:${BRAND_CREAM};padding:16px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;border-top:1px solid #fde8d8;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#92400e;text-align:center;">
                Close once. Paid monthly. Your book of business grows with every client who stays.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;text-align:center;">
              ${footerNote}
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#9ca3af;">
                — The OrenGen Team<br />
                <a href="${APP_URL}" style="color:${BRAND_ORANGE};text-decoration:none;">${APP_URL.replace("https://", "")}</a>
              </p>
              <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#d1d5db;">
                OrenGen Worldwide LLC · Reply to this email for support
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Reusable inline-styled paragraph */
export function p(text: string): string {
  return `<p style="margin:0 0 14px;">${text}</p>`;
}

/** Ordered list with brand styling */
export function ol(items: string[]): string {
  const lis = items.map((i) => `<li style="margin-bottom:8px;">${i}</li>`).join("");
  return `<ol style="margin:0 0 16px;padding-left:20px;">${lis}</ol>`;
}

/** Unordered list */
export function ul(items: string[]): string {
  const lis = items.map((i) => `<li style="margin-bottom:8px;">${i}</li>`).join("");
  return `<ul style="margin:0 0 16px;padding-left:20px;">${lis}</ul>`;
}

/** Highlight box for codes, numbers, amounts */
export function highlightBox(content: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
    <tr>
      <td style="background:${BRAND_CREAM};border-left:4px solid ${BRAND_ORANGE};padding:14px 18px;border-radius:0 8px 8px 0;">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:${BRAND_NAVY};">${content}</p>
      </td>
    </tr>
  </table>`;
}

/**
 * Fraud detection module.
 *
 * Signals monitored:
 * - Burst clicks (>50/hr from same IP) → handled in tracking.ts
 * - Self-referral (affiliate buying own link)
 * - Duplicate identity (same name+email under different affiliates)
 * - High refund rate (>20% of conversions refunded)
 * - Fake leads (placeholder emails, disposable domains)
 */

import db from "./db";
import { emitEvent } from "./events";

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "temp-mail.org", "throwam.com",
  "yopmail.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
  "guerrillamail.info", "trashmail.com", "spam4.me", "fakeinbox.com",
]);

const FAKE_EMAIL_PATTERNS = [
  /^test@/i,
  /^asdf/i,
  /^qwerty/i,
  /noreply/i,
  /^[a-z]{1,3}\d{3,}@/,
];

// ─── Email validity ───────────────────────────────────────────────────────────

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return true;
  return DISPOSABLE_DOMAINS.has(domain);
}

export function isFakeLookingEmail(email: string): boolean {
  return FAKE_EMAIL_PATTERNS.some((r) => r.test(email));
}

// ─── Duplicate identity check ─────────────────────────────────────────────────

export async function checkDuplicateIdentity(
  email: string,
  affiliateId: string
): Promise<boolean> {
  const existing = await db.lead.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      affiliateId: { not: affiliateId },
    },
  });
  return !!existing;
}

// ─── High refund rate ─────────────────────────────────────────────────────────

export async function getRefundRate(affiliateId: string): Promise<number> {
  const [total, refunded] = await Promise.all([
    db.conversion.count({ where: { affiliateId } }),
    db.conversion.count({ where: { affiliateId, isRefunded: true } }),
  ]);
  if (total === 0) return 0;
  return refunded / total;
}

export async function checkHighRefundRate(affiliateId: string): Promise<boolean> {
  const rate = await getRefundRate(affiliateId);
  return rate > 0.2;
}

// ─── Flag creation ────────────────────────────────────────────────────────────

export async function flagAffiliate(
  affiliateId: string,
  type: string,
  severity: "LOW" | "MEDIUM" | "HIGH",
  description: string,
  evidence?: Record<string, unknown>
) {
  await db.fraudFlag.create({
    data: {
      affiliateId,
      type,
      severity,
      description,
      evidence: evidence ?? null,
    },
  });

  emitEvent("fraud.flagged", {
    affiliateId,
    type,
    severity,
    description,
    evidence,
  });
}

// ─── Lead submission fraud check ─────────────────────────────────────────────

export async function runLeadFraudChecks(
  email: string,
  affiliateId: string | null
): Promise<{ blocked: boolean; reasons: string[] }> {
  const reasons: string[] = [];

  if (isDisposableEmail(email)) reasons.push("DISPOSABLE_EMAIL");
  if (isFakeLookingEmail(email)) reasons.push("FAKE_EMAIL_PATTERN");

  if (affiliateId) {
    const isDuplicate = await checkDuplicateIdentity(email, affiliateId);
    if (isDuplicate) {
      reasons.push("DUPLICATE_CROSS_AFFILIATE");
      await flagAffiliate(
        affiliateId,
        "DUPLICATE_IDENTITY",
        "MEDIUM",
        `Lead ${email} was previously submitted under a different affiliate`,
        { email }
      );
    }

    const highRefund = await checkHighRefundRate(affiliateId);
    if (highRefund) {
      await flagAffiliate(
        affiliateId,
        "HIGH_REFUND_RATE",
        "HIGH",
        "Affiliate refund rate exceeds 20%",
        { email }
      );
    }
  }

  return {
    blocked: reasons.includes("DISPOSABLE_EMAIL"),
    reasons,
  };
}

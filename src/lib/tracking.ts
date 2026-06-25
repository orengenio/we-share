/**
 * Attribution & click tracking engine.
 *
 * Rules:
 * - 90-day cookie window from first click
 * - Lead lock on form submission (last-click before lock wins permanently)
 * - One visitor token persists 90 days; session token is request-scoped
 * - Fraud: burst detection (>50 clicks/hour from same IP hash)
 */

import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { UAParser } from "ua-parser-js";
import { addDays } from "date-fns";
import db from "./db";
import { redis, REDIS_KEYS, incrementWithExpiry } from "./redis";
import type { AttributionResult } from "@/types";

export const COOKIE_90_DAYS = 90 * 24 * 60 * 60; // seconds
export const BURST_THRESHOLD = 50;
export const BURST_WINDOW_SECONDS = 3600; // 1 hour

// ─── Token utilities ──────────────────────────────────────────────────────────

export function generateToken(): string {
  return uuidv4();
}

export function hashIP(ip: string): string {
  return crypto.createHash("sha256").update(ip + (process.env.JWT_SECRET ?? "")).digest("hex").slice(0, 32);
}

// ─── Device / UA parsing ──────────────────────────────────────────────────────

export function parseUserAgent(ua: string | null) {
  if (!ua) return { deviceType: null, browser: null, os: null };
  const parser = new UAParser(ua);
  const device = parser.getDevice();
  const browser = parser.getBrowser();
  const os = parser.getOS();
  return {
    deviceType: device.type ?? "desktop",
    browser: browser.name ?? null,
    os: os.name ?? null,
  };
}

// ─── Fraud: burst click detection ────────────────────────────────────────────

export async function checkBurstClicks(ipHash: string): Promise<boolean> {
  const key = REDIS_KEYS.clickBurst(ipHash);
  const count = await incrementWithExpiry(key, BURST_WINDOW_SECONDS);
  return count > BURST_THRESHOLD;
}

// ─── Attribution resolution ───────────────────────────────────────────────────

export async function resolveAttribution(
  visitorToken: string
): Promise<AttributionResult> {
  // 1. Check Redis cache first
  const cached = await redis.get(REDIS_KEYS.visitorAttribution(visitorToken)).catch(() => null);
  if (cached) {
    return JSON.parse(cached) as AttributionResult;
  }

  // 2. Find most recent click with this visitor token (within 90 days)
  const cutoff = addDays(new Date(), -90);
  const click = await db.click.findFirst({
    where: {
      visitorToken,
      createdAt: { gte: cutoff },
      isSuspicious: false,
    },
    include: { affiliate: true, link: true },
    orderBy: { createdAt: "desc" },
  });

  if (!click) {
    return {
      affiliateId: null,
      affiliateCode: null,
      linkId: null,
      clickId: null,
      isExpired: false,
    };
  }

  const result: AttributionResult = {
    affiliateId: click.affiliateId,
    affiliateCode: click.affiliate.affiliateCode,
    linkId: click.linkId,
    clickId: click.id,
    isExpired: false,
  };

  // Cache for 1 hour to avoid repeated DB hits
  await redis.setex(
    REDIS_KEYS.visitorAttribution(visitorToken),
    3600,
    JSON.stringify(result)
  ).catch(() => null);

  return result;
}

// ─── Click recording ──────────────────────────────────────────────────────────

export async function recordClick({
  affiliateCode,
  linkCode,
  visitorToken,
  sessionToken,
  ipAddress,
  userAgent,
  referrer,
  landingPage,
}: {
  affiliateCode: string;
  linkCode?: string;
  visitorToken: string;
  sessionToken: string;
  ipAddress: string;
  userAgent: string | null;
  referrer: string | null;
  landingPage: string | null;
}) {
  const ipHash = hashIP(ipAddress);
  const isBurst = await checkBurstClicks(ipHash);
  const ua = parseUserAgent(userAgent);

  // Find affiliate by code
  const affiliate = await db.affiliateProfile.findUnique({
    where: { affiliateCode, isActive: true },
  });

  if (!affiliate) return null;

  // Optionally find link by code
  let linkId: string | null = null;
  if (linkCode) {
    const link = await db.affiliateLink.findFirst({
      where: { code: linkCode, affiliateId: affiliate.id, isActive: true },
    });
    linkId = link?.id ?? null;
  }

  const click = await db.click.create({
    data: {
      affiliateId: affiliate.id,
      linkId,
      visitorToken,
      sessionToken,
      ipAddress: ipAddress.slice(0, 45), // trim to field max
      ipHash,
      userAgent: userAgent?.slice(0, 500) ?? null,
      referrer: referrer?.slice(0, 500) ?? null,
      landingPage: landingPage?.slice(0, 500) ?? null,
      deviceType: ua.deviceType,
      browser: ua.browser,
      os: ua.os,
      isSuspicious: isBurst,
      fraudReason: isBurst ? "BURST_CLICKS" : null,
    },
  });

  // Update running counters
  await db.affiliateProfile.update({
    where: { id: affiliate.id },
    data: { totalClicks: { increment: 1 } },
  });

  if (linkId) {
    await db.affiliateLink.update({
      where: { id: linkId },
      data: { clickCount: { increment: 1 } },
    });
  }

  // Invalidate attribution cache
  await redis
    .del(REDIS_KEYS.visitorAttribution(visitorToken))
    .catch(() => null);

  // Flag burst fraud
  if (isBurst) {
    await db.fraudFlag.upsert({
      where: {
        id: `burst-${ipHash}-${affiliate.id}`,
      },
      update: { updatedAt: new Date() },
      create: {
        id: `burst-${ipHash}-${affiliate.id}`,
        affiliateId: affiliate.id,
        type: "BURST_CLICKS",
        severity: "MEDIUM",
        description: `More than ${BURST_THRESHOLD} clicks in 1 hour from IP hash ${ipHash}`,
        ipAddress: ipAddress.slice(0, 45),
        evidence: { clickId: click.id, visitorToken },
      },
    });
  }

  return click;
}

// ─── Lead locking ─────────────────────────────────────────────────────────────

export async function lockAttribution(
  leadId: string,
  visitorToken: string
): Promise<void> {
  const attribution = await resolveAttribution(visitorToken);

  if (attribution.affiliateId) {
    await db.lead.update({
      where: { id: leadId },
      data: {
        affiliateId: attribution.affiliateId,
        clickId: attribution.clickId,
        attributionLocked: true,
        attributedAt: new Date(),
        cookieExpiry: addDays(new Date(), 90),
      },
    });

    await db.affiliateProfile.update({
      where: { id: attribution.affiliateId },
      data: { totalLeads: { increment: 1 } },
    });

    if (attribution.linkId) {
      await db.affiliateLink.update({
        where: { id: attribution.linkId },
        data: { leadCount: { increment: 1 } },
      });
    }
  }

  // Clear attribution cache so it can't be re-used
  await redis
    .del(REDIS_KEYS.visitorAttribution(visitorToken))
    .catch(() => null);
}

// ─── Self-referral detection ──────────────────────────────────────────────────

export async function checkSelfReferral(
  affiliateId: string,
  email: string
): Promise<boolean> {
  const affiliate = await db.affiliateProfile.findUnique({
    where: { id: affiliateId },
    include: { user: true },
  });
  return affiliate?.user.email.toLowerCase() === email.toLowerCase();
}

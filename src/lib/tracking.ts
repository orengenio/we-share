/**
 * Attribution & click tracking engine.
 *
 * Rules:
 * - 90-day cookie window from first click
 * - Lead lock on form submission (last-click before lock wins permanently)
 * - One visitor token persists 90 days; session token is request-scoped
 * - Fraud: burst detection (>50 clicks/hour from same IP hash)
 * - Referral partners: /r/[code]  |  Sales partners: /s/[code]
 */

import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { UAParser } from "ua-parser-js";
import { addDays } from "date-fns";
import db from "./db";
import { redis, REDIS_KEYS, incrementWithExpiry } from "./redis";
import { emitEvent } from "./events";
import type { AttributionResult } from "@/types";

export const COOKIE_90_DAYS = 90 * 24 * 60 * 60; // seconds
export const BURST_THRESHOLD = 50;
export const BURST_WINDOW_SECONDS = 3600; // 1 hour

export const VISITOR_COOKIE = "ws_vid";
export const SESSION_COOKIE = "ws_sid";

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

function emptyAttribution(): AttributionResult {
  return {
    affiliateId: null,
    affiliateCode: null,
    partnerId: null,
    partnerCode: null,
    linkId: null,
    partnerLinkId: null,
    clickId: null,
    isExpired: false,
  };
}

// ─── Attribution resolution ───────────────────────────────────────────────────

export async function resolveAttribution(
  visitorToken: string
): Promise<AttributionResult> {
  const cached = await redis.get(REDIS_KEYS.visitorAttribution(visitorToken)).catch(() => null);
  if (cached) {
    return JSON.parse(cached) as AttributionResult;
  }

  const cutoff = addDays(new Date(), -90);
  const click = await db.click.findFirst({
    where: {
      visitorToken,
      createdAt: { gte: cutoff },
      isSuspicious: false,
    },
    include: { affiliate: true, partner: true, link: true, partnerLink: true },
    orderBy: { createdAt: "desc" },
  });

  if (!click) {
    return emptyAttribution();
  }

  const result: AttributionResult = {
    affiliateId: click.affiliateId,
    affiliateCode: click.affiliate?.affiliateCode ?? null,
    partnerId: click.partnerId,
    partnerCode: click.partner?.partnerCode ?? null,
    linkId: click.linkId,
    partnerLinkId: click.partnerLinkId,
    clickId: click.id,
    isExpired: false,
  };

  await redis.setex(
    REDIS_KEYS.visitorAttribution(visitorToken),
    3600,
    JSON.stringify(result)
  ).catch(() => null);

  return result;
}

// ─── Shared click metadata ────────────────────────────────────────────────────

function clickMetadata(
  visitorToken: string,
  sessionToken: string,
  ipAddress: string,
  userAgent: string | null,
  referrer: string | null,
  landingPage: string | null
) {
  const ipHash = hashIP(ipAddress);
  const ua = parseUserAgent(userAgent);
  return {
    visitorToken,
    sessionToken,
    ipAddress: ipAddress.slice(0, 45),
    ipHash,
    userAgent: userAgent?.slice(0, 500) ?? null,
    referrer: referrer?.slice(0, 500) ?? null,
    landingPage: landingPage?.slice(0, 500) ?? null,
    deviceType: ua.deviceType,
    browser: ua.browser,
    os: ua.os,
  };
}

// ─── Affiliate click recording ────────────────────────────────────────────────

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
  const meta = clickMetadata(visitorToken, sessionToken, ipAddress, userAgent, referrer, landingPage);
  const isBurst = await checkBurstClicks(meta.ipHash).catch(() => false);

  const affiliate = await db.affiliateProfile.findUnique({
    where: { affiliateCode, isActive: true },
  });

  if (!affiliate) return null;

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
      ...meta,
      isSuspicious: isBurst,
      fraudReason: isBurst ? "BURST_CLICKS" : null,
    },
  });

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

  await redis.del(REDIS_KEYS.visitorAttribution(visitorToken)).catch(() => null);

  if (isBurst) {
    await db.fraudFlag.upsert({
      where: { id: `burst-${meta.ipHash}-${affiliate.id}` },
      update: { updatedAt: new Date() },
      create: {
        id: `burst-${meta.ipHash}-${affiliate.id}`,
        affiliateId: affiliate.id,
        type: "BURST_CLICKS",
        severity: "MEDIUM",
        description: `More than ${BURST_THRESHOLD} clicks in 1 hour from IP hash ${meta.ipHash}`,
        ipAddress: meta.ipAddress,
        evidence: { clickId: click.id, visitorToken },
      },
    });
  }

  emitEvent("click.recorded", {
    clickId: click.id,
    affiliateId: affiliate.id,
    affiliateCode,
    linkId,
    isSuspicious: isBurst,
  });

  return click;
}

// ─── Partner click recording ──────────────────────────────────────────────────

export async function recordPartnerClick({
  partnerCode,
  linkCode,
  visitorToken,
  sessionToken,
  ipAddress,
  userAgent,
  referrer,
  landingPage,
}: {
  partnerCode: string;
  linkCode?: string;
  visitorToken: string;
  sessionToken: string;
  ipAddress: string;
  userAgent: string | null;
  referrer: string | null;
  landingPage: string | null;
}) {
  const meta = clickMetadata(visitorToken, sessionToken, ipAddress, userAgent, referrer, landingPage);
  const isBurst = await checkBurstClicks(meta.ipHash).catch(() => false);

  const partner = await db.partnerProfile.findUnique({
    where: { partnerCode, isActive: true },
  });

  if (!partner) return null;

  let partnerLinkId: string | null = null;
  if (linkCode) {
    const link = await db.partnerLink.findFirst({
      where: { code: linkCode, partnerId: partner.id, isActive: true },
    });
    partnerLinkId = link?.id ?? null;
  }

  const click = await db.click.create({
    data: {
      partnerId: partner.id,
      partnerLinkId,
      ...meta,
      isSuspicious: isBurst,
      fraudReason: isBurst ? "BURST_CLICKS" : null,
    },
  });

  await db.partnerProfile.update({
    where: { id: partner.id },
    data: { totalClicks: { increment: 1 } },
  });

  if (partnerLinkId) {
    await db.partnerLink.update({
      where: { id: partnerLinkId },
      data: { clickCount: { increment: 1 } },
    });
  }

  await redis.del(REDIS_KEYS.visitorAttribution(visitorToken)).catch(() => null);

  emitEvent("click.recorded", {
    clickId: click.id,
    partnerId: partner.id,
    partnerCode,
    partnerLinkId,
    isSuspicious: isBurst,
  });

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
  } else if (attribution.partnerId) {
    await db.lead.update({
      where: { id: leadId },
      data: {
        partnerId: attribution.partnerId,
        clickId: attribution.clickId,
        attributionLocked: true,
        attributedAt: new Date(),
        cookieExpiry: addDays(new Date(), 90),
      },
    });

    if (attribution.partnerLinkId) {
      await db.partnerLink.update({
        where: { id: attribution.partnerLinkId },
        data: { leadCount: { increment: 1 } },
      });
    }
  }

  if (attribution.affiliateId || attribution.partnerId) {
    emitEvent("lead.attributed", {
      leadId,
      affiliateId: attribution.affiliateId,
      partnerId: attribution.partnerId,
      clickId: attribution.clickId,
    });
  }

  await redis.del(REDIS_KEYS.visitorAttribution(visitorToken)).catch(() => null);
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

/**
 * Safe redirect target for tracking links — orengen.io hosts only.
 */
export function safeDestination(destinationUrl: string, appUrl: string): string {
  if (!destinationUrl) return appUrl;
  if (!destinationUrl.startsWith("http")) {
    return `${appUrl}${destinationUrl.startsWith("/") ? "" : "/"}${destinationUrl}`;
  }
  try {
    const host = new URL(destinationUrl).hostname.toLowerCase();
    if (host === "orengen.io" || host.endsWith(".orengen.io")) return destinationUrl;
  } catch {
    /* fall through */
  }
  return appUrl;
}

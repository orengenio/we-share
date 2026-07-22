/**
 * Sales Representative Agreement acceptance (full text at /partner-agreement).
 *
 * Tax identity (W-9/TIN) is collected and certified by Stripe Connect during
 * payout onboarding and 1099s issue through Stripe — the app records the
 * CONTRACTUAL acceptance. The legacy `w9Submitted` column stores "has accepted
 * some version"; the authoritative version/timestamp/IP record lives in the
 * audit log, so a new agreement version triggers re-acceptance without a
 * migration.
 */

import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { apiSuccess, apiUnauthorized, apiForbidden, getClientIP } from "@/lib/utils";

const AGREEMENT_VERSION = "v3-2026-07-22";

async function acceptedVersion(partnerId: string): Promise<string | null> {
  const entry = await db.auditLog.findFirst({
    where: { action: "PARTNER_AGREEMENT_ACCEPTED", resourceId: partnerId },
    orderBy: { createdAt: "desc" },
    select: { details: true },
  });
  const details = entry?.details as { version?: string } | null;
  return details?.version ?? null;
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (!session.partnerId) return apiForbidden();

  const version = await acceptedVersion(session.partnerId);

  return apiSuccess({
    accepted: version === AGREEMENT_VERSION,
    acceptedVersion: version,
    currentVersion: AGREEMENT_VERSION,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (!session.partnerId) return apiForbidden();

  const version = await acceptedVersion(session.partnerId);
  if (version === AGREEMENT_VERSION) {
    return apiSuccess({ accepted: true, alreadyAccepted: true, version: AGREEMENT_VERSION });
  }

  await db.partnerProfile.update({
    where: { id: session.partnerId },
    data: { w9Submitted: true },
  });

  await db.auditLog.create({
    data: {
      userId: session.userId,
      action: "PARTNER_AGREEMENT_ACCEPTED",
      resource: "PartnerProfile",
      resourceId: session.partnerId,
      details: { version: AGREEMENT_VERSION, previousVersion: version },
      ipAddress: getClientIP(req.headers),
    },
  });

  return apiSuccess({ accepted: true, version: AGREEMENT_VERSION });
}

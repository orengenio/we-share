/**
 * Partner Payment Authorization & Contractor Agreement acceptance.
 *
 * DECISION (2026-07-08): tax identity (W-9/TIN) is collected and certified by
 * Stripe Connect Express during payout onboarding, and 1099s are issued
 * through Stripe — no separate W-9 is collected here. What the app records is
 * the CONTRACTUAL acknowledgment (contractor status, clawback consent,
 * residual terms). The legacy `w9Submitted` column stores that acceptance;
 * the acceptance timestamp + agreement version live in the audit log.
 */

import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { apiSuccess, apiUnauthorized, apiForbidden, getClientIP } from "@/lib/utils";

const AGREEMENT_VERSION = "v1-2026-07-08";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (!session.partnerId) return apiForbidden();

  const partner = await db.partnerProfile.findUnique({
    where: { id: session.partnerId },
    select: { w9Submitted: true },
  });

  return apiSuccess({ accepted: partner?.w9Submitted ?? false, version: AGREEMENT_VERSION });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (!session.partnerId) return apiForbidden();

  const partner = await db.partnerProfile.findUnique({
    where: { id: session.partnerId },
    select: { w9Submitted: true },
  });
  if (partner?.w9Submitted) {
    return apiSuccess({ accepted: true, alreadyAccepted: true });
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
      details: { version: AGREEMENT_VERSION },
      ipAddress: getClientIP(req.headers),
    },
  });

  return apiSuccess({ accepted: true, version: AGREEMENT_VERSION });
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils";

const certifySchema = z.object({
  partnerId: z.string(),
  action: z.enum(["certify", "unlock_leads", "suspend", "reinstate", "promote_leader", "demote_leader"]),
  reason: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  try {
    const body = await req.json();
    const { partnerId, action, reason } = certifySchema.parse(body);

    const now = new Date();

    const updates: Record<string, unknown> = {};

    if (action === "certify") {
      updates.isCertified = true;
      updates.certifiedAt = now;
    } else if (action === "unlock_leads") {
      updates.leadsUnlocked = true;
      updates.leadsUnlockedAt = now;
    } else if (action === "suspend") {
      updates.isActive = false;
      updates.suspendedAt = now;
      updates.suspendedReason = reason ?? "Admin suspension";
    } else if (action === "reinstate") {
      updates.isActive = true;
      updates.suspendedAt = null;
      updates.suspendedReason = null;
    } else if (action === "promote_leader") {
      updates.isLeader = true;
      updates.promotedLeaderAt = now;
    } else if (action === "demote_leader") {
      updates.isLeader = false;
      updates.promotedLeaderAt = null;
    }

    await db.partnerProfile.update({ where: { id: partnerId }, data: updates });

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: `PARTNER_${action.toUpperCase()}`,
        resource: "PartnerProfile",
        resourceId: partnerId,
        details: { reason },
      },
    });

    return apiSuccess({ updated: true, action });
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error(err);
    return apiError("Update failed", 500);
  }
}

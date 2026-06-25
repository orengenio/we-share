import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils";

const actionSchema = z.object({
  affiliateId: z.string(),
  action: z.enum(["suspend", "reinstate", "add_strike", "terminate"]),
  reason: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  try {
    const body = await req.json();
    const { affiliateId, action, reason } = actionSchema.parse(body);

    const now = new Date();
    const updates: Record<string, unknown> = {};

    if (action === "suspend") {
      updates.isActive = false;
      updates.suspendedAt = now;
      updates.suspendedReason = reason ?? "Admin suspension";
    } else if (action === "reinstate") {
      updates.isActive = true;
      updates.suspendedAt = null;
      updates.suspendedReason = null;
    } else if (action === "add_strike") {
      const current = await db.affiliateProfile.findUnique({ where: { id: affiliateId } });
      const newStrikes = (current?.strikeCount ?? 0) + 1;
      updates.strikeCount = newStrikes;
      if (newStrikes >= 3) {
        updates.isActive = false;
        updates.terminatedAt = now;
        updates.suspendedReason = "3 strikes — auto-terminated";
      }
    } else if (action === "terminate") {
      updates.isActive = false;
      updates.terminatedAt = now;
      updates.suspendedReason = reason ?? "Admin termination";
      // Void pending commissions
      await db.commission.updateMany({
        where: { affiliateId, status: "PENDING" },
        data: { status: "VOID", voidMemo: reason ?? "Account terminated" },
      });
    }

    await db.affiliateProfile.update({ where: { id: affiliateId }, data: updates });

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: `AFFILIATE_${action.toUpperCase()}`,
        resource: "AffiliateProfile",
        resourceId: affiliateId,
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

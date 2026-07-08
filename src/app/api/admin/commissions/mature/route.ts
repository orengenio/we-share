import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { apiSuccess, apiUnauthorized, apiForbidden } from "@/lib/utils";

/**
 * Auto-approve PENDING commissions whose maturity date has passed and whose
 * conversion is not refunded.
 */
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  const now = new Date();

  const pending = await db.commission.findMany({
    where: {
      status: "PENDING",
      OR: [{ maturesAt: null }, { maturesAt: { lte: now } }],
      conversion: { isRefunded: false },
    },
    select: { id: true, conversionId: true },
  });

  const ids = pending.map((c) => c.id);
  const conversionIds = [...new Set(pending.map((c) => c.conversionId))];

  if (ids.length === 0) {
    return apiSuccess({ approved: 0, overridesApproved: 0 });
  }

  const [result, overrideResult] = await db.$transaction([
    db.commission.updateMany({
      where: { id: { in: ids } },
      data: { status: "APPROVED", approvedAt: now },
    }),
    db.override.updateMany({
      where: { conversionId: { in: conversionIds }, status: "PENDING" },
      data: { status: "APPROVED" },
    }),
  ]);

  await db.auditLog.create({
    data: {
      userId: session.userId,
      action: "COMMISSIONS_MATURED",
      resource: "Commission",
      details: { count: result.count, commissionIds: ids },
    },
  });

  return apiSuccess({ approved: result.count, overridesApproved: overrideResult.count });
}

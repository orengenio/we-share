import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { parsePagination, apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils";
import { emitEvent } from "@/lib/events";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  const { searchParams } = new URL(req.url);
  const { page, pageSize, skip } = parsePagination(searchParams);
  const status = searchParams.get("status") ?? "";
  const affiliateId = searchParams.get("affiliateId") ?? "";

  const where = {
    ...(status ? { status: status as "PENDING" | "APPROVED" | "PAID" | "CLAWBACK" | "VOID" } : {}),
    ...(affiliateId ? { affiliateId } : {}),
  };

  const [items, total, totals] = await Promise.all([
    db.commission.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        affiliate: { include: { user: { select: { name: true, email: true } } } },
        partner: { include: { user: { select: { name: true, email: true } } } },
        conversion: { select: { type: true, grossRevenue: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.commission.count({ where }),
    db.commission.aggregate({
      where,
      _sum: { amount: true },
    }),
  ]);

  return apiSuccess({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    totalAmount: totals._sum.amount ?? 0,
  });
}

const approveSchema = z.object({
  commissionIds: z.array(z.string()).min(1),
});

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  try {
    const body = await req.json();
    const { commissionIds } = approveSchema.parse(body);

    // The commissions being approved, so we can cascade to their conversions'
    // Army overrides (which have no separate approval UI and would otherwise
    // never become payable).
    const toApprove = await db.commission.findMany({
      where: { id: { in: commissionIds }, status: "PENDING" },
      select: { conversionId: true },
    });
    const conversionIds = [...new Set(toApprove.map((c) => c.conversionId))];

    const [result, overrideResult] = await db.$transaction([
      db.commission.updateMany({
        where: { id: { in: commissionIds }, status: "PENDING" },
        data: { status: "APPROVED", approvedAt: new Date() },
      }),
      db.override.updateMany({
        where: { conversionId: { in: conversionIds }, status: "PENDING" },
        data: { status: "APPROVED" },
      }),
    ]);

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: "COMMISSIONS_APPROVED",
        resource: "Commission",
        details: { count: result.count, overridesApproved: overrideResult.count, commissionIds },
      },
    });

    emitEvent("commission.approved", {
      commissionIds,
      count: result.count,
      approvedBy: session.userId,
    });

    return apiSuccess({ approved: result.count, overridesApproved: overrideResult.count });
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error(err);
    return apiError("Approval failed", 500);
  }
}

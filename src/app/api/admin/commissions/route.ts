import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { parsePagination, apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils";

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

    const result = await db.commission.updateMany({
      where: { id: { in: commissionIds }, status: "PENDING" },
      data: { status: "APPROVED", approvedAt: new Date() },
    });

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: "COMMISSIONS_APPROVED",
        resource: "Commission",
        details: { count: result.count, commissionIds },
      },
    });

    return apiSuccess({ approved: result.count });
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error(err);
    return apiError("Approval failed", 500);
  }
}

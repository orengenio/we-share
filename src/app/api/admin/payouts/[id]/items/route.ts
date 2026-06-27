import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound, apiServerError } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return apiUnauthorized();
    if (session.role !== "ADMIN") return apiForbidden();

    const { id } = await params;

    const payout = await db.payout.findUnique({ where: { id } });
    if (!payout) return apiNotFound("Payout batch not found");

    const items = await db.payoutItem.findMany({
      where: { payoutId: id },
      orderBy: { netAmount: "desc" },
      include: {
        affiliate: { include: { user: { select: { name: true, email: true } } } },
        partner: { include: { user: { select: { name: true, email: true } } } },
      },
    });

    return apiSuccess({ items });
  } catch (err) {
    console.error("[GET /api/admin/payouts/[id]/items]", err);
    return apiServerError(err);
  }
}

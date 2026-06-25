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

  const where = status ? { status: status as "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED" } : {};

  const [items, total] = await Promise.all([
    db.dispute.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        affiliate: { include: { user: { select: { name: true, email: true } } } },
        partner: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.dispute.count({ where }),
  ]);

  return apiSuccess({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

const resolveSchema = z.object({
  disputeId: z.string(),
  resolution: z.string().min(10),
  status: z.enum(["RESOLVED", "REJECTED"]),
});

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  try {
    const body = await req.json();
    const { disputeId, resolution, status } = resolveSchema.parse(body);

    await db.dispute.update({
      where: { id: disputeId },
      data: {
        status,
        resolution,
        resolvedAt: new Date(),
        resolvedById: session.userId,
      },
    });

    return apiSuccess({ resolved: true });
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error(err);
    return apiError("Failed to resolve dispute", 500);
  }
}

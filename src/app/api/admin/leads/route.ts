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
  const search = searchParams.get("search") ?? "";

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    db.lead.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        affiliate: { include: { user: { select: { name: true, email: true } } } },
        partner: { include: { user: { select: { name: true, email: true } } } },
        conversions: { select: { id: true, type: true, grossRevenue: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.lead.count({ where }),
  ]);

  return apiSuccess({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

const assignSchema = z.object({
  leadId: z.string(),
  partnerId: z.string(),
});

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  try {
    const body = await req.json();
    const { leadId, partnerId } = assignSchema.parse(body);

    const { addHours } = await import("date-fns");

    await db.lead.update({
      where: { id: leadId },
      data: {
        partnerId,
        assignedPartnerId: partnerId,
        assignedAt: new Date(),
        firstTouchDeadline: addHours(new Date(), 4),
      },
    });

    await db.partnerProfile.update({
      where: { id: partnerId },
      data: { totalLeadsAssigned: { increment: 1 } },
    });

    return apiSuccess({ assigned: true });
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error(err);
    return apiError("Assignment failed", 500);
  }
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { sendLeadAssigned } from "@/lib/email";
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

// ─── Delete a lead (test/junk data cleanup) ───────────────────────────────────
// Refuses when money is attached: a lead with conversions is part of the
// commission ledger and must stay (7-year retention).

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  try {
    const { leadId } = z.object({ leadId: z.string().min(1) }).parse(await req.json());

    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: { _count: { select: { conversions: true } }, ghlOpportunity: { select: { id: true } } },
    });
    if (!lead) return apiError("Lead not found", 404);
    if (lead._count.conversions > 0) {
      return apiError(
        "This lead has recorded conversions (money is attached) — it can't be deleted. It's part of the commission ledger.",
        400
      );
    }

    await db.$transaction([
      ...(lead.ghlOpportunity ? [db.gHLOpportunity.delete({ where: { id: lead.ghlOpportunity.id } })] : []),
      db.lead.delete({ where: { id: leadId } }),
    ]);

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: "LEAD_DELETED",
        resource: "Lead",
        resourceId: leadId,
        details: { email: lead.email, status: lead.status },
      },
    });

    return apiSuccess({ deleted: true });
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error("lead delete failed:", err);
    return apiError("Could not delete lead", 500);
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  try {
    const body = await req.json();
    const { leadId, partnerId } = assignSchema.parse(body);

    const { addHours } = await import("date-fns");

    const lead = await db.lead.update({
      where: { id: leadId },
      data: {
        partnerId,
        assignedPartnerId: partnerId,
        assignedAt: new Date(),
        firstTouchDeadline: addHours(new Date(), 4),
      },
    });

    const partner = await db.partnerProfile.update({
      where: { id: partnerId },
      data: { totalLeadsAssigned: { increment: 1 } },
      include: { user: { select: { email: true, name: true } } },
    });

    // Notify the rep — the 4-hour first-touch clock starts at assignment.
    sendLeadAssigned(
      partner.user.email,
      partner.user.name ?? "there",
      `${lead.firstName} ${lead.lastName}`.trim(),
      lead.company
    ).catch(console.error);

    return apiSuccess({ assigned: true });
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error(err);
    return apiError("Assignment failed", 500);
  }
}

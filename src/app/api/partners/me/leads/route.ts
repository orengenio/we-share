import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { updateOpportunity, getGHLStageId, getGHLOpportunityStatus } from "@/lib/ghl";
import { parsePagination, apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils";
import { LeadStatus } from "@prisma/client";

const updateSchema = z.object({
  leadId: z.string(),
  status: z.enum(["NEW", "CONTACTED", "APPOINTMENT", "PROPOSAL", "WON", "LOST", "NURTURE"]),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (!session.partnerId) return apiForbidden();

  const { searchParams } = new URL(req.url);
  const { page, pageSize, skip } = parsePagination(searchParams);
  const status = searchParams.get("status") ?? "";

  const leads = await db.lead.findMany({
    where: {
      partnerId: session.partnerId,
      ...(status ? { status: status as LeadStatus } : {}),
    },
    skip,
    take: pageSize,
    include: {
      conversions: { select: { id: true, type: true, grossRevenue: true, createdAt: true } },
      ghlOpportunity: true,
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const total = await db.lead.count({
    where: {
      partnerId: session.partnerId,
      ...(status ? { status: status as LeadStatus } : {}),
    },
  });

  return apiSuccess({ items: leads, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (!session.partnerId) return apiForbidden();

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const lead = await db.lead.findFirst({
      where: { id: data.leadId, partnerId: session.partnerId },
      include: { ghlOpportunity: true },
    });

    if (!lead) return apiError("Lead not found", 404);

    const now = new Date();
    const update: Record<string, unknown> = {
      status: data.status,
      lastTouchedAt: now,
      touchCount: { increment: 1 },
      ...(data.notes ? { notes: data.notes } : {}),
    };

    // First touch tracking
    if (!lead.firstTouchAt && data.status !== "NEW") {
      update.firstTouchAt = now;
    }

    // SLA compliance
    if (lead.firstTouchDeadline && now <= lead.firstTouchDeadline && !lead.firstTouchAt) {
      update.slaBreached = false;
    }

    await db.lead.update({ where: { id: data.leadId }, data: update });

    // Sync to GHL
    if (lead.ghlOpportunity && process.env.GHL_PARTNER_PIPELINE_ID) {
      updateOpportunity(
        lead.ghlOpportunity.ghlPipelineId ?? process.env.GHL_PARTNER_PIPELINE_ID!,
        lead.ghlOpportunity.ghlOpportunityId,
        {
          stageId: getGHLStageId(data.status),
          status: getGHLOpportunityStatus(data.status),
        }
      ).catch(console.error);
    }

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: "LEAD_STATUS_UPDATE",
        resource: "Lead",
        resourceId: data.leadId,
        details: { from: lead.status, to: data.status },
      },
    });

    return apiSuccess({ updated: true });
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error(err);
    return apiError("Failed to update lead", 500);
  }
}

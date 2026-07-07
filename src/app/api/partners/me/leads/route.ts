import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import {
  updateOpportunity,
  getGHLStageId,
  getGHLOpportunityStatus,
} from "@/lib/ghl";
import { registerProspect, syncProspectToGHL } from "@/lib/prospects";
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

// ─── Register a prospect (self-sourced) ───────────────────────────────────────
// Ownership-by-entry + claim protection — the shared logic lives in
// src/lib/prospects.ts and is also used by the bulk CSV import.

const registerSchema = z.object({
  company: z.string().min(1).max(200),
  contactName: z.string().max(160).optional(),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  notes: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (!session.partnerId) return apiForbidden();

  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const ctx = {
      userId: session.userId,
      partnerId: session.partnerId,
      partnerCode: session.partnerCode,
    };
    const result = await registerProspect(ctx, data);

    switch (result.outcome) {
      case "already_yours":
        return apiSuccess({ lead: result.lead, alreadyYours: true });
      case "owned_by_other":
        return apiError("This business is already claimed by another partner.", 409);
      case "claimed":
        return apiSuccess({ lead: result.lead, claimed: true });
      case "created":
        syncProspectToGHL(ctx, result.lead, data.phone).catch((e) =>
          console.error("prospect GHL sync failed:", e)
        );
        return apiSuccess({ lead: result.lead }, 201);
    }
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error("prospect register failed:", err);
    return apiError("Could not register prospect", 500);
  }
}

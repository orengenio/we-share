import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import {
  updateOpportunity,
  getGHLStageId,
  getGHLOpportunityStatus,
  createOpportunity,
  upsertContact,
} from "@/lib/ghl";
import { addHours } from "date-fns";
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
// Ownership-by-entry + claim protection: the first partner to register a
// business owns it. A second partner who enters the same email or phone is told
// it's already claimed rather than creating a duplicate — this is what
// guarantees the right rep gets the sale.

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
    const email = data.email.toLowerCase().trim();
    // Store rep-entered phones digit-normalized so two reps entering the same
    // number always collide on an exact match (form leads keep their raw phone).
    const phoneDigits = data.phone.replace(/\D/g, "").slice(-10);

    // ── Claim protection ──────────────────────────────────────────────────────
    const existing = await db.lead.findFirst({
      where: {
        OR: [
          { email: { equals: email, mode: "insensitive" } },
          ...(phoneDigits.length >= 7 ? [{ phone: phoneDigits }] : []),
        ],
      },
    });

    if (existing) {
      if (existing.partnerId === session.partnerId) {
        return apiSuccess({ lead: existing, alreadyYours: true });
      }
      if (existing.partnerId) {
        return apiError("This business is already claimed by another partner.", 409);
      }
      // Unowned (e.g. an inbound lead) → first-touch claim wins.
      const claimed = await db.lead.update({
        where: { id: existing.id },
        data: {
          partnerId: session.partnerId,
          assignedPartnerId: session.partnerId,
          assignedAt: new Date(),
        },
      });
      await db.auditLog.create({
        data: {
          userId: session.userId,
          action: "PROSPECT_CLAIMED",
          resource: "Lead",
          resourceId: existing.id,
          details: { via: "register" },
        },
      });
      return apiSuccess({ lead: claimed, claimed: true });
    }

    // ── New prospect, owned by this rep ───────────────────────────────────────
    const parts = (data.contactName?.trim() || data.company).split(/\s+/);
    const lead = await db.lead.create({
      data: {
        firstName: parts[0] || data.company,
        lastName: parts.slice(1).join(" ") || "",
        company: data.company,
        email,
        phone: phoneDigits,
        partnerId: session.partnerId,
        assignedPartnerId: session.partnerId,
        assignedAt: new Date(),
        status: "NEW",
        source: "rep_prospect",
        notes: data.notes,
        firstTouchDeadline: addHours(new Date(), 4),
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: "PROSPECT_REGISTERED",
        resource: "Lead",
        resourceId: lead.id,
        details: { company: data.company },
      },
    });

    // ── Sync to GHL (non-blocking): contact tagged to the rep + a pipeline
    // opportunity so the prospect shows up as this rep's, in the pipeline.
    if (process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID) {
      const repTag = `Sales Partner: ${session.partnerCode ?? session.partnerId}`;
      (async () => {
        const contactId = await upsertContact({
          firstName: lead.firstName,
          lastName: lead.lastName,
          email,
          phone: data.phone,
          company: data.company,
          source: "WeShare Rep Prospect",
          tags: ["WeShare Prospect", repTag],
        });
        await db.lead.update({ where: { id: lead.id }, data: { ghlContactId: contactId } });

        if (process.env.GHL_PARTNER_PIPELINE_ID) {
          const opp = await createOpportunity({
            title: `${data.company}${data.contactName ? ` — ${data.contactName}` : ""}`,
            status: "open",
            stageId: getGHLStageId("NEW"),
            pipelineId: process.env.GHL_PARTNER_PIPELINE_ID,
            contactId,
          });
          await db.gHLOpportunity.create({
            data: {
              leadId: lead.id,
              partnerId: session.partnerId!,
              ghlOpportunityId: opp.opportunity.id,
              ghlPipelineId: process.env.GHL_PARTNER_PIPELINE_ID,
              ghlStageId: getGHLStageId("NEW"),
              ghlContactId: contactId,
              status: "open",
            },
          }).catch(console.error);
        }
      })().catch((e) => console.error("prospect GHL sync failed:", e));
    }

    return apiSuccess({ lead }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error("prospect register failed:", err);
    return apiError("Could not register prospect", 500);
  }
}

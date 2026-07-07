/**
 * Self-sourced prospect registration — shared by the single "Register a
 * Prospect" endpoint and the bulk CSV import, so both go through the exact
 * same claim/dedup path.
 *
 * Ownership-by-entry + claim protection: the first partner to register a
 * business owns it. A second partner who enters the same email or phone is
 * told it's already claimed rather than creating a duplicate — this is what
 * guarantees the right rep gets the sale.
 */

import db from "@/lib/db";
import { upsertContact, createOpportunity, getGHLStageId } from "@/lib/ghl";
import { addHours } from "date-fns";
import type { Lead } from "@prisma/client";

export interface ProspectInput {
  company: string;
  contactName?: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface RepContext {
  userId: string;
  partnerId: string;
  partnerCode?: string | null;
}

export type RegisterResult =
  | { outcome: "created"; lead: Lead }
  | { outcome: "already_yours"; lead: Lead }
  | { outcome: "claimed"; lead: Lead }
  | { outcome: "owned_by_other" };

// Store rep-entered phones digit-normalized so two reps entering the same
// number always collide on an exact match (form leads keep their raw phone).
export function normalizeProspectPhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

export async function registerProspect(
  ctx: RepContext,
  data: ProspectInput,
  via: "register" | "import" = "register"
): Promise<RegisterResult> {
  const email = data.email.toLowerCase().trim();
  const phoneDigits = normalizeProspectPhone(data.phone);

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
    if (existing.partnerId === ctx.partnerId) {
      return { outcome: "already_yours", lead: existing };
    }
    if (existing.partnerId) {
      return { outcome: "owned_by_other" };
    }
    // Unowned (e.g. an inbound lead) → first-touch claim wins.
    const claimed = await db.lead.update({
      where: { id: existing.id },
      data: {
        partnerId: ctx.partnerId,
        assignedPartnerId: ctx.partnerId,
        assignedAt: new Date(),
      },
    });
    await db.auditLog.create({
      data: {
        userId: ctx.userId,
        action: "PROSPECT_CLAIMED",
        resource: "Lead",
        resourceId: existing.id,
        details: { via },
      },
    });
    return { outcome: "claimed", lead: claimed };
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
      partnerId: ctx.partnerId,
      assignedPartnerId: ctx.partnerId,
      assignedAt: new Date(),
      status: "NEW",
      source: via === "import" ? "rep_import" : "rep_prospect",
      notes: data.notes,
      firstTouchDeadline: addHours(new Date(), 4),
    },
  });

  await db.auditLog.create({
    data: {
      userId: ctx.userId,
      action: "PROSPECT_REGISTERED",
      resource: "Lead",
      resourceId: lead.id,
      details: { company: data.company, via },
    },
  });

  return { outcome: "created", lead };
}

// ── GHL sync (call after a "created" outcome) ────────────────────────────────
// Contact tagged to the rep + a pipeline opportunity so the prospect shows up
// as this rep's, in the pipeline. No-op when GHL isn't configured. Callers run
// this non-blocking (single register) or paced (bulk import — GHL rate-limits).

export async function syncProspectToGHL(
  ctx: RepContext,
  lead: Lead,
  rawPhone: string
): Promise<void> {
  if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) return;

  const repTag = `Sales Partner: ${ctx.partnerCode ?? ctx.partnerId}`;
  const contactId = await upsertContact({
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: rawPhone,
    company: lead.company ?? undefined,
    source: "WeShare Rep Prospect",
    tags: ["WeShare Prospect", repTag],
  });
  await db.lead.update({ where: { id: lead.id }, data: { ghlContactId: contactId } });

  if (process.env.GHL_PARTNER_PIPELINE_ID) {
    // "Company — Contact Name" when a contact was given; the contact fields
    // fall back to the company name itself when it wasn't.
    const fullName = `${lead.firstName} ${lead.lastName}`.trim();
    const opp = await createOpportunity({
      title:
        lead.company && fullName && fullName !== lead.company
          ? `${lead.company} — ${fullName}`
          : lead.company ?? fullName,
      status: "open",
      stageId: getGHLStageId("NEW"),
      pipelineId: process.env.GHL_PARTNER_PIPELINE_ID,
      contactId,
    });
    await db.gHLOpportunity.create({
      data: {
        leadId: lead.id,
        partnerId: ctx.partnerId,
        ghlOpportunityId: opp.opportunity.id,
        ghlPipelineId: process.env.GHL_PARTNER_PIPELINE_ID,
        ghlStageId: getGHLStageId("NEW"),
        ghlContactId: contactId,
        status: "open",
      },
    }).catch(console.error);
  }
}

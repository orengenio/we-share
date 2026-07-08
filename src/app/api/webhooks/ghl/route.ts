/**
 * GoHighLevel webhook handler.
 *
 * Events handled:
 * - ContactCreate / ContactUpdate  → sync lead status
 * - OpportunityCreate / Update     → sync pipeline stage → lead status
 * - ConversationProviderOutbound   → log partner touch
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyGHLWebhook, extractAttributionFromGHL } from "@/lib/ghl";
import db from "@/lib/db";
import { LeadStatus } from "@prisma/client";
import { processSetupFeeConversion, resolvePackageFee } from "@/lib/commissions";
import { emitEvent } from "@/lib/events";
import { addDays } from "date-fns";
import { WEBSITE_PACKAGES } from "@/types";

const GHL_STAGE_TO_STATUS: Record<string, LeadStatus> = {
  [process.env.GHL_STAGE_NEW ?? "new"]: "NEW",
  [process.env.GHL_STAGE_CONTACTED ?? "contacted"]: "CONTACTED",
  [process.env.GHL_STAGE_APPOINTMENT ?? "appointment"]: "APPOINTMENT",
  [process.env.GHL_STAGE_PROPOSAL ?? "proposal"]: "PROPOSAL",
  [process.env.GHL_STAGE_WON ?? "won"]: "WON",
  [process.env.GHL_STAGE_LOST ?? "lost"]: "LOST",
  [process.env.GHL_STAGE_NURTURE ?? "nurture"]: "NURTURE",
};

async function attachAttributionFromCodes(
  leadId: string,
  codes: { affiliateCode?: string; partnerCode?: string }
) {
  const updates: { affiliateId?: string; partnerId?: string } = {};

  if (codes.affiliateCode) {
    const affiliate = await db.affiliateProfile.findUnique({
      where: { affiliateCode: codes.affiliateCode, isActive: true },
    });
    if (affiliate) updates.affiliateId = affiliate.id;
  }

  if (codes.partnerCode) {
    const partner = await db.partnerProfile.findUnique({
      where: { partnerCode: codes.partnerCode, isActive: true },
    });
    if (partner) updates.partnerId = partner.id;
  }

  if (Object.keys(updates).length > 0) {
    await db.lead.update({ where: { id: leadId }, data: updates });
  }

  return updates;
}

async function maybeRecordGHLWonConversion(
  leadId: string,
  monetaryValue?: number
) {
  const lead = await db.lead.findUnique({ where: { id: leadId } });
  if (!lead) return;

  const existing = await db.conversion.findFirst({
    where: { leadId, type: "SETUP_FEE" },
  });
  if (existing) return;

  const grossRevenue =
    monetaryValue && monetaryValue > 0
      ? resolvePackageFee(monetaryValue, "setup")
      : WEBSITE_PACKAGES.STANDARD.setupFee;

  const conversion = await db.conversion.create({
    data: {
      leadId: lead.id,
      affiliateId: lead.affiliateId,
      partnerId: lead.partnerId,
      type: "SETUP_FEE",
      grossRevenue,
      clawbackDeadline: addDays(new Date(), 30),
    },
  });

  await processSetupFeeConversion(conversion.id);

  emitEvent("conversion.created", {
    conversionId: conversion.id,
    leadId: lead.id,
    affiliateId: lead.affiliateId,
    partnerId: lead.partnerId,
    amount: grossRevenue,
    type: "SETUP_FEE",
    source: "ghl_opportunity_won",
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-ghl-signature");

  if (!verifyGHLWebhook(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { type: string; locationId: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  await db.webhookEvent.create({
    data: {
      source: "GHL",
      eventType: event.type,
      payload: event as unknown as Record<string, unknown>,
      signature: signature ?? undefined,
    },
  });

  switch (event.type) {
    case "OpportunityStageUpdate":
    case "OpportunityUpdate": {
      const data = event.data as {
        id: string;
        pipelineId: string;
        pipelineStageId: string;
        status: string;
        monetaryValue?: number;
        assignedTo?: string;
      };

      const opp = await db.gHLOpportunity.findUnique({
        where: { ghlOpportunityId: data.id },
        include: { lead: true },
      });

      if (opp) {
        const newStatus = GHL_STAGE_TO_STATUS[data.pipelineStageId] ?? null;

        await db.gHLOpportunity.update({
          where: { id: opp.id },
          data: {
            ghlStageId: data.pipelineStageId,
            status: data.status,
            monetaryValue: data.monetaryValue,
            assignedToGhlUserId: data.assignedTo,
            lastSyncedAt: new Date(),
          },
        });

        if (opp.leadId && newStatus) {
          await db.lead.update({
            where: { id: opp.leadId },
            data: {
              status: newStatus,
              lastTouchedAt: new Date(),
              touchCount: { increment: 1 },
              ...(newStatus === "CONTACTED" && !opp.lead?.firstTouchAt
                ? { firstTouchAt: new Date() }
                : {}),
            },
          });

          if (newStatus === "WON") {
            await maybeRecordGHLWonConversion(opp.leadId, data.monetaryValue);
          }
        }
      }
      break;
    }

    case "ContactCreate":
    case "ContactUpdate": {
      const data = event.data as {
        id: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
      };

      if (data.email) {
        const lead = await db.lead.findFirst({
          where: { email: { equals: data.email, mode: "insensitive" } },
        });

        if (lead) {
          const codes = extractAttributionFromGHL(data as Record<string, unknown>);
          await attachAttributionFromCodes(lead.id, codes);

          await db.lead.update({
            where: { id: lead.id },
            data: {
              ghlContactId: data.id,
              firstName: data.firstName ?? lead.firstName,
              lastName: data.lastName ?? lead.lastName,
              phone: data.phone ?? lead.phone,
            },
          });
        }
      }
      break;
    }

    case "NoteCreate":
    case "TaskCreate": {
      // Log as a touch for the partner pipeline
      const data = event.data as { contactId?: string };
      if (data.contactId) {
        const lead = await db.lead.findFirst({
          where: { ghlContactId: data.contactId },
        });
        if (lead) {
          await db.lead.update({
            where: { id: lead.id },
            data: {
              lastTouchedAt: new Date(),
              touchCount: { increment: 1 },
            },
          });
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

/**
 * Lead capture endpoint — submitted from forms on the marketing site.
 * Locks attribution permanently to the affiliate who drove the click.
 * Syncs the contact to GoHighLevel if GHL is configured.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { lockAttribution, checkSelfReferral } from "@/lib/tracking";
import { runLeadFraudChecks } from "@/lib/fraud";
import { syncLeadToGHL, createOpportunity, getGHLStageId } from "@/lib/ghl";
import { addHours } from "date-fns";
import { apiSuccess, apiError, getClientIP } from "@/lib/utils";

const VISITOR_COOKIE = "ws_vid";

const schema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().optional(),
  source: z.string().optional(),
  // TCPA consent captured from the marketing-site form when a phone is given.
  smsConsent: z.boolean().optional(),
  consentText: z.string().optional(),
  // Separate opt-ins — never pre-checked on any form, independently stamped.
  marketingConsent: z.boolean().optional(),
  aiFollowupConsent: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const visitorToken = req.cookies.get(VISITOR_COOKIE)?.value;
    const email = data.email.toLowerCase().trim();

    // Resolve attribution before any fraud check
    let affiliateId: string | null = null;
    let partnerId: string | null = null;
    if (visitorToken) {
      const { resolveAttribution } = await import("@/lib/tracking");
      const attr = await resolveAttribution(visitorToken);
      affiliateId = attr.affiliateId;
      partnerId = attr.partnerId;
    }

    // Self-referral check
    if (affiliateId) {
      const isSelf = await checkSelfReferral(affiliateId, email);
      if (isSelf) {
        return apiError("Self-referral is not permitted", 400);
      }
    }

    // Fraud checks
    const fraud = await runLeadFraudChecks(email, affiliateId);
    if (fraud.blocked) {
      return apiError("This email address cannot be used", 400);
    }

    // Idempotency — check if lead already exists
    const existingLead = await db.lead.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (existingLead) {
      // Update contact info but don't change attribution
      await db.lead.update({
        where: { id: existingLead.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone ?? existingLead.phone,
          company: data.company ?? existingLead.company,
          message: data.message ?? existingLead.message,
          updatedAt: new Date(),
        },
      });
      return apiSuccess({ leadId: existingLead.id, existing: true });
    }

    // Create the lead
    const lead = await db.lead.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email,
        phone: data.phone,
        company: data.company,
        message: data.message,
        source: data.source ?? "form",
        status: "NEW",
        firstTouchDeadline: addHours(new Date(), 4),
        smsConsent: data.smsConsent ?? false,
        consentText: data.consentText,
        consentCapturedAt: data.smsConsent ? new Date() : null,
        marketingConsent: data.marketingConsent ?? false,
        marketingConsentAt: data.marketingConsent ? new Date() : null,
        aiFollowupConsent: data.aiFollowupConsent ?? false,
        aiFollowupConsentAt: data.aiFollowupConsent ? new Date() : null,
      },
    });

    // Lock attribution to this lead
    if (visitorToken) {
      await lockAttribution(lead.id, visitorToken);
    }

    const lockedLead = await db.lead.findUnique({
      where: { id: lead.id },
      select: { affiliateId: true, partnerId: true },
    });

    const [affiliateProfile, partnerProfile] = await Promise.all([
      lockedLead?.affiliateId
        ? db.affiliateProfile.findUnique({
            where: { id: lockedLead.affiliateId },
            select: { affiliateCode: true },
          })
        : null,
      lockedLead?.partnerId
        ? db.partnerProfile.findUnique({
            where: { id: lockedLead.partnerId },
            select: { partnerCode: true },
          })
        : null,
    ]);

    const { emitEvent } = await import("@/lib/events");
    emitEvent("lead.registered", {
      leadId: lead.id,
      email,
      affiliateId: lockedLead?.affiliateId ?? affiliateId,
      partnerId: lockedLead?.partnerId ?? partnerId,
      source: data.source ?? "form",
    });

    // Sync to GoHighLevel (non-blocking)
    if (process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID) {
      syncLeadToGHL({
        firstName: data.firstName,
        lastName: data.lastName,
        email,
        phone: data.phone,
        company: data.company,
        source: data.source,
        affiliateCode: affiliateProfile?.affiliateCode,
        partnerCode: partnerProfile?.partnerCode,
      })
        .then(async (ghlContactId) => {
          await db.lead.update({
            where: { id: lead.id },
            data: { ghlContactId },
          });

          // Create pipeline opportunity if configured
          if (process.env.GHL_PARTNER_PIPELINE_ID) {
            const opp = await createOpportunity({
              title: `${data.firstName} ${data.lastName} — ${data.company ?? ""}`.trim(),
              status: "open",
              stageId: getGHLStageId("NEW"),
              pipelineId: process.env.GHL_PARTNER_PIPELINE_ID!,
              contactId: ghlContactId,
            });

            await db.gHLOpportunity.create({
              data: {
                leadId: lead.id,
                partnerId: lead.partnerId ?? "unassigned",
                ghlOpportunityId: opp.opportunity.id,
                ghlPipelineId: process.env.GHL_PARTNER_PIPELINE_ID,
                ghlStageId: getGHLStageId("NEW"),
                ghlContactId,
                status: "open",
              },
            }).catch(console.error);
          }
        })
        .catch(console.error);
    }

    await db.auditLog.create({
      data: {
        action: "LEAD_CREATED",
        resource: "Lead",
        resourceId: lead.id,
        details: { email, affiliateId, source: data.source },
        ipAddress: getClientIP(req.headers),
      },
    });

    return apiSuccess({ leadId: lead.id }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError(err.errors[0].message, 400);
    }
    console.error(err);
    return apiError("Failed to submit lead", 500);
  }
}

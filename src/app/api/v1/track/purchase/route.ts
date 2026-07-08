/**
 * External track API — for GHL, n8n, or custom checkout integrations.
 * Authenticate with X-WeShare-Api-Key header (WESHARE_API_KEY env).
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { verifyApiKey, emitEvent } from "@/lib/events";
import {
  processSetupFeeConversion,
  processResidualConversion,
} from "@/lib/commissions";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils";
import { addDays } from "date-fns";

const purchaseSchema = z.object({
  email: z.string().email(),
  amount: z.number().positive(),
  type: z.enum(["SETUP_FEE", "MONTHLY_MAINTENANCE"]).default("SETUP_FEE"),
  stripePaymentId: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  partnerCode: z.string().optional(),
  affiliateCode: z.string().optional(),
  traceId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  if (!verifyApiKey(req)) return apiUnauthorized("Invalid or missing API key");

  try {
    const body = purchaseSchema.parse(await req.json());

    let lead = await db.lead.findFirst({
      where: { email: { equals: body.email, mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
    });

    let affiliateId = lead?.affiliateId ?? null;
    let partnerId = lead?.partnerId ?? null;

    if (body.affiliateCode && !affiliateId) {
      const aff = await db.affiliateProfile.findUnique({
        where: { affiliateCode: body.affiliateCode, isActive: true },
      });
      affiliateId = aff?.id ?? null;
    }

    if (body.partnerCode && !partnerId) {
      const partner = await db.partnerProfile.findUnique({
        where: { partnerCode: body.partnerCode, isActive: true },
      });
      partnerId = partner?.id ?? null;
    }

    if (!lead) {
      lead = await db.lead.create({
        data: {
          firstName: "Checkout",
          lastName: "Customer",
          email: body.email,
          affiliateId,
          partnerId,
          source: "api_track_purchase",
          attributionLocked: true,
          attributedAt: new Date(),
        },
      });
    } else if (partnerId && !lead.partnerId) {
      await db.lead.update({
        where: { id: lead.id },
        data: { partnerId },
      });
    }

    const conversion = await db.conversion.create({
      data: {
        leadId: lead.id,
        affiliateId,
        partnerId,
        type: body.type,
        grossRevenue: body.amount,
        stripePaymentId: body.stripePaymentId,
        stripeCustomerId: body.stripeCustomerId,
        clawbackDeadline: addDays(new Date(), 30),
      },
      include: {
        affiliate: true,
        partner: true,
        lead: true,
      },
    });

    if (body.type === "MONTHLY_MAINTENANCE") {
      await processResidualConversion(conversion.id);
    } else {
      await processSetupFeeConversion(conversion.id);
    }

    emitEvent("conversion.created", {
      conversionId: conversion.id,
      leadId: lead.id,
      affiliateId,
      partnerId,
      amount: body.amount,
      type: body.type,
      traceId: body.traceId,
      source: "api_v1_track_purchase",
    });

    return apiSuccess({ conversionId: conversion.id, leadId: lead.id }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error("[v1/track/purchase]", err);
    return apiError("Track purchase failed", 500);
  }
}

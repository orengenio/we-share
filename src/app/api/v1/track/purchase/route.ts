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
  resolvePackageFee,
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
  if (!verifyApiKey(req)) return apiUnauthorized();

  try {
    const body = purchaseSchema.parse(await req.json());

    // ── Idempotency: same Stripe payment already tracked → return it, don't
    // re-pay. GHL/n8n webhook retries are routine; a retry must be a no-op.
    if (body.stripePaymentId) {
      const dup = await db.conversion.findUnique({
        where: { stripePaymentId: body.stripePaymentId },
      });
      if (dup) {
        return apiSuccess({ conversionId: dup.id, leadId: dup.leadId, duplicate: true });
      }
    }

    let lead = await db.lead.findFirst({
      where: { email: { equals: body.email, mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
    });

    // Attribution precedence mirrors the Stripe webhook: the lead's locked
    // attribution wins; otherwise affiliate code, else partner code — never
    // both, or one sale would pay two owners.
    let affiliateId = lead?.affiliateId ?? null;
    let partnerId = lead?.partnerId ?? null;

    if (!affiliateId && !partnerId) {
      if (body.affiliateCode) {
        const aff = await db.affiliateProfile.findUnique({
          where: { affiliateCode: body.affiliateCode, isActive: true },
        });
        affiliateId = aff?.id ?? null;
      }
      if (!affiliateId && body.partnerCode) {
        const partner = await db.partnerProfile.findUnique({
          where: { partnerCode: body.partnerCode, isActive: true },
        });
        partnerId = partner?.id ?? null;
      }
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
    } else if (partnerId && !lead.partnerId && !lead.affiliateId) {
      await db.lead.update({
        where: { id: lead.id },
        data: { partnerId },
      });
    }

    // ── Cross-source idempotency: one SETUP_FEE per client, one
    // MONTHLY_MAINTENANCE per client per month — regardless of whether the
    // Stripe webhook, a GHL Won event, or this API recorded it first.
    const now = new Date();
    if (body.type === "SETUP_FEE") {
      const existingSetup = await db.conversion.findFirst({
        where: { leadId: lead.id, type: "SETUP_FEE" },
      });
      if (existingSetup) {
        return apiSuccess(
          { conversionId: existingSetup.id, leadId: lead.id, duplicate: true }
        );
      }
    } else {
      const existingMonthly = await db.conversion.findFirst({
        where: {
          leadId: lead.id,
          type: "MONTHLY_MAINTENANCE",
          billingPeriod: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
            lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          },
        },
      });
      if (existingMonthly) {
        return apiSuccess(
          { conversionId: existingMonthly.id, leadId: lead.id, duplicate: true }
        );
      }
    }

    // Commissions are computed on the canonical package fee, not the raw
    // charge — a GHL checkout that bundles setup + first month must not
    // inflate the base (same rule as the Stripe webhook path).
    const grossRevenue = resolvePackageFee(
      body.amount,
      body.type === "SETUP_FEE" ? "setup" : "monthly"
    );

    const conversion = await db.conversion.create({
      data: {
        leadId: lead.id,
        affiliateId,
        partnerId,
        type: body.type,
        grossRevenue,
        stripePaymentId: body.stripePaymentId,
        stripeCustomerId: body.stripeCustomerId,
        ...(body.type === "MONTHLY_MAINTENANCE" ? { billingPeriod: now } : {}),
        clawbackDeadline: addDays(now, 30),
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
      amount: grossRevenue,
      amountPaid: body.amount,
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

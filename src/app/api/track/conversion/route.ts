/**
 * Conversion recording endpoint.
 * Called internally after Stripe confirms a payment, or manually by admin.
 * Triggers the full commission calculation pipeline.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { processSetupFeeConversion, processResidualConversion } from "@/lib/commissions";
import { addDays } from "date-fns";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils";

const schema = z.object({
  leadId: z.string(),
  type: z.enum(["SETUP_FEE", "MONTHLY_MAINTENANCE"]),
  grossRevenue: z.number().positive(),
  stripePaymentId: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  subscriptionId: z.string().optional(),
  billingPeriod: z.string().optional(), // ISO date string
});

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const lead = await db.lead.findUnique({
      where: { id: data.leadId },
      include: { affiliate: true, partner: true },
    });

    if (!lead) return apiError("Lead not found", 404);

    // Idempotency check
    if (data.stripePaymentId) {
      const existing = await db.conversion.findUnique({
        where: { stripePaymentId: data.stripePaymentId },
      });
      if (existing) return apiSuccess({ conversionId: existing.id, duplicate: true });
    }

    const conversion = await db.conversion.create({
      data: {
        leadId: data.leadId,
        affiliateId: lead.affiliateId,
        partnerId: lead.partnerId,
        type: data.type,
        grossRevenue: data.grossRevenue,
        stripePaymentId: data.stripePaymentId,
        stripeCustomerId: data.stripeCustomerId,
        subscriptionId: data.subscriptionId,
        billingPeriod: data.billingPeriod ? new Date(data.billingPeriod) : null,
        clawbackDeadline: addDays(new Date(), 30),
      },
    });

    // Process commissions — setup and residual take different paths.
    const result =
      data.type === "MONTHLY_MAINTENANCE"
        ? await processResidualConversion(conversion.id)
        : await processSetupFeeConversion(conversion.id);

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: "CONVERSION_RECORDED",
        resource: "Conversion",
        resourceId: conversion.id,
        details: { leadId: data.leadId, type: data.type, grossRevenue: data.grossRevenue },
      },
    });

    return apiSuccess({ conversionId: conversion.id, ...result }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error(err);
    return apiError("Failed to record conversion", 500);
  }
}

/**
 * Stripe webhook handler.
 *
 * Events handled:
 * - checkout.session.completed    → record setup fee conversion
 * - invoice.payment_succeeded     → record monthly maintenance conversion
 * - charge.refunded               → trigger clawback pipeline
 * - customer.subscription.deleted → cancel future residual commissions
 */

import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import {
  processSetupFeeConversion,
  processResidualConversion,
  processClawback,
  resolvePackageFee,
} from "@/lib/commissions";
import db from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";
import { addDays } from "date-fns";
import { emitEvent } from "@/lib/events";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Log the event
  const logged = await db.webhookEvent.create({
    data: {
      source: "STRIPE",
      eventType: event.type,
      payload: event as unknown as Record<string, unknown>,
      signature,
    },
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const affiliateCode = session.metadata?.affiliateCode;
        const partnerCode = session.metadata?.partnerCode ?? session.metadata?.ws_partner_code;
        const customerEmail = session.customer_email ?? session.customer_details?.email;

        if (!customerEmail) break;

        // Find or create lead
        let lead = await db.lead.findFirst({
          where: { email: { equals: customerEmail, mode: "insensitive" } },
        });

        if (!lead) {
          const nameParts = (session.customer_details?.name ?? "").split(" ");
          lead = await db.lead.create({
            data: {
              firstName: nameParts[0] ?? "Unknown",
              lastName: nameParts.slice(1).join(" ") || "Customer",
              email: customerEmail,
              source: "stripe_checkout",
              status: "WON",
              attributionLocked: true,
            },
          });
        }

        // Attach affiliate or partner if code present
        if (affiliateCode && !lead.affiliateId) {
          const affiliate = await db.affiliateProfile.findUnique({
            where: { affiliateCode },
          });
          if (affiliate) {
            await db.lead.update({
              where: { id: lead.id },
              data: { affiliateId: affiliate.id, status: "WON" },
            });
            lead = { ...lead, affiliateId: affiliate.id };
          }
        } else if (partnerCode && !lead.partnerId) {
          const partner = await db.partnerProfile.findUnique({
            where: { partnerCode },
          });
          if (partner) {
            await db.lead.update({
              where: { id: lead.id },
              data: { partnerId: partner.id, status: "WON" },
            });
            lead = { ...lead, partnerId: partner.id };
          }
        } else {
          await db.lead.update({ where: { id: lead.id }, data: { status: "WON" } });
        }

        lead = await db.lead.findUniqueOrThrow({ where: { id: lead.id } });

        // Record conversion — idempotent across sources: skip if this payment
        // was already tracked OR the client already has a SETUP_FEE conversion
        // (e.g. recorded by a GHL Won event or the v1 track API first). One
        // client must never produce two setup-fee commission runs.
        const existing = session.payment_intent
          ? await db.conversion.findUnique({
              where: { stripePaymentId: session.payment_intent as string },
            })
          : null;
        const existingSetup = existing
          ? existing
          : await db.conversion.findFirst({
              where: { leadId: lead.id, type: "SETUP_FEE" },
            });

        // A GHL-recorded conversion has no Stripe IDs — backfill them from the
        // real payment so charge.refunded can still find it for clawback.
        if (!existing && existingSetup && !existingSetup.stripePaymentId && session.payment_intent) {
          await db.conversion.update({
            where: { id: existingSetup.id },
            data: {
              stripePaymentId: session.payment_intent as string,
              stripeCustomerId: session.customer as string,
            },
          });
        }

        if (!existing && !existingSetup) {
          // Resolve the real package setup fee from the amount paid (robust to
          // a checkout that bundles setup + first month — see resolvePackageFee).
          const setupFee = resolvePackageFee((session.amount_total ?? 0) / 100, "setup");
          const conversion = await db.conversion.create({
            data: {
              leadId: lead.id,
              affiliateId: lead.affiliateId,
              partnerId: lead.partnerId,
              type: "SETUP_FEE",
              grossRevenue: setupFee,
              stripePaymentId: session.payment_intent as string ?? session.id,
              stripeCustomerId: session.customer as string,
              clawbackDeadline: addDays(new Date(), 30),
            },
          });
          await processSetupFeeConversion(conversion.id);

          emitEvent("conversion.created", {
            conversionId: conversion.id,
            leadId: lead.id,
            affiliateId: lead.affiliateId,
            partnerId: lead.partnerId,
            amount: setupFee,
            type: "SETUP_FEE",
            source: "stripe_checkout",
          });

          // Customer confirmation — receipt + "your build starts now". Sent only
          // when the conversion is first recorded, so webhook retries never
          // re-send. Non-blocking: mail failure never fails the webhook.
          const customerName =
            session.customer_details?.name?.split(" ")[0] ?? lead.firstName;
          sendOrderConfirmation(
            customerEmail,
            customerName,
            (session.amount_total ?? 0) / 100
          ).catch(console.error);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;
        if (invoice.billing_reason === "subscription_create") break; // handled by checkout.session.completed

        const customerEmail = invoice.customer_email;
        if (!customerEmail) break;

        const lead = await db.lead.findFirst({
          where: { email: { equals: customerEmail, mode: "insensitive" } },
        });
        if (!lead) break;

        const billingPeriod = new Date((invoice.period_start ?? 0) * 1000);

        // Check idempotency
        const existing = await db.conversion.findFirst({
          where: {
            leadId: lead.id,
            type: "MONTHLY_MAINTENANCE",
            billingPeriod: {
              gte: new Date(billingPeriod.getFullYear(), billingPeriod.getMonth(), 1),
              lt: new Date(billingPeriod.getFullYear(), billingPeriod.getMonth() + 1, 1),
            },
          },
        });
        if (existing) break;

        // Resolve the real monthly fee from the amount actually paid.
        const monthlyFee = resolvePackageFee((invoice.amount_paid ?? 0) / 100, "monthly");
        const conversion = await db.conversion.create({
          data: {
            leadId: lead.id,
            affiliateId: lead.affiliateId,
            partnerId: lead.partnerId,
            type: "MONTHLY_MAINTENANCE",
            grossRevenue: monthlyFee,
            stripePaymentId: invoice.payment_intent as string ?? invoice.id,
            stripeCustomerId: invoice.customer as string,
            subscriptionId: invoice.subscription as string,
            billingPeriod,
            clawbackDeadline: addDays(new Date(), 30),
          },
        });

        await processResidualConversion(conversion.id);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntent = charge.payment_intent as string;
        if (!paymentIntent) break;

        const conversion = await db.conversion.findUnique({
          where: { stripePaymentId: paymentIntent },
        });
        if (!conversion) break;

        const now = new Date();
        const withinClawback = now <= conversion.clawbackDeadline;

        await db.conversion.update({
          where: { id: conversion.id },
          data: {
            isRefunded: true,
            refundedAt: now,
            stripeRefundId: charge.refunds?.data[0]?.id,
            refundReason: charge.refunds?.data[0]?.reason ?? "stripe_refund",
          },
        });

        if (withinClawback) {
          await processClawback(conversion.id, "Customer refund within 30-day window", "STRIPE_WEBHOOK");
        }

        // Clawback event emitted from processClawback
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        // Mark future residual commissions as void for this subscription
        await db.commission.updateMany({
          where: {
            conversion: { subscriptionId: sub.id },
            status: "PENDING",
          },
          data: {
            status: "VOID",
            voidMemo: "Subscription cancelled",
          },
        });
        break;
      }
    }

    await db.webhookEvent.update({
      where: { id: logged.id },
      data: { processed: true, processedAt: new Date() },
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db.webhookEvent.update({
      where: { id: logged.id },
      data: { error: message, attempts: { increment: 1 } },
    });
    console.error("Stripe webhook processing error", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

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
import { processSetupFeeConversion, processClawback } from "@/lib/commissions";
import db from "@/lib/db";
import { addDays } from "date-fns";
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

        // Attach affiliate if code present
        if (affiliateCode && !lead.affiliateId) {
          const affiliate = await db.affiliateProfile.findUnique({
            where: { affiliateCode },
          });
          if (affiliate) {
            await db.lead.update({
              where: { id: lead.id },
              data: { affiliateId: affiliate.id, status: "WON" },
            });
          }
        } else {
          await db.lead.update({ where: { id: lead.id }, data: { status: "WON" } });
        }

        // Record conversion
        const existing = session.payment_intent
          ? await db.conversion.findUnique({
              where: { stripePaymentId: session.payment_intent as string },
            })
          : null;

        if (!existing) {
          const conversion = await db.conversion.create({
            data: {
              leadId: lead.id,
              affiliateId: lead.affiliateId,
              partnerId: lead.partnerId,
              type: "SETUP_FEE",
              grossRevenue: 997.00,
              stripePaymentId: session.payment_intent as string ?? session.id,
              stripeCustomerId: session.customer as string,
              clawbackDeadline: addDays(new Date(), 30),
            },
          });
          await processSetupFeeConversion(conversion.id);
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
        const monthKey = `${billingPeriod.getFullYear()}-${billingPeriod.getMonth()}`;

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

        const conversion = await db.conversion.create({
          data: {
            leadId: lead.id,
            affiliateId: lead.affiliateId,
            partnerId: lead.partnerId,
            type: "MONTHLY_MAINTENANCE",
            grossRevenue: 247.00,
            stripePaymentId: invoice.payment_intent as string ?? invoice.id,
            stripeCustomerId: invoice.customer as string,
            subscriptionId: invoice.subscription as string,
            billingPeriod,
            clawbackDeadline: addDays(new Date(), 30),
          },
        });

        await processSetupFeeConversion(conversion.id);
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

        // Trigger n8n clawback workflow
        if (process.env.N8N_CLAWBACK_WEBHOOK_URL) {
          fetch(process.env.N8N_CLAWBACK_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              conversionId: conversion.id,
              withinClawback,
              stripeChargeId: charge.id,
            }),
          }).catch(console.error);
        }
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

/**
 * Execute a payout batch — sends Stripe transfers to all recipients.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { createTransfer } from "@/lib/stripe";
import { sendPayoutNotification } from "@/lib/email";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils";

const schema = z.object({ payoutId: z.string() });

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  try {
    const { payoutId } = schema.parse(await req.json());

    const payout = await db.payout.findUniqueOrThrow({
      where: { id: payoutId },
      include: {
        items: {
          include: {
            affiliate: { include: { user: true } },
            partner: { include: { user: true } },
          },
        },
      },
    });

    if (payout.status !== "PENDING") {
      return apiError(`Payout is already ${payout.status}`, 400);
    }

    await db.payout.update({ where: { id: payoutId }, data: { status: "PROCESSING" } });

    let successCount = 0;
    let failCount = 0;

    for (const item of payout.items) {
      if (!item.stripeAccountId) {
        await db.payoutItem.update({
          where: { id: item.id },
          data: { status: "FAILED", errorMessage: "No Stripe Connect account configured" },
        });
        failCount++;
        continue;
      }

      try {
        const transfer = await createTransfer(
          item.netAmount,
          item.stripeAccountId,
          `WeShare ${payout.batchLabel} payout`,
          {
            payoutId,
            payoutItemId: item.id,
            affiliateId: item.affiliateId ?? "",
            partnerId: item.partnerId ?? "",
          }
        );

        await db.payoutItem.update({
          where: { id: item.id },
          data: {
            status: "COMPLETED",
            stripeTransferId: transfer.id,
            processedAt: new Date(),
          },
        });

        // Send notification
        const user = item.affiliate?.user ?? item.partner?.user;
        if (user?.email) {
          sendPayoutNotification(
            user.email,
            user.name ?? "Partner",
            item.netAmount,
            payout.batchLabel
          ).catch(console.error);
        }

        successCount++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await db.payoutItem.update({
          where: { id: item.id },
          data: { status: "FAILED", errorMessage: message },
        });
        failCount++;
      }
    }

    const finalStatus = failCount === 0 ? "COMPLETED" : successCount === 0 ? "FAILED" : "COMPLETED";

    await db.payout.update({
      where: { id: payoutId },
      data: { status: finalStatus, processedAt: new Date() },
    });

    // Update commission statuses
    await db.commission.updateMany({
      where: { payoutId, status: "APPROVED" },
      data: { status: "PAID", paidAt: new Date() },
    });

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: "PAYOUT_EXECUTED",
        resource: "Payout",
        resourceId: payoutId,
        details: { successCount, failCount, finalStatus },
      },
    });

    return apiSuccess({ payoutId, successCount, failCount, status: finalStatus });
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error(err);
    return apiError("Payout execution failed", 500);
  }
}

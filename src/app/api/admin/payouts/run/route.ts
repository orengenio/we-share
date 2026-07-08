/**
 * Execute a payout batch — sends Stripe transfers to all recipients.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { createTransfer } from "@/lib/stripe";
import { sendPayoutNotification } from "@/lib/email";
import { emitEvent } from "@/lib/events";
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
    // Only recipients whose transfer actually completed get their ledger rows
    // marked PAID; failed recipients' rows are released to roll into a future
    // batch, so money is never marked paid without a transfer.
    const paidAffiliateIds: string[] = [];
    const paidPartnerIds: string[] = [];
    const failedAffiliateIds: string[] = [];
    const failedPartnerIds: string[] = [];

    function recordOutcome(item: (typeof payout.items)[number], ok: boolean) {
      if (ok) {
        if (item.affiliateId) paidAffiliateIds.push(item.affiliateId);
        if (item.partnerId) paidPartnerIds.push(item.partnerId);
      } else {
        if (item.affiliateId) failedAffiliateIds.push(item.affiliateId);
        if (item.partnerId) failedPartnerIds.push(item.partnerId);
      }
    }

    for (const item of payout.items) {
      if (!item.stripeAccountId) {
        await db.payoutItem.update({
          where: { id: item.id },
          data: { status: "FAILED", errorMessage: "No Stripe Connect account configured" },
        });
        recordOutcome(item, false);
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

        recordOutcome(item, true);
        successCount++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await db.payoutItem.update({
          where: { id: item.id },
          data: { status: "FAILED", errorMessage: message },
        });
        recordOutcome(item, false);
        failCount++;
      }
    }

    const finalStatus = failCount === 0 ? "COMPLETED" : successCount === 0 ? "FAILED" : "COMPLETED";

    await db.payout.update({
      where: { id: payoutId },
      data: { status: finalStatus, processedAt: new Date() },
    });

    // Mark PAID only the ledger rows of recipients whose transfer completed.
    const paidWhere = {
      payoutId,
      status: "APPROVED" as const,
      OR: [
        { affiliateId: { in: paidAffiliateIds } },
        { partnerId: { in: paidPartnerIds } },
      ],
    };
    await db.commission.updateMany({
      where: paidWhere,
      data: { status: "PAID", paidAt: new Date() },
    });
    await db.override.updateMany({
      where: { payoutId, status: "APPROVED", earnerId: { in: paidAffiliateIds } },
      data: { status: "PAID" },
    });

    // Release failed recipients' rows so a future batch can retry them.
    if (failedAffiliateIds.length > 0 || failedPartnerIds.length > 0) {
      await db.commission.updateMany({
        where: {
          payoutId,
          status: "APPROVED",
          OR: [
            { affiliateId: { in: failedAffiliateIds } },
            { partnerId: { in: failedPartnerIds } },
          ],
        },
        data: { payoutId: null },
      });
      await db.override.updateMany({
        where: { payoutId, status: "APPROVED", earnerId: { in: failedAffiliateIds } },
        data: { payoutId: null },
      });
    }

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: "PAYOUT_EXECUTED",
        resource: "Payout",
        resourceId: payoutId,
        details: { successCount, failCount, finalStatus },
      },
    });

    if (successCount > 0) {
      emitEvent("payout.completed", {
        payoutId,
        successCount,
        failCount,
        batchLabel: payout.batchLabel,
        totalAmount: payout.totalAmount,
      });
    }

    return apiSuccess({ payoutId, successCount, failCount, status: finalStatus });
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error(err);
    return apiError("Payout execution failed", 500);
  }
}

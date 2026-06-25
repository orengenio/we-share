/**
 * Payout management — calculates and executes monthly NET-15 payouts
 * via Stripe Connect transfers.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { createTransfer } from "@/lib/stripe";
import { parsePagination, apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  const { searchParams } = new URL(req.url);
  const { page, pageSize, skip } = parsePagination(searchParams);

  const [items, total] = await Promise.all([
    db.payout.findMany({
      skip,
      take: pageSize,
      include: {
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.payout.count(),
  ]);

  return apiSuccess({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

const createSchema = z.object({
  periodMonth: z.string().regex(/^\d{4}-\d{2}$/), // "2026-05"
});

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  try {
    const body = await req.json();
    const { periodMonth } = createSchema.parse(body);

    const [year, month] = periodMonth.split("-").map(Number);
    const periodStart = startOfMonth(new Date(year, month - 1));
    const periodEnd = endOfMonth(new Date(year, month - 1));
    const scheduledDate = new Date(year, month, 15); // 15th of following month
    const batchLabel = `${periodMonth} NET-15`;

    // Prevent duplicate payout runs
    const existing = await db.payout.findFirst({
      where: { batchLabel },
    });
    if (existing) return apiError(`Payout for ${periodMonth} already exists`, 409);

    // Aggregate approved commissions for the period
    const affiliateCommissions = await db.commission.groupBy({
      by: ["affiliateId"],
      where: {
        affiliateId: { not: null },
        status: "APPROVED",
        createdAt: { gte: periodStart, lte: periodEnd },
      },
      _sum: { amount: true },
      having: {
        amount: { _sum: { gt: 0 } },
      },
    });

    const partnerCommissions = await db.commission.groupBy({
      by: ["partnerId"],
      where: {
        partnerId: { not: null },
        status: "APPROVED",
        createdAt: { gte: periodStart, lte: periodEnd },
      },
      _sum: { amount: true },
      having: {
        amount: { _sum: { gt: 0 } },
      },
    });

    const affiliateOverrides = await db.override.groupBy({
      by: ["earnerId"],
      where: {
        status: "APPROVED",
        createdAt: { gte: periodStart, lte: periodEnd },
      },
      _sum: { amount: true },
    });

    // Build payout items (combine commissions + overrides per affiliate)
    const affiliateMap = new Map<string, { gross: number; stripeId: string | null }>();

    for (const c of affiliateCommissions) {
      if (!c.affiliateId) continue;
      const profile = await db.affiliateProfile.findUnique({
        where: { id: c.affiliateId },
        select: { stripeConnectId: true, payoutMinimum: true },
      });
      const gross = c._sum.amount ?? 0;
      if (gross < (profile?.payoutMinimum ?? 25)) continue; // below minimum rolls forward
      affiliateMap.set(c.affiliateId, { gross, stripeId: profile?.stripeConnectId ?? null });
    }

    // Add overrides to affiliate gross
    for (const o of affiliateOverrides) {
      const existing = affiliateMap.get(o.earnerId);
      if (existing) {
        existing.gross += o._sum.amount ?? 0;
      }
    }

    // Payout total
    let totalAmount = 0;
    const payoutItems: {
      affiliateId?: string;
      partnerId?: string;
      grossAmount: number;
      adjustments: number;
      netAmount: number;
      stripeAccountId?: string;
    }[] = [];

    for (const [affiliateId, { gross, stripeId }] of affiliateMap) {
      totalAmount += gross;
      payoutItems.push({
        affiliateId,
        grossAmount: gross,
        adjustments: 0,
        netAmount: gross,
        stripeAccountId: stripeId ?? undefined,
      });
    }

    for (const pc of partnerCommissions) {
      if (!pc.partnerId) continue;
      const profile = await db.partnerProfile.findUnique({
        where: { id: pc.partnerId },
        select: { stripeConnectId: true },
      });
      const gross = pc._sum.amount ?? 0;
      if (gross < 25) continue;
      totalAmount += gross;
      payoutItems.push({
        partnerId: pc.partnerId,
        grossAmount: gross,
        adjustments: 0,
        netAmount: gross,
        stripeAccountId: profile?.stripeConnectId ?? undefined,
      });
    }

    // Create payout record
    const payout = await db.payout.create({
      data: {
        batchLabel,
        periodStart,
        periodEnd,
        scheduledDate,
        totalAmount,
        recipientCount: payoutItems.length,
        initiatedById: session.userId,
        status: "PENDING",
        items: {
          create: payoutItems,
        },
      },
      include: { items: true },
    });

    // Mark commissions as linked to this payout
    await db.commission.updateMany({
      where: {
        status: "APPROVED",
        createdAt: { gte: periodStart, lte: periodEnd },
        payoutId: null,
      },
      data: { payoutId: payout.id },
    });

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: "PAYOUT_CREATED",
        resource: "Payout",
        resourceId: payout.id,
        details: { batchLabel, totalAmount, recipientCount: payoutItems.length },
      },
    });

    return apiSuccess({ payoutId: payout.id, batchLabel, totalAmount, recipientCount: payoutItems.length }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error(err);
    return apiError("Failed to create payout", 500);
  }
}

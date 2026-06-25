import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { nextRankInfo } from "@/lib/commissions";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { apiSuccess, apiUnauthorized, apiForbidden } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (!session.affiliateId) return apiForbidden();

  const affiliate = await db.affiliateProfile.findUniqueOrThrow({
    where: { id: session.affiliateId },
    include: {
      _count: { select: { downlineProfiles: true } },
    },
  });

  const now = new Date();

  // Monthly earnings breakdown — last 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, 11 - i);
    return { start: startOfMonth(d), end: endOfMonth(d), label: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` };
  });

  const monthlyData = await Promise.all(
    months.map(async ({ start, end, label }) => {
      const [commissions, convCount] = await Promise.all([
        db.commission.aggregate({
          where: {
            affiliateId: session.affiliateId,
            createdAt: { gte: start, lte: end },
            status: { not: "VOID" },
          },
          _sum: { amount: true },
        }),
        db.conversion.count({
          where: {
            affiliateId: session.affiliateId,
            createdAt: { gte: start, lte: end },
          },
        }),
      ]);
      return {
        month: label,
        commissions: commissions._sum.amount ?? 0,
        conversions: convCount,
      };
    })
  );

  // Army (downline) active this month
  const armyActive = await db.affiliateProfile.count({
    where: {
      uplineId: session.affiliateId,
      conversions: {
        some: {
          createdAt: { gte: startOfMonth(now), lte: endOfMonth(now) },
        },
      },
    },
  });

  // Pending commissions
  const pending = await db.commission.aggregate({
    where: { affiliateId: session.affiliateId, status: "PENDING" },
    _sum: { amount: true },
  });

  // Override earnings this month
  const overridesThisMonth = await db.override.aggregate({
    where: {
      earnerId: session.affiliateId,
      createdAt: { gte: startOfMonth(now) },
      status: { not: "VOID" },
    },
    _sum: { amount: true },
  });

  const nextRank = nextRankInfo(affiliate.lifetimeSales);

  return apiSuccess({
    rank: affiliate.rank,
    lifetimeSales: affiliate.lifetimeSales,
    totalClicks: affiliate.totalClicks,
    totalLeads: affiliate.totalLeads,
    totalConversions: affiliate.totalConversions,
    totalEarned: affiliate.totalEarned,
    totalPaid: affiliate.totalPaid,
    pendingBalance: pending._sum.amount ?? 0,
    isActive: affiliate.isActive,
    strikeCount: affiliate.strikeCount,
    fastStartBonusEarned: affiliate.fastStartBonusEarned,
    stripeConnectId: affiliate.stripeConnectId,
    stripeAccountStatus: affiliate.stripeAccountStatus,
    w9Submitted: affiliate.w9Submitted,
    armySize: affiliate._count.downlineProfiles,
    armyActiveThisMonth: armyActive,
    overridesThisMonth: overridesThisMonth._sum.amount ?? 0,
    nextRank,
    monthlyEarnings: monthlyData,
    conversionRate:
      affiliate.totalLeads > 0
        ? parseFloat(((affiliate.totalConversions / affiliate.totalLeads) * 100).toFixed(1))
        : 0,
  });
}

import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { apiSuccess, apiUnauthorized, apiForbidden } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  const now = new Date();
  const thisMonth = startOfMonth(now);

  const [
    totalAffiliates,
    activeAffiliates,
    totalPartners,
    activePartners,
    totalRevenue,
    totalCommissions,
    pendingPayouts,
    openFraudFlags,
    openDisputes,
    newLeadsThisMonth,
    conversionsThisMonth,
  ] = await Promise.all([
    db.affiliateProfile.count(),
    db.affiliateProfile.count({ where: { isActive: true } }),
    db.partnerProfile.count(),
    db.partnerProfile.count({ where: { isActive: true } }),
    db.conversion.aggregate({ _sum: { grossRevenue: true } }),
    db.commission.aggregate({
      where: { status: { in: ["APPROVED", "PAID"] } },
      _sum: { amount: true },
    }),
    db.commission.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
    }),
    db.fraudFlag.count({ where: { reviewedAt: null } }),
    db.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    db.lead.count({ where: { createdAt: { gte: thisMonth } } }),
    db.conversion.count({ where: { createdAt: { gte: thisMonth } } }),
  ]);

  // Monthly revenue — last 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, 11 - i);
    return {
      start: startOfMonth(d),
      end: endOfMonth(d),
      label: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    };
  });

  const monthlyData = await Promise.all(
    months.map(async ({ start, end, label }) => {
      const [rev, comm, conv] = await Promise.all([
        db.conversion.aggregate({
          where: { createdAt: { gte: start, lte: end } },
          _sum: { grossRevenue: true },
        }),
        db.commission.aggregate({
          where: { createdAt: { gte: start, lte: end }, status: { not: "VOID" } },
          _sum: { amount: true },
        }),
        db.conversion.count({ where: { createdAt: { gte: start, lte: end } } }),
      ]);
      return {
        month: label,
        revenue: rev._sum.grossRevenue ?? 0,
        commissions: comm._sum.amount ?? 0,
        conversions: conv,
      };
    })
  );

  // Rank distribution
  const rankDist = await db.affiliateProfile.groupBy({
    by: ["rank"],
    _count: { rank: true },
  });

  return apiSuccess({
    totalAffiliates,
    activeAffiliates,
    totalPartners,
    activePartners,
    totalRevenue: totalRevenue._sum.grossRevenue ?? 0,
    totalCommissionsPaid: totalCommissions._sum.amount ?? 0,
    pendingPayouts: pendingPayouts._sum.amount ?? 0,
    openFraudFlags,
    openDisputes,
    newLeadsThisMonth,
    conversionsThisMonth,
    monthlyRevenue: monthlyData,
    rankDistribution: Object.fromEntries(
      rankDist.map((r) => [r.rank, r._count.rank])
    ),
  });
}

import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { apiSuccess, apiUnauthorized, apiForbidden } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (!session.partnerId) return apiForbidden();

  const partner = await db.partnerProfile.findUniqueOrThrow({
    where: { id: session.partnerId },
  });

  const now = new Date();

  // Pipeline counts
  const [pipelineCounts, pendingBalance, slaBreaches] = await Promise.all([
    db.lead.groupBy({
      by: ["status"],
      where: { partnerId: session.partnerId },
      _count: { status: true },
    }),
    db.commission.aggregate({
      where: { partnerId: session.partnerId, status: "PENDING" },
      _sum: { amount: true },
    }),
    db.lead.count({
      where: { partnerId: session.partnerId, slaBreached: true },
    }),
  ]);

  const statusMap = Object.fromEntries(
    pipelineCounts.map((g) => [g.status, g._count.status])
  );

  // Monthly residual run-rate (active clients paying maintenance)
  const activeClients = await db.conversion.count({
    where: {
      partnerId: session.partnerId,
      type: "MONTHLY_MAINTENANCE",
      isRefunded: false,
      lead: { conversions: { some: { type: "MONTHLY_MAINTENANCE" } } },
    },
  });

  // Monthly earnings — last 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, 11 - i);
    return {
      start: startOfMonth(d),
      end: endOfMonth(d),
      label: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    };
  });

  const monthlyEarnings = await Promise.all(
    months.map(async ({ start, end, label }) => {
      const agg = await db.commission.aggregate({
        where: {
          partnerId: session.partnerId,
          createdAt: { gte: start, lte: end },
          status: { not: "VOID" },
        },
        _sum: { amount: true },
      });
      return { month: label, commissions: agg._sum.amount ?? 0 };
    })
  );

  return apiSuccess({
    totalLeadsAssigned: partner.totalLeadsAssigned,
    totalDealsWon: partner.totalDealsWon,
    totalEarned: partner.totalEarned,
    totalPaid: partner.totalPaid,
    pendingBalance: pendingBalance._sum.amount ?? 0,
    monthlyResidualRunRate: activeClients * 61.75,
    activeClients,
    slaBreaches,
    isCertified: partner.isCertified,
    leadsUnlocked: partner.leadsUnlocked,
    stripeConnectId: partner.stripeConnectId,
    stripeAccountStatus: partner.stripeAccountStatus,
    w9Submitted: partner.w9Submitted,
    pipeline: {
      new: statusMap["NEW"] ?? 0,
      contacted: statusMap["CONTACTED"] ?? 0,
      appointment: statusMap["APPOINTMENT"] ?? 0,
      proposal: statusMap["PROPOSAL"] ?? 0,
      won: statusMap["WON"] ?? 0,
      lost: statusMap["LOST"] ?? 0,
      nurture: statusMap["NURTURE"] ?? 0,
    },
    monthlyEarnings,
    conversionRate:
      partner.totalLeadsAssigned > 0
        ? parseFloat(((partner.totalDealsWon / partner.totalLeadsAssigned) * 100).toFixed(1))
        : 0,
  });
}

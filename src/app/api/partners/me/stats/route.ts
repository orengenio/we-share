import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { apiSuccess, apiUnauthorized, apiForbidden } from "@/lib/utils";
import { PARTNER_COMMISSION } from "@/types";

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

  // Active clients paying maintenance + their real monthly revenue, so the
  // residual run-rate reflects each client's actual package (Standard/Pro/
  // Premium) rather than a flat Standard-tier figure.
  const [activeClients, activeMaintenanceRevenue] = await Promise.all([
    db.conversion.count({
      where: {
        partnerId: session.partnerId,
        type: "MONTHLY_MAINTENANCE",
        isRefunded: false,
        lead: { conversions: { some: { type: "MONTHLY_MAINTENANCE" } } },
      },
    }),
    db.conversion.aggregate({
      where: {
        partnerId: session.partnerId,
        type: "MONTHLY_MAINTENANCE",
        isRefunded: false,
        lead: { conversions: { some: { type: "MONTHLY_MAINTENANCE" } } },
      },
      _sum: { grossRevenue: true },
    }),
  ]);

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

  // Recent commission history for the earnings table.
  const commissions = await db.commission.findMany({
    where: { partnerId: session.partnerId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      conversion: {
        select: {
          grossRevenue: true,
          lead: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  // This month's residual actually earned (accurate across mixed packages).
  const residualThisMonth = await db.commission.aggregate({
    where: {
      partnerId: session.partnerId,
      type: "PARTNER_RESIDUAL",
      status: { not: "VOID" },
      createdAt: { gte: startOfMonth(now), lte: endOfMonth(now) },
    },
    _sum: { amount: true },
  });

  return apiSuccess({
    totalLeadsAssigned: partner.totalLeadsAssigned,
    totalDealsWon: partner.totalDealsWon,
    totalEarned: partner.totalEarned,
    totalPaid: partner.totalPaid,
    pendingBalance: pendingBalance._sum.amount ?? 0,
    monthlyResidualRunRate:
      (activeMaintenanceRevenue._sum.grossRevenue ?? 0) * PARTNER_COMMISSION.residualRate,
    monthlyResidual: residualThisMonth._sum.amount ?? 0,
    commissions,
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

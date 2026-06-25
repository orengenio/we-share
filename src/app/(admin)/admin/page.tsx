import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { getSessionFromCookies } from "@/lib/auth";
import db from "@/lib/db";
import StatsCard from "@/components/dashboard/stats-card";
import EarningsChart from "@/components/dashboard/earnings-chart";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign, TrendingUp, Wallet, Users, ShieldAlert,
  Scale, Building2, CreditCard, ArrowRight,
} from "lucide-react";
import { RANK_LABELS } from "@/lib/utils";

// ─── Rank bar colours ──────────────────────────────────────────────────────────

const RANK_BAR: Record<string, string> = {
  CATALYST: "bg-gray-400",
  BUILDER: "bg-blue-500",
  ARCHITECT: "bg-purple-500",
  SOVEREIGN: "bg-yellow-500",
};

// ─── Data fetcher ──────────────────────────────────────────────────────────────

async function getAdminStats() {
  const now = new Date();
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [
    affiliateStats,
    partnerStats,
    revenueAgg,
    commPaidAgg,
    pendingCommAgg,
    openFraudFlags,
    openDisputes,
    rankDist,
    monthlyRevRaw,
  ] = await Promise.all([
    db.affiliateProfile.aggregate({
      _count: { id: true },
      where: {},
    }),
    db.partnerProfile.aggregate({
      _count: { id: true },
      where: {},
    }),
    db.conversion.aggregate({ _sum: { grossRevenue: true } }),
    db.commission.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    db.commission.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
    }),
    db.fraudFlag.count({ where: { resolution: null } }),
    db.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    db.affiliateProfile.groupBy({
      by: ["rank"],
      _count: { id: true },
    }),
    db.conversion.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: twelveMonthsAgo } },
      _sum: { grossRevenue: true },
    }),
    // active affiliates
    db.affiliateProfile.count({ where: { isActive: true } }),
    // active partners
    db.partnerProfile.count({ where: { isActive: true } }),
  ]);

  const activeAffiliates = await db.affiliateProfile.count({ where: { isActive: true } });
  const activePartners = await db.partnerProfile.count({ where: { isActive: true } });

  // Build 12-month chart
  const months: { month: string; commissions: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({ month: key, commissions: 0 });
  }
  for (const row of monthlyRevRaw) {
    const d = new Date(row.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const entry = months.find((m) => m.month === key);
    if (entry) entry.commissions += row._sum.grossRevenue ?? 0;
  }

  const rankDistMap: Record<string, number> = {};
  for (const row of rankDist) {
    rankDistMap[row.rank] = row._count.id;
  }

  return {
    totalAffiliates: affiliateStats._count.id,
    activeAffiliates,
    totalPartners: partnerStats._count.id,
    activePartners,
    totalRevenue: revenueAgg._sum.grossRevenue ?? 0,
    commissionsPaid: commPaidAgg._sum.amount ?? 0,
    pendingPayouts: pendingCommAgg._sum.amount ?? 0,
    openFraudFlags,
    openDisputes,
    rankDist: rankDistMap,
    chartData: months,
  };
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function AdminSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-gray-200" />)}
      </div>
      <div className="h-72 rounded-xl bg-gray-200" />
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default async function AdminOverviewPage() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const stats = await getAdminStats();
  const maxRank = Math.max(...Object.values(stats.rankDist), 1);

  return (
    <Suspense fallback={<AdminSkeleton />}>
      <div className="space-y-6">
        {/* Alert badges */}
        {(stats.openFraudFlags > 0 || stats.openDisputes > 0) && (
          <div className="flex gap-3 flex-wrap">
            {stats.openFraudFlags > 0 && (
              <Link
                href="/admin/fraud"
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
              >
                <ShieldAlert size={15} />
                {stats.openFraudFlags} Open Fraud Flag{stats.openFraudFlags !== 1 ? "s" : ""}
              </Link>
            )}
            {stats.openDisputes > 0 && (
              <Link
                href="/admin/disputes"
                className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2.5 text-sm font-semibold text-yellow-700 hover:bg-yellow-100 transition-colors"
              >
                <Scale size={15} />
                {stats.openDisputes} Open Dispute{stats.openDisputes !== 1 ? "s" : ""}
              </Link>
            )}
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            subtitle="Gross platform revenue"
            icon={<DollarSign size={16} />}
            highlight
          />
          <StatsCard
            title="Commissions Paid"
            value={formatCurrency(stats.commissionsPaid)}
            subtitle="All-time paid out"
            icon={<TrendingUp size={16} />}
          />
          <StatsCard
            title="Pending Payouts"
            value={formatCurrency(stats.pendingPayouts)}
            subtitle="Queued for next batch"
            icon={<Wallet size={16} />}
          />
          <StatsCard
            title="Active Affiliates"
            value={stats.activeAffiliates.toLocaleString()}
            subtitle={`of ${stats.totalAffiliates} total`}
            icon={<Users size={16} />}
          />
          <StatsCard
            title={`Open Fraud Flags`}
            value={stats.openFraudFlags.toLocaleString()}
            subtitle="Unresolved flags"
            icon={<ShieldAlert size={16} />}
            highlight={stats.openFraudFlags > 0}
          />
          <StatsCard
            title="Open Disputes"
            value={stats.openDisputes.toLocaleString()}
            subtitle="Under review"
            icon={<Scale size={16} />}
          />
        </div>

        {/* Chart + rank distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EarningsChart data={stats.chartData} />
          </div>

          {/* Rank distribution */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Rank Distribution</h2>
            <div className="space-y-3">
              {(["CATALYST", "BUILDER", "ARCHITECT", "SOVEREIGN"] as const).map((rank) => {
                const count = stats.rankDist[rank] ?? 0;
                const pct = maxRank > 0 ? (count / maxRank) * 100 : 0;
                return (
                  <div key={rank}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gray-600 font-medium">
                        {RANK_LABELS[rank] ?? rank}
                      </span>
                      <span className="font-bold" style={{ color: "#003366" }}>
                        {count.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${RANK_BAR[rank] ?? "bg-gray-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                href="/admin/affiliates"
                className="flex items-center gap-1 text-xs font-medium hover:underline"
                style={{ color: "#CC5500" }}
              >
                View all affiliates <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: "/admin/affiliates", label: "Manage Affiliates", icon: <Users size={18} /> },
            { href: "/admin/partners", label: "Manage Partners", icon: <Building2 size={18} /> },
            { href: "/admin/payouts", label: "Run Payouts", icon: <CreditCard size={18} /> },
            { href: "/admin/fraud", label: "Fraud Review", icon: <ShieldAlert size={18} /> },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg"
                style={{ backgroundColor: "rgba(0,51,102,0.08)", color: "#003366" }}
              >
                {item.icon}
              </div>
              <span className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">
                {item.label}
              </span>
              <ArrowRight size={14} className="ml-auto text-gray-400 group-hover:text-gray-600 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </Suspense>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { getSessionFromCookies } from "@/lib/auth";
import db from "@/lib/db";
import StatsCard from "@/components/dashboard/stats-card";
import EarningsChart from "@/components/dashboard/earnings-chart";
import {
  RANK_COLORS,
  RANK_LABELS,
  STATUS_COLORS,
  formatCurrency,
  formatDate,
} from "@/lib/utils";
import {
  MousePointerClick,
  Users,
  TrendingUp,
  Wallet,
  Star,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Zap,
} from "lucide-react";
import { RANK_THRESHOLDS, PRODUCT_PRICING } from "@/types";

// ─── Rank helpers ──────────────────────────────────────────────────────────────

const RANK_ORDER = ["CATALYST", "BUILDER", "ARCHITECT", "SOVEREIGN"] as const;
type Rank = (typeof RANK_ORDER)[number];

function nextRankInfo(
  rank: Rank,
  lifetimeSales: number
): { nextRank: string | null; salesNeeded: number; progress: number } {
  const idx = RANK_ORDER.indexOf(rank);
  if (idx === RANK_ORDER.length - 1)
    return { nextRank: null, salesNeeded: 0, progress: 100 };

  const nextRank = RANK_ORDER[idx + 1];
  const threshold = RANK_THRESHOLDS[nextRank as keyof typeof RANK_THRESHOLDS];
  const prevThreshold =
    idx === 0 ? 0 : RANK_THRESHOLDS[RANK_ORDER[idx] as keyof typeof RANK_THRESHOLDS];

  const salesNeeded = Math.max(0, threshold - lifetimeSales);
  const progress = Math.min(
    100,
    ((lifetimeSales - prevThreshold) / (threshold - prevThreshold)) * 100
  );
  return { nextRank: RANK_LABELS[nextRank] ?? nextRank, salesNeeded, progress };
}

// ─── Data fetcher ─────────────────────────────────────────────────────────────

async function getAffiliateDashboardData(affiliateId: string) {
  const now = new Date();
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [affiliate, recentConversions, monthlyCommissions] = await Promise.all([
    db.affiliateProfile.findUnique({
      where: { id: affiliateId },
      include: { user: true },
    }),
    db.conversion.findMany({
      where: { affiliateId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { lead: true, commissions: true },
    }),
    db.commission.groupBy({
      by: ["createdAt"],
      where: {
        affiliateId,
        createdAt: { gte: twelveMonthsAgo },
        status: { not: "VOID" },
      },
      _sum: { amount: true },
    }),
  ]);

  return { affiliate, recentConversions, monthlyCommissions };
}

// ─── Monthly chart data builder ───────────────────────────────────────────────

function buildMonthlyChartData(
  rawRows: { createdAt: Date; _sum: { amount: number | null } }[]
): { month: string; commissions: number }[] {
  const now = new Date();
  const months: { month: string; commissions: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({ month: key, commissions: 0 });
  }

  for (const row of rawRows) {
    const d = new Date(row.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const entry = months.find((m) => m.month === key);
    if (entry) entry.commissions += row._sum.amount ?? 0;
  }

  return months;
}

// ─── Fast-start check ─────────────────────────────────────────────────────────

// The bonus pays for the FIRST sale within 14 days of JOINING. So the banner
// should show while the affiliate has not yet made a first sale and is still
// inside the 14-day window from their join date. Returns days remaining (0 if
// not eligible) so the UI can count down.
function fastStartDaysRemaining(
  createdAt: Date,
  firstSaleAt: Date | null,
  earned: boolean
): number {
  if (earned || firstSaleAt) return 0;
  const windowEnd = new Date(createdAt);
  windowEnd.setDate(windowEnd.getDate() + PRODUCT_PRICING.fastStartWindowDays);
  const msLeft = windowEnd.getTime() - Date.now();
  return msLeft <= 0 ? 0 : Math.ceil(msLeft / (24 * 60 * 60 * 1000));
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-200" />
        ))}
      </div>
      <div className="h-72 rounded-xl bg-gray-200" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default async function AffiliateDashboardPage() {
  const session = await getSessionFromCookies();
  if (!session || !session.affiliateId) redirect("/login");
  const safeSession = session!;

  const { affiliate, recentConversions, monthlyCommissions } =
    await getAffiliateDashboardData(safeSession.affiliateId!);

  if (!affiliate) redirect("/login");

  const rank = affiliate.rank as Rank;
  const { nextRank, salesNeeded, progress } = nextRankInfo(rank, affiliate.lifetimeSales);
  const conversionRate =
    affiliate.totalLeads > 0
      ? ((affiliate.totalConversions / affiliate.totalLeads) * 100).toFixed(1)
      : "0.0";
  const chartData = buildMonthlyChartData(monthlyCommissions);
  const fastStartDaysLeft = fastStartDaysRemaining(
    affiliate.createdAt,
    affiliate.firstSaleAt,
    affiliate.fastStartBonusEarned
  );
  const showFastStart = fastStartDaysLeft > 0;
  const isBuilderPlus = ["BUILDER", "ARCHITECT", "SOVEREIGN"].includes(rank);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <div className="space-y-6">
        {/* ── Fast-start bonus alert ── */}
        {showFastStart && (
          <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
            <Zap size={18} className="mt-0.5 shrink-0 text-orange-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-orange-800">
                Fast-Start Bonus Window is Open!
              </p>
              <p className="text-xs text-orange-700 mt-0.5">
                Earn a ${PRODUCT_PRICING.fastStartBonus} Fast-Start Bonus by making your first
                sale within {PRODUCT_PRICING.fastStartWindowDays} days of joining —{" "}
                <strong>{fastStartDaysLeft} day{fastStartDaysLeft !== 1 ? "s" : ""} left</strong>.
                Share your link and close your first deal now.
              </p>
            </div>
          </div>
        )}

        {/* ── Stats cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Clicks"
            value={affiliate.totalClicks.toLocaleString()}
            subtitle="All-time tracked clicks"
            icon={<MousePointerClick size={16} />}
          />
          <StatsCard
            title="Total Leads"
            value={affiliate.totalLeads.toLocaleString()}
            subtitle="Locked attributions"
            icon={<Users size={16} />}
          />
          <StatsCard
            title="Conversion Rate"
            value={`${conversionRate}%`}
            subtitle="Leads → sales"
            icon={<TrendingUp size={16} />}
          />
          <StatsCard
            title="Pending Earnings"
            value={formatCurrency(affiliate.pendingBalance)}
            subtitle="Awaiting approval / payout"
            icon={<Wallet size={16} />}
            highlight
          />
        </div>

        {/* ── Rank & progress ── */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Star size={18} style={{ color: "#CC5500" }} />
              <h2 className="text-sm font-semibold text-gray-900">Your Rank</h2>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${RANK_COLORS[rank] ?? "bg-gray-100 text-gray-700"}`}
            >
              {RANK_LABELS[rank] ?? rank}
            </span>
          </div>

          {nextRank ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {affiliate.lifetimeSales} sale{affiliate.lifetimeSales !== 1 ? "s" : ""}{" "}
                  completed
                </span>
                <span>
                  {salesNeeded} more to <strong>{nextRank}</strong>
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: "#CC5500",
                  }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              You&apos;ve reached <strong>Sovereign</strong> — the highest rank. Congratulations!
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
            <span>Lifetime sales: {affiliate.lifetimeSales}</span>
            <span>Total earned: {formatCurrency(affiliate.totalEarned)}</span>
          </div>
        </div>

        {/* ── Army link (Builder+) ── */}
        {isBuilderPlus && (
          <Link
            href="/affiliate/army"
            className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 group hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users size={18} className="text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Army Builder</p>
                <p className="text-xs text-blue-600">
                  View your downline and override earnings
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-blue-400 group-hover:text-blue-600 transition-colors" />
          </Link>
        )}

        {/* ── Earnings chart ── */}
        <EarningsChart data={chartData} />

        {/* ── Your affiliate link ── */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Your Referral Link</h2>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-700 truncate select-all">
              {appUrl}/r/{affiliate.affiliateCode}
            </code>
            <Link
              href="/affiliate/links"
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white transition-colors"
              style={{ backgroundColor: "#00254B" }}
            >
              Manage Links
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* ── Recent conversions ── */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Conversions</h2>
            <Link
              href="/affiliate/earnings"
              className="text-xs font-medium hover:underline"
              style={{ color: "#CC5500" }}
            >
              View all
            </Link>
          </div>

          {recentConversions.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <TrendingUp size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">No conversions yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Share your referral link to start earning commissions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Lead
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Type
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Commission
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentConversions.map((conv) => {
                    const totalComm = conv.commissions.reduce((s, c) => s + c.amount, 0);
                    const firstComm = conv.commissions[0];
                    return (
                      <tr key={conv.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-medium text-gray-900">
                          {conv.lead.firstName} {conv.lead.lastName}
                        </td>
                        <td className="px-5 py-3 text-gray-500 capitalize">
                          {conv.type.replace(/_/g, " ").toLowerCase()}
                        </td>
                        <td className="px-5 py-3 text-gray-500">
                          {formatDate(conv.createdAt)}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold" style={{ color: "#00254B" }}>
                          {formatCurrency(totalComm)}
                        </td>
                        <td className="px-5 py-3">
                          {firstComm && (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[firstComm.status] ?? "bg-gray-100 text-gray-600"}`}
                            >
                              {firstComm.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Suspended warning ── */}
        {!affiliate.isActive && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-800">Account Suspended</p>
              <p className="text-xs text-red-700 mt-0.5">
                {affiliate.suspendedReason ?? "Contact support for more information."}
              </p>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
}

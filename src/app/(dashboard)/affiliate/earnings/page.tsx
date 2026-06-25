import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSessionFromCookies } from "@/lib/auth";
import db from "@/lib/db";
import StatsCard from "@/components/dashboard/stats-card";
import EarningsChart from "@/components/dashboard/earnings-chart";
import {
  STATUS_COLORS,
  formatCurrency,
  formatDate,
} from "@/lib/utils";
import { DollarSign, Wallet, Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { CommissionStatus } from "@/types";

// ─── Page props ────────────────────────────────────────────────────────────────

interface EarningsPageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

const PAGE_SIZE = 20;

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "PAID", label: "Paid" },
  { value: "CLAWBACK", label: "Clawback" },
  { value: "VOID", label: "Void" },
];

// ─── Data fetcher ──────────────────────────────────────────────────────────────

async function getEarningsData(
  affiliateId: string,
  page: number,
  statusFilter?: CommissionStatus
) {
  const now = new Date();
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const where = {
    affiliateId,
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const [commissions, total, summaryRaw, thisMonthRaw, monthlyRaw] = await Promise.all([
    db.commission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        conversion: { include: { lead: true } },
      },
    }),
    db.commission.count({ where }),
    // Summary aggregates — no status filter for totals
    db.commission.groupBy({
      by: ["status"],
      where: { affiliateId },
      _sum: { amount: true },
    }),
    // This month
    db.commission.aggregate({
      where: { affiliateId, createdAt: { gte: startOfMonth }, status: { not: "VOID" } },
      _sum: { amount: true },
    }),
    // Chart
    db.commission.groupBy({
      by: ["createdAt"],
      where: { affiliateId, createdAt: { gte: twelveMonthsAgo }, status: { not: "VOID" } },
      _sum: { amount: true },
    }),
  ]);

  const summaryMap: Record<string, number> = {};
  for (const row of summaryRaw) {
    summaryMap[row.status] = row._sum.amount ?? 0;
  }

  const totalEarned = Object.entries(summaryMap)
    .filter(([s]) => s !== "VOID" && s !== "CLAWBACK")
    .reduce((acc, [, v]) => acc + v, 0);
  const totalPaid = summaryMap["PAID"] ?? 0;
  const pending = summaryMap["PENDING"] ?? 0;
  const thisMonth = thisMonthRaw._sum.amount ?? 0;

  return {
    commissions,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    summary: { totalEarned, totalPaid, pending, thisMonth },
    monthlyRaw,
  };
}

// ─── Chart builder ─────────────────────────────────────────────────────────────

function buildChartData(
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

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function EarningsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-200" />
        ))}
      </div>
      <div className="h-72 rounded-xl bg-gray-200" />
      <div className="h-64 rounded-xl bg-gray-200" />
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default async function AffiliateEarningsPage({ searchParams }: EarningsPageProps) {
  const session = await getSessionFromCookies();
  if (!session || !session.affiliateId) redirect("/login");
  const safeSession = session!;

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const statusFilter = (params.status as CommissionStatus) || undefined;

  const { commissions, total, totalPages, summary, monthlyRaw } = await getEarningsData(
    safeSession.affiliateId!,
    page,
    statusFilter
  );
  const chartData = buildChartData(monthlyRaw);

  function buildHref(p: number, s?: string) {
    const qs = new URLSearchParams();
    if (p > 1) qs.set("page", String(p));
    if (s) qs.set("status", s);
    return `/affiliate/earnings${qs.toString() ? `?${qs}` : ""}`;
  }

  return (
    <Suspense fallback={<EarningsSkeleton />}>
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Earned"
            value={formatCurrency(summary.totalEarned)}
            subtitle="All approved + paid"
            icon={<DollarSign size={16} />}
          />
          <StatsCard
            title="Total Paid"
            value={formatCurrency(summary.totalPaid)}
            subtitle="Paid to bank / Stripe"
            icon={<Wallet size={16} />}
          />
          <StatsCard
            title="Pending"
            value={formatCurrency(summary.pending)}
            subtitle="Awaiting approval"
            icon={<Clock size={16} />}
            highlight
          />
          <StatsCard
            title="This Month"
            value={formatCurrency(summary.thisMonth)}
            subtitle="Commissions earned MTD"
            icon={<Calendar size={16} />}
          />
        </div>

        {/* Chart */}
        <EarningsChart data={chartData} />

        {/* Filters + table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Filter bar */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-sm font-semibold text-gray-900">
              Commission History{" "}
              <span className="text-gray-400 font-normal">({total.toLocaleString()})</span>
            </h2>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 sr-only">Filter by status</label>
              <div className="flex gap-1 flex-wrap">
                {STATUS_OPTIONS.map((opt) => (
                  <Link
                    key={opt.value}
                    href={buildHref(1, opt.value || undefined)}
                    className={[
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      (statusFilter ?? "") === opt.value
                        ? "text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                    ].join(" ")}
                    style={
                      (statusFilter ?? "") === opt.value
                        ? { backgroundColor: "#003366" }
                        : undefined
                    }
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {commissions.length === 0 ? (
            <div className="py-16 text-center">
              <DollarSign size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">No commissions found</p>
              <p className="text-xs text-gray-400 mt-1">
                {statusFilter
                  ? `No ${statusFilter.toLowerCase()} commissions yet.`
                  : "You haven't earned any commissions yet. Start sharing your links!"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      {["Date", "Type", "Sale Reference", "Rate", "Amount", "Status"].map(
                        (h) => (
                          <th
                            key={h}
                            className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === "Amount" ? "text-right" : "text-left"}`}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {commissions.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {formatDate(c.createdAt)}
                        </td>
                        <td className="px-5 py-3 text-gray-700 text-xs whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                            {c.type.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          <div>
                            <p className="font-medium text-gray-900">
                              {c.conversion.lead.firstName} {c.conversion.lead.lastName}
                            </p>
                            <p className="text-gray-400">{c.conversion.lead.email}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {c.commissionRate !== null
                            ? `${(c.commissionRate * 100).toFixed(1)}%`
                            : "—"}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold whitespace-nowrap" style={{ color: "#003366" }}>
                          {c.amount < 0 ? (
                            <span className="text-red-600">{formatCurrency(c.amount)}</span>
                          ) : (
                            formatCurrency(c.amount)
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Page {page} of {totalPages} ({total} records)
                  </p>
                  <div className="flex items-center gap-1">
                    {page > 1 && (
                      <Link
                        href={buildHref(page - 1, statusFilter)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <ChevronLeft size={12} /> Prev
                      </Link>
                    )}
                    {page < totalPages && (
                      <Link
                        href={buildHref(page + 1, statusFilter)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        Next <ChevronRight size={12} />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Suspense>
  );
}

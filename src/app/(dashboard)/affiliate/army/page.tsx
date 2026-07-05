import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSessionFromCookies } from "@/lib/auth";
import db from "@/lib/db";
import StatsCard from "@/components/dashboard/stats-card";
import {
  RANK_COLORS,
  RANK_LABELS,
  formatCurrency,
  formatDate,
} from "@/lib/utils";
import { Users, Copy, DollarSign, TrendingUp, Star, Lock } from "lucide-react";

// ─── Data fetcher ──────────────────────────────────────────────────────────────

async function getArmyData(affiliateId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [affiliate, downlines, overrideStats] = await Promise.all([
    db.affiliateProfile.findUnique({
      where: { id: affiliateId },
      include: { user: true },
    }),
    db.affiliateProfile.findMany({
      where: { uplineId: affiliateId, isActive: true },
      include: {
        user: true,
        conversions: {
          where: { createdAt: { gte: startOfMonth } },
          select: { id: true },
        },
      },
      orderBy: { totalEarned: "desc" },
    }),
    db.override.groupBy({
      by: ["status"],
      where: { earnerId: affiliateId },
      _sum: { amount: true },
    }),
  ]);

  const overrideMap: Record<string, number> = {};
  for (const row of overrideStats) {
    overrideMap[row.status] = row._sum.amount ?? 0;
  }

  const totalOverrideEarned = Object.entries(overrideMap)
    .filter(([s]) => s !== "VOID")
    .reduce((acc, [, v]) => acc + v, 0);
  const pendingOverrides = overrideMap["PENDING"] ?? 0;
  const paidOverrides = overrideMap["PAID"] ?? 0;

  // Per-downline override earnings
  const downlineOverrides = await Promise.all(
    downlines.map(async (dl) => {
      const overrides = await db.override.aggregate({
        where: { earnerId: affiliateId, sourceId: dl.id },
        _sum: { amount: true },
      });
      return { affiliateId: dl.id, totalOverrides: overrides._sum.amount ?? 0 };
    })
  );

  const overrideByDownline: Record<string, number> = {};
  for (const o of downlineOverrides) {
    overrideByDownline[o.affiliateId] = o.totalOverrides;
  }

  return {
    affiliate,
    downlines,
    overrideByDownline,
    totalOverrideEarned,
    pendingOverrides,
    paidOverrides,
  };
}

// ─── Copy code widget (client island) ─────────────────────────────────────────

// We can't use "use client" here so we use a simple form trick for copy

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function ArmySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-200" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-gray-200" />
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default async function ArmyBuilderPage() {
  const session = await getSessionFromCookies();
  if (!session || !session.affiliateId) redirect("/login");
  const safeSession = session!;

  const {
    affiliate,
    downlines,
    overrideByDownline,
    totalOverrideEarned,
    pendingOverrides,
    paidOverrides,
  } = await getArmyData(safeSession.affiliateId!);

  if (!affiliate) redirect("/login");

  // Access control: Builder+ only
  const isBuilderPlus = ["BUILDER", "ARCHITECT", "SOVEREIGN"].includes(affiliate.rank);
  if (!isBuilderPlus) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div
          className="flex items-center justify-center w-16 h-16 rounded-full mb-4"
          style={{ backgroundColor: "rgba(0,51,102,0.08)" }}
        >
          <Lock size={28} style={{ color: "#00254B" }} />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Army Builder is Locked</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          Army Builder overrides unlock at the <strong>Builder</strong> rank (3 sales). You&apos;re
          currently a{" "}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${RANK_COLORS[affiliate.rank]}`}
          >
            {RANK_LABELS[affiliate.rank] ?? affiliate.rank}
          </span>
          {" "}with <strong>{affiliate.lifetimeSales}</strong> lifetime sale
          {affiliate.lifetimeSales !== 1 ? "s" : ""}.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Make {Math.max(0, 3 - affiliate.lifetimeSales)} more sale
          {3 - affiliate.lifetimeSales !== 1 ? "s" : ""} to unlock overrides.
        </p>
      </div>
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const referralUrl = `${appUrl}/r/${affiliate.affiliateCode}`;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return (
    <Suspense fallback={<ArmySkeleton />}>
      <div className="space-y-6">
        {/* Override earnings summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Override Earnings"
            value={formatCurrency(totalOverrideEarned)}
            subtitle="Total from downline"
            icon={<DollarSign size={16} />}
          />
          <StatsCard
            title="Pending Overrides"
            value={formatCurrency(pendingOverrides)}
            subtitle="Awaiting approval"
            icon={<TrendingUp size={16} />}
            highlight
          />
          <StatsCard
            title="Army Size"
            value={downlines.length}
            subtitle="Active downline referral partners"
            icon={<Users size={16} />}
          />
        </div>

        {/* Rank info banner */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Star size={18} style={{ color: "#CC5500" }} />
            <h2 className="text-sm font-semibold text-gray-900">Your Override Rights</h2>
            <span
              className={`ml-auto inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${RANK_COLORS[affiliate.rank]}`}
            >
              {RANK_LABELS[affiliate.rank] ?? affiliate.rank}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              {
                label: "Setup Override",
                value: affiliate.rank === "SOVEREIGN" ? "5%" : affiliate.rank === "ARCHITECT" ? "5%" : "5%",
              },
              {
                label: "Residual Override",
                value: affiliate.rank === "SOVEREIGN" ? "2.5%/mo" : "—",
              },
              {
                label: "Override Duration",
                value:
                  affiliate.rank === "SOVEREIGN"
                    ? "Forever"
                    : affiliate.rank === "ARCHITECT"
                    ? "24 months"
                    : "12 months",
              },
              {
                label: "Override Paid So Far",
                value: formatCurrency(paidOverrides),
              },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-gray-50 px-3 py-3">
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className="text-sm font-bold" style={{ color: "#00254B" }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Referral link card */}
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
          <div className="flex items-start gap-3">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 mt-0.5"
              style={{ backgroundColor: "rgba(204,85,0,0.15)" }}
            >
              <Copy size={16} style={{ color: "#CC5500" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-orange-900 mb-1">
                Share Your Referral Link
              </p>
              <p className="text-xs text-orange-700 mb-3">
                When someone joins WeShare using your link, they become part of your army and you
                earn override commissions on their sales.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-white border border-orange-200 px-3 py-2 text-xs text-gray-700 truncate select-all font-mono">
                  {referralUrl}
                </code>
              </div>
              <p className="text-xs text-orange-600 mt-2">
                Your referral code: <strong>{affiliate.affiliateCode}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Downline table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              Downline Referral Partners{" "}
              <span className="text-gray-400 font-normal">({downlines.length})</span>
            </h2>
          </div>

          {downlines.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">No downline yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Share your referral link with other people interested in becoming WeShare
                Referral Partners to build your army and earn override commissions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {[
                      "Name",
                      "Rank",
                      "Lifetime Sales",
                      "Sales This Month",
                      "Joined",
                      "Overrides Earned",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === "Overrides Earned" ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {downlines.map((dl) => {
                    // dl.conversions is already filtered to this month by the query.
                    const salesThisMonth = dl.conversions.length;
                    return (
                      <tr key={dl.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{dl.user.name ?? "—"}</p>
                            <p className="text-xs text-gray-400">{dl.user.email}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${RANK_COLORS[dl.rank]}`}
                          >
                            {RANK_LABELS[dl.rank] ?? dl.rank}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-semibold text-gray-900">
                          {dl.lifetimeSales}
                        </td>
                        <td className="px-5 py-3 text-gray-700">
                          {dl.conversions.length}
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {formatDate(dl.createdAt)}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold" style={{ color: "#CC5500" }}>
                          {formatCurrency(overrideByDownline[dl.id] ?? 0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
}

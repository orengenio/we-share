import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { getSessionFromCookies } from "@/lib/auth";
import db from "@/lib/db";
import {
  RANK_COLORS,
  RANK_LABELS,
  formatCurrency,
  formatDate,
} from "@/lib/utils";
import { Users, Search, ChevronLeft, ChevronRight, ShieldOff } from "lucide-react";

// ─── Page props ────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    rank?: string;
    status?: string;
  }>;
}

const PAGE_SIZE = 20;
const RANKS = ["CATALYST", "BUILDER", "ARCHITECT", "SOVEREIGN"] as const;

// ─── Data fetcher ──────────────────────────────────────────────────────────────

async function getAffiliates(page: number, q?: string, rank?: string, status?: string) {
  const where: Parameters<typeof db.affiliateProfile.findMany>[0]["where"] = {};

  if (q) {
    where.user = {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    };
  }
  if (rank && RANKS.includes(rank as (typeof RANKS)[number])) {
    where.rank = rank as (typeof RANKS)[number];
  }
  if (status === "active") where.isActive = true;
  if (status === "suspended") where.isActive = false;

  const [affiliates, total] = await Promise.all([
    db.affiliateProfile.findMany({
      where,
      orderBy: { totalEarned: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: true },
    }),
    db.affiliateProfile.count({ where }),
  ]);

  return { affiliates, total, totalPages: Math.ceil(total / PAGE_SIZE) };
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function AffiliatesSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-12 rounded-xl bg-gray-200 w-full" />
      <div className="h-96 rounded-xl bg-gray-200" />
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default async function AdminAffiliatesPage({ searchParams }: PageProps) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const q = params.q?.trim() || undefined;
  const rank = params.rank || undefined;
  const status = params.status || undefined;

  const { affiliates, total, totalPages } = await getAffiliates(page, q, rank, status);

  function buildHref(overrides: Record<string, string | undefined> = {}) {
    const qs = new URLSearchParams();
    const merged = { page: String(page), q, rank, status, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v && (k !== "page" || v !== "1")) qs.set(k, v);
    }
    return `/admin/affiliates${qs.toString() ? `?${qs}` : ""}`;
  }

  return (
    <Suspense fallback={<AffiliatesSkeleton />}>
      <div className="space-y-5">
        {/* Search + filters */}
        <div className="flex flex-wrap items-center gap-3">
          <form method="get" action="/admin/affiliates" className="flex-1 min-w-56 flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search by name or email…"
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            {q && (
              <Link href={buildHref({ q: undefined, page: "1" })} className="text-xs text-gray-400 hover:text-gray-700 px-2">
                Clear
              </Link>
            )}
          </form>

          {/* Rank filter */}
          <div className="flex gap-1 flex-wrap">
            <Link
              href={buildHref({ rank: undefined, page: "1" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!rank ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              style={!rank ? { backgroundColor: "#00254B" } : undefined}
            >
              All Ranks
            </Link>
            {RANKS.map((r) => (
              <Link
                key={r}
                href={buildHref({ rank: r, page: "1" })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${rank === r ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                style={rank === r ? { backgroundColor: "#00254B" } : undefined}
              >
                {RANK_LABELS[r]}
              </Link>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex gap-1">
            {[
              { value: "", label: "All" },
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
            ].map((s) => (
              <Link
                key={s.value}
                href={buildHref({ status: s.value || undefined, page: "1" })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${(status ?? "") === s.value ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                style={(status ?? "") === s.value ? { backgroundColor: "#CC5500" } : undefined}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Referral Partners{" "}
              <span className="text-gray-400 font-normal">({total.toLocaleString()})</span>
            </h2>
          </div>

          {affiliates.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">No referral partners found</p>
              {(q || rank || status) && (
                <Link href="/admin/affiliates" className="text-xs text-orange-600 hover:underline mt-1 inline-block">
                  Clear all filters
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {["Name / Email", "Code", "Rank", "Lifetime Sales", "Total Earned", "Pending", "Status", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${["Total Earned", "Pending"].includes(h) ? "text-right" : "text-left"}`}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {affiliates.map((aff) => (
                    <tr key={aff.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{aff.user.name ?? "—"}</p>
                          <p className="text-xs text-gray-400">{aff.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono">
                          {aff.affiliateCode}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${RANK_COLORS[aff.rank]}`}>
                          {RANK_LABELS[aff.rank] ?? aff.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {aff.lifetimeSales.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold" style={{ color: "#00254B" }}>
                        {formatCurrency(aff.totalEarned)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-semibold ${aff.pendingBalance > 0 ? "" : "text-gray-400"}`}
                          style={aff.pendingBalance > 0 ? { color: "#CC5500" } : undefined}
                        >
                          {formatCurrency(aff.pendingBalance)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {aff.isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/affiliates/${aff.id}`}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          >
                            View
                          </Link>
                          {aff.isActive ? (
                            <Link
                              href={`/admin/affiliates/${aff.id}/suspend`}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                            >
                              <ShieldOff size={11} /> Suspend
                            </Link>
                          ) : (
                            <Link
                              href={`/admin/affiliates/${aff.id}/reinstate`}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                            >
                              Reinstate
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages} ({total} records)
              </p>
              <div className="flex items-center gap-1">
                {page > 1 && (
                  <Link
                    href={buildHref({ page: String(page - 1) })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <ChevronLeft size={12} /> Prev
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={buildHref({ page: String(page + 1) })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    Next <ChevronRight size={12} />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
}

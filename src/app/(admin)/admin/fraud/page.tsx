import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSessionFromCookies } from "@/lib/auth";
import db from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/utils";
import { ShieldAlert, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import Link from "next/link";
import FraudResolveForm from "./resolve-form";

// ─── Page props ────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ page?: string; resolved?: string }>;
}

const PAGE_SIZE = 20;

// ─── Severity badge ────────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  LOW: "bg-gray-100 text-gray-600",
};

// ─── Data fetcher ──────────────────────────────────────────────────────────────

async function getFraudFlags(page: number, showResolved: boolean) {
  const where = showResolved ? {} : { resolution: null };

  const [flags, total] = await Promise.all([
    db.fraudFlag.findMany({
      where,
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        affiliate: { include: { user: true } },
      },
    }),
    db.fraudFlag.count({ where }),
  ]);

  return { flags, total, totalPages: Math.ceil(total / PAGE_SIZE) };
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function FraudSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-20 rounded-xl bg-gray-200" />
      ))}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default async function AdminFraudPage({ searchParams }: PageProps) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const showResolved = params.resolved === "1";

  const { flags, total, totalPages } = await getFraudFlags(page, showResolved);

  const openCount = await db.fraudFlag.count({ where: { resolution: null } });

  function buildHref(overrides: Record<string, string | undefined> = {}) {
    const qs = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
      page: String(page),
      resolved: showResolved ? "1" : undefined,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) {
      if (v && (k !== "page" || v !== "1")) qs.set(k, v);
    }
    return `/admin/fraud${qs.toString() ? `?${qs}` : ""}`;
  }

  return (
    <Suspense fallback={<FraudSkeleton />}>
      <div className="space-y-5">
        {/* Header + open count */}
        {openCount > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertTriangle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm font-semibold text-red-800">
              {openCount} unresolved fraud flag{openCount !== 1 ? "s" : ""} require review
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2">
          {[
            { label: "Open Flags", value: false },
            { label: "All (incl. Resolved)", value: true },
          ].map((opt) => (
            <Link
              key={String(opt.value)}
              href={buildHref({ resolved: opt.value ? "1" : undefined, page: "1" })}
              className={[
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                showResolved === opt.value
                  ? "text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              ].join(" ")}
              style={showResolved === opt.value ? { backgroundColor: "#003366" } : undefined}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              Fraud Flags{" "}
              <span className="text-gray-400 font-normal">({total.toLocaleString()})</span>
            </h2>
          </div>

          {flags.length === 0 ? (
            <div className="py-16 text-center">
              <ShieldAlert size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">
                {showResolved ? "No fraud flags found" : "No open fraud flags"}
              </p>
              {!showResolved && (
                <p className="text-xs text-gray-400 mt-1">
                  All flags have been resolved.
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {flags.map((flag) => (
                <div key={flag.id} className="px-5 py-4">
                  <div className="flex items-start gap-4 flex-wrap">
                    {/* Severity + info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${SEVERITY_COLORS[flag.severity] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {flag.severity}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                          {flag.type.replace(/_/g, " ")}
                        </span>
                        {flag.resolution && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            RESOLVED: {flag.resolution}
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {flag.affiliate.user.name ?? "Unknown Affiliate"}{" "}
                          <span className="text-gray-400 font-normal text-xs">
                            ({flag.affiliate.user.email})
                          </span>
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">{flag.description}</p>
                        {flag.evidence && typeof flag.evidence === "object" && (
                          <details className="mt-1">
                            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                              View evidence
                            </summary>
                            <pre className="mt-1 text-xs bg-gray-50 rounded p-2 overflow-x-auto text-gray-600 border border-gray-100">
                              {JSON.stringify(flag.evidence, null, 2)}
                            </pre>
                          </details>
                        )}
                        {flag.ipAddress && (
                          <p className="text-xs text-gray-400 mt-1">IP: {flag.ipAddress}</p>
                        )}
                      </div>

                      <p className="text-xs text-gray-400">
                        Flagged {formatDateTime(flag.createdAt)}
                        {flag.reviewedAt && (
                          <> · Reviewed {formatDate(flag.reviewedAt)}</>
                        )}
                        {flag.resolutionNotes && (
                          <> · Note: {flag.resolutionNotes}</>
                        )}
                      </p>
                    </div>

                    {/* Resolve form (only for open flags) */}
                    {!flag.resolution && (
                      <div className="shrink-0 w-full sm:w-72">
                        <FraudResolveForm flagId={flag.id} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
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

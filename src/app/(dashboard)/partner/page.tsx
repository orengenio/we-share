import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSessionFromCookies } from "@/lib/auth";
import db from "@/lib/db";
import StatsCard from "@/components/dashboard/stats-card";
import GettingStarted from "@/components/dashboard/getting-started";
import AgreementBanner from "@/components/dashboard/agreement-banner";
import { STATUS_COLORS, formatCurrency, formatDate } from "@/lib/utils";
import {
  Users, DollarSign, TrendingUp, Wallet, AlertTriangle,
  ShieldCheck, Lock, ClipboardList, ChevronRight, Phone,
} from "lucide-react";
import Link from "next/link";

const PIPELINE_STAGES = [
  { key: "NEW", label: "New", color: "bg-slate-100 text-slate-700", bar: "bg-slate-400" },
  { key: "CONTACTED", label: "Contacted", color: "bg-blue-100 text-blue-700", bar: "bg-blue-500" },
  { key: "APPOINTMENT", label: "Appointment", color: "bg-indigo-100 text-indigo-700", bar: "bg-indigo-500" },
  { key: "PROPOSAL", label: "Proposal", color: "bg-purple-100 text-purple-700", bar: "bg-purple-500" },
  { key: "WON", label: "Won", color: "bg-green-100 text-green-700", bar: "bg-green-500" },
  { key: "LOST", label: "Lost", color: "bg-red-100 text-red-700", bar: "bg-red-400" },
] as const;

async function getPartnerDashboardData(partnerId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [partner, pipelineCounts, recentLeads, slaBreachCount, monthlyResidual] =
    await Promise.all([
      db.partnerProfile.findUnique({
        where: { id: partnerId },
        include: { user: true },
      }),
      db.lead.groupBy({
        by: ["status"],
        where: { partnerId },
        _count: { id: true },
      }),
      db.lead.findMany({
        where: { partnerId },
        orderBy: { assignedAt: "desc" },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          assignedAt: true,
        },
      }),
      db.lead.count({
        where: {
          partnerId,
          slaBreached: true,
          status: { not: "WON" },
          createdAt: { gte: startOfMonth },
        },
      }),
      db.commission.aggregate({
        where: {
          partnerId,
          type: "PARTNER_RESIDUAL",
          createdAt: { gte: startOfMonth },
          status: { not: "VOID" },
        },
        _sum: { amount: true },
      }),
    ]);

  const pipelineMap: Record<string, number> = {};
  for (const row of pipelineCounts) {
    pipelineMap[row.status] = row._count.id;
  }

  return {
    partner,
    pipelineMap,
    recentLeads,
    slaBreachCount,
    monthlyResidual: monthlyResidual._sum.amount ?? 0,
  };
}

function PartnerSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-gray-200" />)}
      </div>
      <div className="h-32 rounded-xl bg-gray-200" />
      <div className="h-64 rounded-xl bg-gray-200" />
    </div>
  );
}

export default async function PartnerDashboardPage() {
  const session = await getSessionFromCookies();
  if (!session || !session.partnerId) redirect("/login");
  const safeSession = session!;

  const { partner, pipelineMap, recentLeads, slaBreachCount, monthlyResidual } =
    await getPartnerDashboardData(safeSession.partnerId!);

  if (!partner) redirect("/login");

  const totalLeads = Object.values(pipelineMap).reduce((s, v) => s + v, 0);
  const maxCount = Math.max(...Object.values(pipelineMap), 1);

  return (
    <Suspense fallback={<PartnerSkeleton />}>
      <div className="space-y-6">
        <GettingStarted />

        {/* Sales Representative Agreement — banner self-hides once the
            CURRENT version is accepted (version-aware via the audit log) */}
        <AgreementBanner />

        {/* Assigned company number */}
        {partner.assignedPhoneNumber && (
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00254B]">
              <Phone size={16} className="text-white" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500">Your company number — use it for every prospect call &amp; text</p>
              <p className="font-mono text-sm font-semibold text-gray-900">{partner.assignedPhoneNumber}</p>
            </div>
          </div>
        )}

        {/* Certification / leads-unlocked banner */}
        {(!partner.isCertified || !partner.leadsUnlocked) && (
          <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-4">
            <Lock size={18} className="mt-0.5 shrink-0 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-900">Action Required</p>
              <ul className="mt-1.5 space-y-1">
                {!partner.isCertified && (
                  <li className="flex items-center gap-2 text-xs text-yellow-800">
                    <span className="w-4 h-4 rounded-full border-2 border-yellow-400 shrink-0 flex items-center justify-center text-yellow-600 font-bold">!</span>
                    Complete your partner certification to begin receiving leads.
                  </li>
                )}
                {partner.isCertified && !partner.leadsUnlocked && (
                  <li className="flex items-center gap-2 text-xs text-yellow-800">
                    <ShieldCheck size={14} className="text-yellow-600" />
                    Certified! Your leads are being unlocked by your account manager.
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* SLA breach warning */}
        {slaBreachCount > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                {slaBreachCount} SLA Breach{slaBreachCount !== 1 ? "es" : ""} This Month
              </p>
              <p className="text-xs text-red-700 mt-0.5">
                Leads require a first touch within 4 hours of assignment. Please contact breached leads immediately.
              </p>
              <Link
                href="/partner/leads?status=NEW"
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-900 mt-2 underline underline-offset-2"
              >
                View new leads <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Leads"
            value={totalLeads.toLocaleString()}
            subtitle="In your pipeline"
            icon={<Users size={16} />}
          />
          <StatsCard
            title="Deals Won"
            value={partner.totalDealsWon.toLocaleString()}
            subtitle="All-time conversions"
            icon={<TrendingUp size={16} />}
          />
          <StatsCard
            title="Monthly Residual"
            value={formatCurrency(monthlyResidual)}
            subtitle="Earned this month"
            icon={<DollarSign size={16} />}
          />
          <StatsCard
            title="Pending Earnings"
            value={formatCurrency(partner.pendingBalance)}
            subtitle="Awaiting payout"
            icon={<Wallet size={16} />}
            highlight
          />
        </div>

        {/* Pipeline visual */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Pipeline Overview</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {PIPELINE_STAGES.map((stage) => {
              const count = pipelineMap[stage.key] ?? 0;
              const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={stage.key} className="flex flex-col items-center gap-2">
                  <div className="w-full space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{stage.label}</span>
                      <span className="text-xs font-bold" style={{ color: "#00254B" }}>{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${stage.bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${stage.color}`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>Total leads: <strong className="text-gray-700">{totalLeads}</strong></span>
            <Link href="/partner/leads" className="flex items-center gap-1 font-medium hover:underline" style={{ color: "#CC5500" }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Recent leads */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Leads</h2>
            <Link href="/partner/leads" className="text-xs font-medium hover:underline" style={{ color: "#CC5500" }}>
              View all
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <div className="py-12 text-center">
              <ClipboardList size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">No leads assigned yet</p>
              <p className="text-xs text-gray-400 mt-1">
                {!partner.leadsUnlocked
                  ? "Complete certification and get your leads unlocked."
                  : "Leads will appear here once assigned."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {["Name", "Email", "Status", "Assigned At"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900">{lead.firstName} {lead.lastName}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{lead.email}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {lead.assignedAt ? formatDate(lead.assignedAt) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Earnings summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Earned", value: formatCurrency(partner.totalEarned) },
            { label: "Total Paid", value: formatCurrency(partner.totalPaid) },
            { label: "Pending Balance", value: formatCurrency(partner.pendingBalance) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm text-center">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className="text-lg font-bold" style={{ color: "#00254B" }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Suspense>
  );
}

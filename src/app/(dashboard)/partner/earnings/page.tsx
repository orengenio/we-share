"use client";

import { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, Wallet, TrendingUp } from "lucide-react";

interface PartnerStats {
  totalEarned: number;
  totalPaid: number;
  pendingBalance: number;
  monthlyResidual: number;
  commissions: Commission[];
}

interface Commission {
  id: string;
  type: string;
  amount: number;
  status: string;
  residualMonth: number | null;
  createdAt: string;
  conversion: {
    grossRevenue: number;
    lead: { firstName: string; lastName: string } | null;
  } | null;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  PAID: "bg-blue-100 text-blue-700",
  VOID: "bg-gray-100 text-gray-500",
};

export default function PartnerEarningsPage() {
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/partners/me/stats")
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-gray-200" />)}
        </div>
        <div className="h-64 rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Earned", value: formatCurrency(stats.totalEarned), icon: <TrendingUp size={18} /> },
          { label: "Total Paid", value: formatCurrency(stats.totalPaid), icon: <DollarSign size={18} /> },
          { label: "Pending Balance", value: formatCurrency(stats.pendingBalance), icon: <Wallet size={18} />, highlight: true },
          { label: "Monthly Residual", value: formatCurrency(stats.monthlyResidual), icon: <DollarSign size={18} /> },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">{stat.label}</span>
              <span style={{ color: stat.highlight ? "#CC5500" : "#00254B" }} className="opacity-70">{stat.icon}</span>
            </div>
            <p
              className="text-xl font-bold"
              style={{ color: stat.highlight ? "#CC5500" : "#00254B" }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Commission history */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Commission History</h2>
        </div>
        {(stats.commissions ?? []).length === 0 ? (
          <div className="py-12 text-center">
            <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No commissions yet</p>
            <p className="text-xs text-gray-400 mt-1">Commissions will appear once deals are converted.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="py-3 px-4 font-medium text-gray-600">Type</th>
                <th className="py-3 px-4 font-medium text-gray-600">Lead</th>
                <th className="py-3 px-4 font-medium text-gray-600 text-right">Amount</th>
                <th className="py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="py-3 px-4 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(stats.commissions ?? []).map(c => (
                <tr key={c.id} className="table-row-hover">
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs text-gray-600">{c.type}</span>
                    {c.residualMonth !== null && (
                      <span className="ml-1 text-xs text-gray-400">mo.{c.residualMonth}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {c.conversion?.lead
                      ? `${c.conversion.lead.firstName} ${c.conversion.lead.lastName}`
                      : "—"}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold" style={{ color: "#00254B" }}>
                    {formatCurrency(c.amount)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}

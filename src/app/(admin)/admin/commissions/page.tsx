"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle, DollarSign } from "lucide-react";

interface Commission {
  id: string;
  type: string;
  amount: number;
  status: string;
  rankAtTime: string | null;
  residualMonth: number | null;
  createdAt: string;
  affiliate: { affiliateCode: string; user: { name: string | null; email: string } } | null;
  partner: { partnerCode: string; user: { name: string | null; email: string } } | null;
  conversion: { type: string; grossAmount: number } | null;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  PAID: "bg-blue-100 text-blue-700",
  VOID: "bg-gray-100 text-gray-500",
  DISPUTED: "bg-red-100 text-red-700",
};

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const PAGE_SIZE = 25;

  const load = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE), status });
    const res = await fetch(`/api/admin/commissions?${params}`);
    const data = await res.json();
    if (data.success) {
      setCommissions(data.data.items);
      setTotal(data.data.total);
    }
    setLoading(false);
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === commissions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(commissions.map(c => c.id)));
    }
  }

  async function approveSelected() {
    if (selected.size === 0) return;
    setApproving(true);
    try {
      const res = await fetch("/api/admin/commissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionIds: Array.from(selected) }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setApproveError(json.error ?? "Approval failed");
        return;
      }
      setSelected(new Set());
      setApproveError(null);
      await load();
    } finally {
      setApproving(false);
    }
  }

  const pendingOnly = status === "PENDING";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
          <p className="text-gray-500 text-sm">{total} total</p>
        </div>
        {pendingOnly && selected.size > 0 && (
          <button
            onClick={approveSelected}
            disabled={approving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: "#00254B" }}
          >
            <CheckCircle size={14} />
            {approving ? "Approving…" : `Approve ${selected.size} selected`}
          </button>
        )}
      </div>

      {approveError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {approveError}
        </div>
      )}

      {/* Status filter */}
      <div className="flex gap-1.5 flex-wrap">
        {["PENDING", "APPROVED", "PAID", "CLAWBACK", "VOID"].map(s => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${status === s ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            style={status === s ? { backgroundColor: "#00254B" } : undefined}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : commissions.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700">No commissions</h3>
            <p className="text-gray-400 text-sm">No {status.toLowerCase()} commissions found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                {pendingOnly && (
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === commissions.length && commissions.length > 0}
                      onChange={toggleAll}
                      className="rounded"
                    />
                  </th>
                )}
                <th className="py-3 px-4 font-medium text-gray-600">Recipient</th>
                <th className="py-3 px-4 font-medium text-gray-600">Type</th>
                <th className="py-3 px-4 font-medium text-gray-600">Rank</th>
                <th className="py-3 px-4 font-medium text-gray-600 text-right">Amount</th>
                <th className="py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="py-3 px-4 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {commissions.map(c => {
                const user = c.affiliate?.user ?? c.partner?.user;
                const code = c.affiliate?.affiliateCode ?? c.partner?.partnerCode;
                return (
                  <tr key={c.id} className="table-row-hover">
                    {pendingOnly && (
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selected.has(c.id)}
                          onChange={() => toggleSelect(c.id)}
                          className="rounded"
                        />
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{user?.name ?? "—"}</p>
                      <p className="text-gray-400 text-xs">{user?.email}</p>
                      {code && <p className="text-gray-400 text-xs font-mono">{code}</p>}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-600">{c.type}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{c.rankAtTime ?? "—"}</td>
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
                );
              })}
            </tbody>
          </table>
        )}

        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-ghost text-sm disabled:opacity-40">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * PAGE_SIZE >= total} className="btn-ghost text-sm disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface Dispute {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  resolution: string | null;
  adminNotes: string | null;
  createdAt: string;
  resolvedAt: string | null;
  commission: {
    amount: number;
    type: string;
    affiliate: { user: { name: string | null; email: string } } | null;
    partner: { user: { name: string | null; email: string } } | null;
  };
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-yellow-100 text-yellow-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-700",
};

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resolveForm, setResolveForm] = useState<{
    id: string; resolution: string; notes: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/disputes");
    const data = await res.json();
    if (data.success) {
      setDisputes(data.data.items);
      setTotal(data.data.total);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function resolve() {
    if (!resolveForm) return;
    setSaving(true);
    await fetch("/api/admin/disputes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        disputeId: resolveForm.id,
        resolution: resolveForm.resolution,
        adminNotes: resolveForm.notes,
      }),
    });
    setResolveForm(null);
    await load();
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>
        <p className="text-gray-500 text-sm">{total} total dispute{total !== 1 ? "s" : ""}</p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : disputes.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700">No disputes</h3>
            <p className="text-gray-400 text-sm">No commission disputes at this time.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="py-3 px-4 font-medium text-gray-600">User</th>
                <th className="py-3 px-4 font-medium text-gray-600">Commission</th>
                <th className="py-3 px-4 font-medium text-gray-600">Reason</th>
                <th className="py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="py-3 px-4 font-medium text-gray-600">Filed</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {disputes.map(d => {
                const user = d.commission.affiliate?.user ?? d.commission.partner?.user;
                return (
                  <>
                    <tr key={d.id} className="table-row-hover">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{user?.name ?? "—"}</p>
                        <p className="text-gray-400 text-xs">{user?.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold" style={{ color: "#00254B" }}>
                          {formatCurrency(d.commission.amount)}
                        </p>
                        <p className="text-gray-400 text-xs font-mono">{d.commission.type}</p>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-gray-800 font-medium text-xs">{d.reason}</p>
                        {d.details && (
                          <p className="text-gray-500 text-xs truncate">{d.details}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${STATUS_COLORS[d.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {d.status.replace("_", " ")}
                        </span>
                        {d.resolution && (
                          <p className="text-xs text-gray-500 mt-0.5">{d.resolution}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(d.createdAt)}</td>
                      <td className="py-3 px-4">
                        {d.status !== "RESOLVED" && d.status !== "REJECTED" && (
                          <button
                            onClick={() => setResolveForm({ id: d.id, resolution: "APPROVED", notes: "" })}
                            className="text-xs text-[#00254B] font-medium hover:underline"
                          >
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                    {resolveForm?.id === d.id && (
                      <tr className="bg-blue-50">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="flex items-end gap-3 flex-wrap">
                            <div>
                              <label className="form-label text-xs">Resolution</label>
                              <select
                                className="form-input text-sm"
                                value={resolveForm.resolution}
                                onChange={e => setResolveForm({ ...resolveForm, resolution: e.target.value })}
                              >
                                <option value="APPROVED">Approved — pay commission</option>
                                <option value="PARTIAL">Partial — adjust amount</option>
                                <option value="REJECTED">Rejected — no action</option>
                              </select>
                            </div>
                            <div className="flex-1 min-w-48">
                              <label className="form-label text-xs">Admin Notes</label>
                              <input
                                className="form-input text-sm"
                                placeholder="Resolution notes…"
                                value={resolveForm.notes}
                                onChange={e => setResolveForm({ ...resolveForm, notes: e.target.value })}
                              />
                            </div>
                            <button
                              onClick={resolve}
                              disabled={saving}
                              className="btn-primary text-sm"
                            >
                              {saving ? "Saving…" : "Save"}
                            </button>
                            <button onClick={() => setResolveForm(null)} className="btn-ghost text-sm">
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

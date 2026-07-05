"use client";

import { Fragment, useState, useEffect, useCallback } from "react";
import { formatDate } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface Dispute {
  id: string;
  subject: string;
  description: string;
  status: string;
  resolution: string | null;
  statementDate: string;
  commissionId: string | null;
  createdAt: string;
  affiliate: { user: { name: string | null; email: string } } | null;
  partner: { user: { name: string | null; email: string } } | null;
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
    id: string; status: string; resolution: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/disputes");
    const data = await res.json().catch(() => ({}));
    if (data.success) {
      setDisputes(data.data.items ?? []);
      setTotal(data.data.total ?? 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function resolve() {
    if (!resolveForm) return;
    setError(null);
    if (resolveForm.resolution.trim().length < 10) {
      setError("Resolution notes must be at least 10 characters.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/disputes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disputeId: resolveForm.id,
          status: resolveForm.status,
          resolution: resolveForm.resolution,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to resolve dispute");
        return;
      }
      setResolveForm(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>
        <p className="text-gray-500 text-sm">{total} total dispute{total !== 1 ? "s" : ""}</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

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
                <th className="py-3 px-4 font-medium text-gray-600">Subject</th>
                <th className="py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="py-3 px-4 font-medium text-gray-600">Statement</th>
                <th className="py-3 px-4 font-medium text-gray-600">Filed</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {disputes.map(d => {
                const user = d.affiliate?.user ?? d.partner?.user;
                return (
                  <Fragment key={d.id}>
                    <tr className="table-row-hover">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{user?.name ?? "—"}</p>
                        <p className="text-gray-400 text-xs">{user?.email}</p>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-gray-800 font-medium text-xs">{d.subject}</p>
                        <p className="text-gray-500 text-xs truncate">{d.description}</p>
                        {d.commissionId && (
                          <p className="text-gray-400 text-[10px] font-mono mt-0.5">#{d.commissionId}</p>
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
                      <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(d.statementDate)}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(d.createdAt)}</td>
                      <td className="py-3 px-4">
                        {d.status !== "RESOLVED" && d.status !== "REJECTED" && (
                          <button
                            onClick={() => setResolveForm({ id: d.id, status: "RESOLVED", resolution: "" })}
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
                              <label className="form-label text-xs">Decision</label>
                              <select
                                className="form-input text-sm"
                                value={resolveForm.status}
                                onChange={e => setResolveForm({ ...resolveForm, status: e.target.value })}
                              >
                                <option value="RESOLVED">Resolved — in member&apos;s favor</option>
                                <option value="REJECTED">Rejected — no change</option>
                              </select>
                            </div>
                            <div className="flex-1 min-w-48">
                              <label className="form-label text-xs">Resolution notes (min 10 chars)</label>
                              <input
                                className="form-input text-sm"
                                placeholder="Explain the ruling…"
                                value={resolveForm.resolution}
                                onChange={e => setResolveForm({ ...resolveForm, resolution: e.target.value })}
                              />
                            </div>
                            <button onClick={resolve} disabled={saving} className="btn-primary text-sm">
                              {saving ? "Saving…" : "Save"}
                            </button>
                            <button onClick={() => { setResolveForm(null); setError(null); }} className="btn-ghost text-sm">
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

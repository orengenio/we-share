"use client";

import { useState, useEffect } from "react";
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
  commission: { amount: number; type: string };
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-yellow-100 text-yellow-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-700",
};

export default function AffiliateDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ commissionId: "", reason: "", details: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/user/disputes")
      .then(r => r.json())
      .then(d => { if (d.success) setDisputes(d.data.items); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/user/disputes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to submit dispute");
    } else {
      setShowForm(false);
      setForm({ commissionId: "", reason: "", details: "" });
      load();
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>
          <p className="text-gray-500 text-sm">File and track commission disputes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm"
        >
          + New Dispute
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">File a Dispute</h2>
          <div>
            <label className="form-label">Commission ID</label>
            <input
              required
              className="form-input"
              placeholder="Commission ID from your earnings history"
              value={form.commissionId}
              onChange={e => setForm({ ...form, commissionId: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label">Reason</label>
            <input
              required
              className="form-input"
              placeholder="Brief reason for dispute"
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label">Details <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              className="form-input min-h-[80px]"
              placeholder="Provide any additional context…"
              value={form.details}
              onChange={e => setForm({ ...form, details: e.target.value })}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary text-sm">
              {submitting ? "Submitting…" : "Submit"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : disputes.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700">No disputes</h3>
            <p className="text-gray-400 text-sm">You have no open or resolved disputes.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="py-3 px-4 font-medium text-gray-600">Commission</th>
                <th className="py-3 px-4 font-medium text-gray-600">Reason</th>
                <th className="py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="py-3 px-4 font-medium text-gray-600">Resolution</th>
                <th className="py-3 px-4 font-medium text-gray-600">Filed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {disputes.map(d => (
                <tr key={d.id} className="table-row-hover">
                  <td className="py-3 px-4">
                    <p className="font-semibold" style={{ color: "#003366" }}>{formatCurrency(d.commission.amount)}</p>
                    <p className="text-xs font-mono text-gray-400">{d.commission.type}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{d.reason}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${STATUS_COLORS[d.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {d.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-sm">
                    {d.resolution ?? "—"}
                    {d.adminNotes && <p className="text-xs text-gray-400 mt-0.5">{d.adminNotes}</p>}
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(d.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

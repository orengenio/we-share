"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Loader2, ChevronDown, ChevronRight, Play, Eye,
  CreditCard, Calendar, Users,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PayoutItem {
  id: string;
  affiliateId: string | null;
  partnerId: string | null;
  grossAmount: number;
  adjustments: number;
  netAmount: number;
  status: string;
  stripeTransferId: string | null;
  errorMessage: string | null;
  affiliate?: { user: { name: string | null; email: string } } | null;
  partner?: { user: { name: string | null; email: string } } | null;
}

interface Payout {
  id: string;
  batchLabel: string;
  periodStart: string;
  periodEnd: string;
  scheduledDate: string;
  status: string;
  totalAmount: number;
  recipientCount: number;
  processedAt: string | null;
  notes: string | null;
  errorMessage: string | null;
  createdAt: string;
  items?: PayoutItem[];
}

// ─── Status badge ──────────────────────────────────────────────────────────────

const PAYOUT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${PAYOUT_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
}

// ─── Run payout form ───────────────────────────────────────────────────────────

function RunPayoutForm({ onSuccess }: { onSuccess: () => void }) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: month, notes: notes || undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to create payout batch");
        return;
      }
      setSuccess(`Payout batch created: ${json.data?.batchLabel ?? month}`);
      onSuccess();
    });
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Create Payout Batch</h2>
      <form onSubmit={handleCreate} className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Period (YYYY-MM) <span className="text-red-500">*</span>
          </label>
          <input
            type="month"
            required
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          />
        </div>
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Notes <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Friday payout — July week 1"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-colors"
          style={{ backgroundColor: "#00254B" }}
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />}
          {isPending ? "Creating…" : "Create Batch"}
        </button>
      </form>
      {error && (
        <p className="mt-3 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-3 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          {success}
        </p>
      )}
    </div>
  );
}

// ─── Expanded items row ────────────────────────────────────────────────────────

function ExpandedItems({ payoutId }: { payoutId: string }) {
  const [items, setItems] = useState<PayoutItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/payouts/${payoutId}/items`)
      .then((r) => r.json())
      .then((d) => setItems(d.data?.items ?? []))
      .finally(() => setLoading(false));
  }, [payoutId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 px-6 text-xs text-gray-400">
        <Loader2 size={13} className="animate-spin" /> Loading items…
      </div>
    );
  }
  if (items.length === 0) {
    return <p className="py-4 px-6 text-xs text-gray-400">No payout items found.</p>;
  }

  return (
    <div className="px-4 pb-3">
      <div className="rounded-lg border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Recipient", "Gross", "Adjustments", "Net", "Status", "Transfer ID"].map((h) => (
                <th key={h} className={`px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wide ${["Gross", "Net"].includes(h) ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => {
              const user = item.affiliate?.user ?? item.partner?.user;
              return (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-3 py-2">
                    <p className="font-medium text-gray-800">{user?.name ?? "—"}</p>
                    <p className="text-gray-400">{user?.email}</p>
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-gray-800">
                    {formatCurrency(item.grossAmount)}
                  </td>
                  <td className="px-3 py-2 text-gray-500">
                    {item.adjustments !== 0 ? formatCurrency(item.adjustments) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right font-bold" style={{ color: "#00254B" }}>
                    {formatCurrency(item.netAmount)}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-3 py-2">
                    {item.stripeTransferId ? (
                      <code className="text-xs text-gray-500 font-mono">{item.stripeTransferId.slice(0, 16)}…</code>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                    {item.errorMessage && (
                      <p className="text-red-500 text-xs mt-0.5">{item.errorMessage}</p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payouts");
      const data = await res.json();
      setPayouts(data.data?.payouts ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function runPayout(id: string) {
    setRunningId(id);
    setRunError(null);
    try {
      const res = await fetch("/api/admin/payouts/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId: id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setRunError(json.error ?? "Failed to run payout");
        return;
      }
      await load();
    } finally {
      setRunningId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Create payout form */}
      <RunPayoutForm onSuccess={load} />

      {/* Error banner */}
      {runError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {runError}
        </div>
      )}

      {/* Payouts table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Payout Batches</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-gray-300" />
          </div>
        ) : payouts.length === 0 ? (
          <div className="py-16 text-center">
            <CreditCard size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No payout batches yet</p>
            <p className="text-xs text-gray-400 mt-1">Create your first payout batch using the form above.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {payouts.map((payout) => (
              <div key={payout.id}>
                {/* Main row */}
                <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                  <button
                    onClick={() => setExpandedId(expandedId === payout.id ? null : payout.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                    title={expandedId === payout.id ? "Collapse" : "Expand items"}
                  >
                    {expandedId === payout.id ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{payout.batchLabel}</p>
                      <StatusBadge status={payout.status} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Period: {formatDate(payout.periodStart)} – {formatDate(payout.periodEnd)} •
                      Scheduled: {formatDate(payout.scheduledDate)}
                    </p>
                    {payout.notes && (
                      <p className="text-xs text-gray-500 mt-0.5">{payout.notes}</p>
                    )}
                    {payout.errorMessage && (
                      <p className="text-xs text-red-500 mt-0.5">{payout.errorMessage}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm shrink-0">
                    <div className="text-right">
                      <p className="font-bold" style={{ color: "#00254B" }}>
                        {formatCurrency(payout.totalAmount)}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                        <Users size={10} /> {payout.recipientCount} recipients
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setExpandedId(expandedId === payout.id ? null : payout.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        <Eye size={12} /> View
                      </button>
                      {payout.status === "PENDING" && (
                        <button
                          onClick={() => runPayout(payout.id)}
                          disabled={runningId === payout.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-60 transition-colors"
                          style={{ backgroundColor: "#CC5500" }}
                        >
                          {runningId === payout.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Play size={12} />
                          )}
                          {runningId === payout.id ? "Running…" : "Run"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded items */}
                {expandedId === payout.id && (
                  <div className="border-t border-gray-100 bg-gray-50/30">
                    <ExpandedItems payoutId={payout.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

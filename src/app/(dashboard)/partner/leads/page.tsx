"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { formatDate, STATUS_COLORS } from "@/lib/utils";
import {
  ChevronDown, ChevronUp, AlertTriangle, Loader2,
  ClipboardList, ChevronLeft, ChevronRight, CheckCircle2,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: string;
  touchCount: number;
  lastTouchedAt: string | null;
  firstTouchDeadline: string | null;
  firstTouchAt: string | null;
  slaBreached: boolean;
  assignedAt: string | null;
  notes: string | null;
}

const PAGE_SIZE = 20;

const STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "APPOINTMENT", label: "Appointment" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
  { value: "NURTURE", label: "Nurture" },
];

// ─── SLA indicator ─────────────────────────────────────────────────────────────

function SlaIndicator({ lead }: { lead: Lead }) {
  if (lead.slaBreached) {
    return (
      <span className="flex items-center gap-1 text-red-600 text-xs font-semibold">
        <AlertTriangle size={12} /> Breached
      </span>
    );
  }
  if (lead.firstTouchAt) {
    return (
      <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
        <CheckCircle2 size={12} /> On time
      </span>
    );
  }
  if (lead.firstTouchDeadline) {
    const deadline = new Date(lead.firstTouchDeadline);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffH = diffMs / (1000 * 60 * 60);
    const isUrgent = diffH < 1;
    return (
      <span className={`text-xs font-medium ${isUrgent ? "text-red-500" : "text-yellow-600"}`}>
        Due {formatDate(lead.firstTouchDeadline)}
      </span>
    );
  }
  return <span className="text-gray-400 text-xs">—</span>;
}

// ─── Inline edit form ──────────────────────────────────────────────────────────

interface InlineEditState {
  id: string;
  status: string;
  notes: string;
}

interface InlineEditRowProps {
  lead: Lead;
  onSave: (id: string, status: string, notes: string) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

function InlineEditRow({ lead, onSave, onCancel, saving }: InlineEditRowProps) {
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.notes ?? "");

  return (
    <tr className="bg-blue-50/60 border-b border-blue-100">
      <td colSpan={7} className="px-5 py-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">New Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            >
              {STATUSES.filter((s) => s.value).map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Notes <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note about this interaction…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSave(lead.id, status, notes)}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-colors"
              style={{ backgroundColor: "#CC5500" }}
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function PartnerLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (statusFilter) params.set("status", statusFilter);
    try {
      const res = await fetch(`/api/partners/me/leads?${params}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.data.items ?? []);
        setTotal(data.data.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(id: string, status: string, notes: string) {
    setSavingId(id);
    try {
      const res = await fetch("/api/partners/me/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: id, status, notes }),
      });
      if (res.ok) {
        setEditId(null);
        await load();
      }
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header + filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-gray-500 mt-0.5">
            {total.toLocaleString()} total lead{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Filter:</label>
          <div className="flex gap-1 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => { setStatusFilter(s.value); setPage(1); setEditId(null); }}
                className={[
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  statusFilter === s.value
                    ? "text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                ].join(" ")}
                style={statusFilter === s.value ? { backgroundColor: "#00254B" } : undefined}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-gray-300" />
          </div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center">
            <ClipboardList size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No leads found</p>
            <p className="text-xs text-gray-400 mt-1">
              {statusFilter
                ? `No ${statusFilter.toLowerCase()} leads in your pipeline.`
                : "Your leads will appear here once assigned."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Lead", "Contact", "Status", "Touches", "Last Touch", "4h SLA", ""].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead: Lead) => (
                  <React.Fragment key={lead.id}>
                    <tr
                      className={`transition-colors ${editId === lead.id ? "bg-blue-50/30" : "hover:bg-gray-50/50"}`}
                    >
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {lead.firstName} {lead.lastName}
                          </p>
                          {lead.assignedAt && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Assigned {formatDate(lead.assignedAt)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-gray-600 text-xs">{lead.email}</p>
                        {lead.phone && <p className="text-gray-400 text-xs">{lead.phone}</p>}
                        {lead.company && <p className="text-gray-400 text-xs">{lead.company}</p>}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-gray-700 font-medium">
                        {lead.touchCount}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">
                        {lead.lastTouchedAt ? formatDate(lead.lastTouchedAt) : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <SlaIndicator lead={lead} />
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => setEditId(editId === lead.id ? null : lead.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          Update
                          {editId === lead.id ? (
                            <ChevronUp size={11} />
                          ) : (
                            <ChevronDown size={11} />
                          )}
                        </button>
                      </td>
                    </tr>
                    {editId === lead.id && (
                      <InlineEditRow
                        lead={lead}
                        onSave={handleSave}
                        onCancel={() => setEditId(null)}
                        saving={savingId === lead.id}
                      />
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={12} /> Prev
              </button>
              <span className="px-2 text-xs text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

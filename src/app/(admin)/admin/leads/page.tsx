"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDate } from "@/lib/utils";
import { Search, UserCheck } from "lucide-react";

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
  slaBreached: boolean;
  attributionLocked: boolean;
  assignedAt: string | null;
  createdAt: string;
  affiliate: { affiliateCode: string; user: { name: string | null } } | null;
  partner: { partnerCode: string; user: { name: string | null } } | null;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-slate-100 text-slate-700",
  CONTACTED: "bg-blue-100 text-blue-700",
  APPOINTMENT: "bg-indigo-100 text-indigo-700",
  PROPOSAL: "bg-purple-100 text-purple-700",
  WON: "bg-green-100 text-green-700",
  LOST: "bg-red-100 text-red-700",
  NURTURE: "bg-orange-100 text-orange-700",
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 25;

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (search) params.set("q", search);
    const res = await fetch(`/api/admin/leads?${params}`);
    const data = await res.json();
    if (data.success) {
      setLeads(data.data.items);
      setTotal(data.data.total);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <p className="text-gray-500 text-sm">{total} total leads</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="form-input pl-9"
          placeholder="Search name or email…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700">No leads found</h3>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="py-3 px-4 font-medium text-gray-600">Lead</th>
                <th className="py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="py-3 px-4 font-medium text-gray-600">Affiliate</th>
                <th className="py-3 px-4 font-medium text-gray-600">Partner</th>
                <th className="py-3 px-4 font-medium text-gray-600">SLA</th>
                <th className="py-3 px-4 font-medium text-gray-600">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.map(lead => (
                <tr key={lead.id} className="table-row-hover">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{lead.firstName} {lead.lastName}</p>
                    <p className="text-gray-400 text-xs">{lead.email}</p>
                    {lead.phone && <p className="text-gray-400 text-xs">{lead.phone}</p>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {lead.status}
                    </span>
                    {lead.attributionLocked && (
                      <span className="ml-1 badge bg-indigo-50 text-indigo-600 text-[10px]">Locked</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs">
                    {lead.affiliate ? (
                      <>
                        <p>{lead.affiliate.user.name ?? "—"}</p>
                        <p className="font-mono text-gray-400">{lead.affiliate.affiliateCode}</p>
                      </>
                    ) : "—"}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs">
                    {lead.partner ? (
                      <>
                        <p>{lead.partner.user.name ?? "—"}</p>
                        <p className="font-mono text-gray-400">{lead.partner.partnerCode}</p>
                      </>
                    ) : "—"}
                  </td>
                  <td className="py-3 px-4">
                    {lead.slaBreached ? (
                      <span className="badge bg-red-100 text-red-700">Breached</span>
                    ) : (
                      <span className="text-green-600 text-xs">OK</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(lead.createdAt)}</td>
                </tr>
              ))}
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

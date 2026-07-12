"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, CheckCircle, Crown } from "lucide-react";

interface Partner {
  id: string;
  partnerCode: string;
  assignedPhoneNumber: string | null;
  isCertified: boolean;
  leadsUnlocked: boolean;
  isActive: boolean;
  isLeader: boolean;
  crmSeatGrantedAt: string | null;
  totalLeadsAssigned: number;
  totalDealsWon: number;
  totalEarned: number;
  totalLeaderOverrides: number;
  pendingBalance: number;
  user: { id: string; name: string | null; email: string; createdAt: string };
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (search) params.set("search", search);
    const res = await fetch(`/api/partners?${params}`);
    const data = await res.json();
    if (data.success) { setPartners(data.data.items); setTotal(data.data.total); }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  async function performAction(partnerId: string, action: string, extra?: Record<string, string>) {
    setActionId(partnerId);
    await fetch("/api/admin/partners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerId, action, ...extra }),
    });
    await load();
    setActionId(null);
  }

  async function deleteAccount(p: Partner) {
    if (!window.confirm(`PERMANENTLY DELETE ${p.user.email}?\n\nThe login, profile, and links are removed. Financial ledger rows are kept (owner unlinked) for tax/audit retention. This cannot be undone — suspending is usually the better option.`)) return;
    setActionId(p.id);
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: p.user.id }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      window.alert(json.error ?? "Delete failed");
    }
    await load();
    setActionId(null);
  }

  function assignNumber(p: Partner) {
    const phoneNumber = window.prompt(
      `A2P company number for ${p.user.name ?? p.partnerCode} (e.g. +1 555 012 3456):`,
      p.assignedPhoneNumber ?? ""
    );
    if (!phoneNumber || phoneNumber.trim().length < 7) return;
    performAction(p.id, "assign_number", { phoneNumber: phoneNumber.trim() });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Partners</h1>
        <p className="text-gray-500 text-sm">{total} total partners</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="form-input pl-9"
          placeholder="Search name, email, or code…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="py-3 px-4 font-medium text-gray-600">Partner</th>
                <th className="py-3 px-4 font-medium text-gray-600 text-center">Certified</th>
                <th className="py-3 px-4 font-medium text-gray-600 text-center">Leads Unlocked</th>
                <th className="py-3 px-4 font-medium text-gray-600 text-right">Won</th>
                <th className="py-3 px-4 font-medium text-gray-600 text-right">Earned</th>
                <th className="py-3 px-4 font-medium text-gray-600 text-right">Leader Overrides</th>
                <th className="py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {partners.map(p => (
                <tr key={p.id} className="table-row-hover">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-gray-900">{p.user.name ?? "—"}</p>
                      {p.isLeader && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-700 bg-amber-100">
                          <Crown size={9} /> LEADER
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs">{p.user.email}</p>
                    <p className="text-gray-400 text-xs font-mono">{p.partnerCode}</p>
                    {p.assignedPhoneNumber && (
                      <p className="text-gray-400 text-xs font-mono">☎ {p.assignedPhoneNumber}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.isCertified
                      ? <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                      : <button onClick={() => performAction(p.id, "certify")} disabled={actionId === p.id} className="text-xs text-[#00254B] hover:underline">Certify</button>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.leadsUnlocked
                      ? <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                      : <button onClick={() => performAction(p.id, "unlock_leads")} disabled={actionId === p.id} className="text-xs text-[#00254B] hover:underline">Unlock</button>}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">{p.totalDealsWon}</td>
                  <td className="py-3 px-4 text-right font-semibold">{formatCurrency(p.totalEarned)}</td>
                  <td className="py-3 px-4 text-right">
                    {p.totalLeaderOverrides > 0
                      ? <span className="font-semibold text-amber-700">{formatCurrency(p.totalLeaderOverrides)}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {p.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      {p.isActive ? (
                        <button onClick={() => performAction(p.id, "suspend")} disabled={actionId === p.id} className="text-xs text-red-600 hover:underline text-left">Suspend</button>
                      ) : (
                        <button onClick={() => performAction(p.id, "reinstate")} disabled={actionId === p.id} className="text-xs text-green-600 hover:underline text-left">Reinstate</button>
                      )}
                      {p.isLeader ? (
                        <button onClick={() => performAction(p.id, "demote_leader")} disabled={actionId === p.id} className="text-xs text-amber-600 hover:underline text-left">Demote Leader</button>
                      ) : (
                        <button onClick={() => performAction(p.id, "promote_leader")} disabled={actionId === p.id} className="text-xs text-amber-700 hover:underline text-left font-medium">★ Make Leader</button>
                      )}
                      <button onClick={() => assignNumber(p)} disabled={actionId === p.id} className="text-xs text-[#00254B] hover:underline text-left">
                        {p.assignedPhoneNumber ? "Change #" : "Assign #"}
                      </button>
                      {p.crmSeatGrantedAt ? (
                        <span className="text-xs text-green-700">CRM seat ✓</span>
                      ) : (
                        <button
                          onClick={() => performAction(p.id, "grant_crm_seat")}
                          disabled={actionId === p.id}
                          className="text-xs text-[#00254B] hover:underline text-left"
                        >
                          Grant CRM seat
                        </button>
                      )}
                      <button onClick={() => deleteAccount(p)} disabled={actionId === p.id} className="text-xs text-red-700 hover:underline text-left">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}

        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}</p>
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

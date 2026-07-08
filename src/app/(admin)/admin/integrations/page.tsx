"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Loader2,
  Webhook,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const EVENT_OPTIONS = [
  "click.recorded",
  "lead.attributed",
  "lead.registered",
  "conversion.created",
  "commission.created",
  "commission.approved",
  "commission.clawback",
  "payout.completed",
  "fraud.flagged",
  "partner.registered",
  "affiliate.registered",
] as const;

interface OutboundWebhook {
  id: string;
  name: string;
  url: string;
  secret?: string | null;
  events: string[];
  isActive: boolean;
  description?: string | null;
  _count?: { deliveries: number };
}

interface WebhookDelivery {
  id: string;
  eventType: string;
  url: string;
  status: string;
  attempts: number;
  responseCode: number | null;
  lastError: string | null;
  createdAt: string;
  webhook?: { name: string } | null;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    success: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-800",
  };
  const icons: Record<string, React.ReactNode> = {
    success: <CheckCircle2 size={12} />,
    failed: <XCircle size={12} />,
    pending: <Clock size={12} />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {icons[status]}
      {status}
    </span>
  );
}

export default function AdminIntegrationsPage() {
  const router = useRouter();
  const [hooks, setHooks] = useState<OutboundWebhook[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [description, setDescription] = useState("");
  const [events, setEvents] = useState<string[]>(["conversion.created", "commission.created"]);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [hooksRes, deliveriesRes] = await Promise.all([
        fetch("/api/admin/outbound-webhooks"),
        fetch("/api/admin/webhook-deliveries?pageSize=20"),
      ]);
      if (hooksRes.status === 401 || hooksRes.status === 403) {
        router.push("/login");
        return;
      }
      const hooksJson = await hooksRes.json();
      const deliveriesJson = await deliveriesRes.json();
      setHooks(hooksJson.data ?? []);
      setDeliveries(deliveriesJson.data?.items ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleEvent(event: string) {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/outbound-webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          url,
          secret: secret || undefined,
          description: description || undefined,
          events,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to create webhook");
        return;
      }
      setName("");
      setUrl("");
      setSecret("");
      setDescription("");
      setShowForm(false);
      loadData();
    });
  }

  async function toggleActive(hook: OutboundWebhook) {
    await fetch("/api/admin/outbound-webhooks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: hook.id, isActive: !hook.isActive }),
    });
    loadData();
  }

  async function deleteHook(id: string) {
    if (!confirm("Delete this webhook subscription?")) return;
    await fetch(`/api/admin/outbound-webhooks?id=${id}`, { method: "DELETE" });
    loadData();
  }

  async function matureCommissions() {
    const res = await fetch("/api/admin/commissions/mature", { method: "POST" });
    const json = await res.json();
    if (res.ok) {
      alert(`Approved ${json.data?.approved ?? 0} matured commissions.`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Integrations</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Subscribe n8n, Zapier, or custom endpoints to WeShare events. Payloads are signed with
            HMAC-SHA256 when a secret is set (<code className="text-xs">X-WeShare-Signature</code>).
            Legacy env URLs still work as fallbacks.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => matureCommissions()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50"
          >
            <RefreshCw size={14} />
            Mature commissions
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: "#00254B" }}
          >
            <Plus size={16} />
            Add webhook
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4"
        >
          <h3 className="text-sm font-semibold text-gray-900">New outbound webhook</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="n8n — conversions"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
              <input
                required
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="https://your-n8n.example.com/webhook/..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Signing secret <span className="text-gray-400">(optional)</span>
              </label>
              <input
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Events</p>
            <div className="flex flex-wrap gap-2">
              {EVENT_OPTIONS.map((ev) => (
                <button
                  key={ev}
                  type="button"
                  onClick={() => toggleEvent(ev)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    events.includes(ev)
                      ? "border-orange-300 bg-orange-50 text-orange-800"
                      : "border-gray-200 bg-gray-50 text-gray-600"
                  }`}
                >
                  {ev}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending || events.length === 0}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: "#CC5500" }}
            >
              {isPending ? "Saving…" : "Save webhook"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Webhook size={16} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">Outbound webhooks</h3>
        </div>
        {hooks.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-500 text-center">
            No webhooks configured. Add one to send events to n8n or any HTTP endpoint.
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {hooks.map((hook) => (
              <div key={hook.id} className="px-5 py-4 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900">{hook.name}</p>
                    <StatusBadge status={hook.isActive ? "success" : "pending"} />
                    {hook.isActive ? (
                      <span className="text-xs text-green-700">active</span>
                    ) : (
                      <span className="text-xs text-gray-500">paused</span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-gray-500 truncate mt-1">{hook.url}</p>
                  <p className="text-xs text-gray-400 mt-2 flex flex-wrap gap-1">
                    {hook.events.map((ev) => (
                      <span key={ev} className="bg-gray-100 px-1.5 py-0.5 rounded">
                        {ev}
                      </span>
                    ))}
                  </p>
                  {hook.description && (
                    <p className="text-xs text-gray-500 mt-1">{hook.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(hook)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    {hook.isActive ? "Pause" : "Enable"}
                  </button>
                  <button
                    onClick={() => deleteHook(hook.id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Recent deliveries</h3>
        </div>
        {deliveries.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-500 text-center">No deliveries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Time", "Webhook", "Event", "Status", "HTTP", "Error"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deliveries.map((d) => (
                  <tr key={d.id}>
                    <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {formatDateTime(d.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-xs">{d.webhook?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-xs font-mono">{d.eventType}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-5 py-3 text-xs">{d.responseCode ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-red-600 max-w-xs truncate">
                      {d.lastError ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-900">
        <p className="font-semibold mb-1">External track API</p>
        <p className="text-xs text-blue-800">
          POST <code>/api/v1/track/purchase</code> with header{" "}
          <code>X-WeShare-Api-Key</code> for GHL/n8n checkout attribution. Embed{" "}
          <code>/weshare-attribution.js</code> on orengen.io forms for click-to-lead tracking.
        </p>
      </div>
    </div>
  );
}

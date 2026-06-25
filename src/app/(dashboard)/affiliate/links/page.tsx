"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Check,
  Plus,
  Link2,
  MousePointerClick,
  Users,
  TrendingUp,
  Trash2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TrackingLink {
  id: string;
  code: string;
  slug: string | null;
  label: string | null;
  destinationUrl: string;
  clickCount: number;
  leadCount: number;
  conversionCount: number;
  createdAt: string;
  isActive: boolean;
}

// ─── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={
        copied
          ? { backgroundColor: "#d1fae5", color: "#065f46" }
          : { backgroundColor: "#f3f4f6", color: "#374151" }
      }
      title="Copy tracking URL"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied!" : "Copy URL"}
    </button>
  );
}

// ─── Create link form ─────────────────────────────────────────────────────────

interface CreateLinkFormProps {
  onCreated: () => void;
}

function CreateLinkForm({ onCreated }: CreateLinkFormProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await fetch("/api/affiliates/me/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, destinationUrl, slug: slug || undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to create link");
        return;
      }
      setLabel("");
      setDestinationUrl("");
      setSlug("");
      setOpen(false);
      onCreated();
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
        style={{ backgroundColor: "#003366" }}
      >
        <Plus size={16} />
        New Link
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Create Tracking Link</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Label <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Facebook Campaign Jan"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Destination URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            required
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            placeholder="https://example.com/landing-page"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Custom Slug <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="my-campaign"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
        {error && (
          <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-colors"
            style={{ backgroundColor: "#CC5500" }}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isPending ? "Creating…" : "Create Link"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AffiliateLinksPage() {
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function fetchLinks() {
    setLoading(true);
    try {
      const res = await fetch("/api/affiliates/me/links");
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        return;
      }
      const json = await res.json();
      setLinks(json.data?.links ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  function getTrackingUrl(link: TrackingLink) {
    return `${appUrl}/r/${link.code}`;
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">My Tracking Links</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Create and manage unique links for each campaign or channel.
          </p>
        </div>
        <CreateLinkForm onCreated={fetchLinks} />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-gray-300" />
          </div>
        ) : links.length === 0 ? (
          <div className="py-16 text-center">
            <Link2 size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No tracking links yet</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Create your first tracking link to start attributing clicks, leads, and sales to
              specific campaigns.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Label / Code
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tracking URL
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <span className="inline-flex items-center gap-1">
                      <MousePointerClick size={11} /> Clicks
                    </span>
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <span className="inline-flex items-center gap-1">
                      <Users size={11} /> Leads
                    </span>
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <span className="inline-flex items-center gap-1">
                      <TrendingUp size={11} /> Conv.
                    </span>
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Created
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {links.map((link) => {
                  const trackingUrl = getTrackingUrl(link);
                  return (
                    <tr key={link.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {link.label ?? (
                              <span className="text-gray-400 italic">Untitled</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{link.code}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 truncate font-mono">
                            {trackingUrl}
                          </span>
                          <a
                            href={trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-gray-400 hover:text-gray-600"
                            title="Open link"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                        {link.destinationUrl && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            → {link.destinationUrl}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900">
                        {link.clickCount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900">
                        {link.leadCount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold" style={{ color: "#003366" }}>
                        {link.conversionCount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {formatDate(link.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <CopyButton text={trackingUrl} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary row */}
      {links.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Clicks",
              value: links.reduce((s, l) => s + l.clickCount, 0).toLocaleString(),
              icon: <MousePointerClick size={14} className="text-gray-400" />,
            },
            {
              label: "Total Leads",
              value: links.reduce((s, l) => s + l.leadCount, 0).toLocaleString(),
              icon: <Users size={14} className="text-gray-400" />,
            },
            {
              label: "Total Conversions",
              value: links.reduce((s, l) => s + l.conversionCount, 0).toLocaleString(),
              icon: <TrendingUp size={14} className="text-gray-400" />,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
            >
              {stat.icon}
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold" style={{ color: "#003366" }}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

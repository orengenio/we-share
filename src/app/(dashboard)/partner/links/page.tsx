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
  Loader2,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

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
  trackingUrl?: string;
}

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

function CreateLinkForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("https://orengen.io");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await fetch("/api/partners/me/links", {
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
      setDestinationUrl("https://orengen.io");
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
        style={{ backgroundColor: "#00254B" }}
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
            Label <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. LinkedIn outreach"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Destination URL
          </label>
          <input
            type="url"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            placeholder="https://orengen.io"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">Must be on orengen.io (or a subdomain).</p>
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

export default function PartnerLinksPage() {
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [partnerCode, setPartnerCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function fetchLinks() {
    setLoading(true);
    try {
      const res = await fetch("/api/partners/me/links");
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        return;
      }
      const json = await res.json();
      const data = json.data;
      setLinks(Array.isArray(data) ? data : []);
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const me = await meRes.json();
        setPartnerCode(me.data?.partnerProfile?.partnerCode ?? null);
      }
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
      : process.env.NEXT_PUBLIC_APP_URL ?? "https://weshare.orengen.io";

  function getTrackingUrl(link: TrackingLink) {
    return link.trackingUrl ?? `${appUrl}/s/${link.code}`;
  }

  const defaultLink = partnerCode ? `${appUrl}/s/${partnerCode}` : null;

  return (
    <div className="space-y-6">
      {defaultLink && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Your default partner link</h3>
          <p className="text-xs text-gray-500 mb-3">
            Share this link to attribute clicks and leads to your partner account.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-gray-700 break-all">
              {defaultLink}
            </code>
            <CopyButton text={defaultLink} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Campaign Tracking Links</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Create unique links for each outreach channel or campaign.
          </p>
        </div>
        <CreateLinkForm onCreated={fetchLinks} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-gray-300" />
          </div>
        ) : links.length === 0 ? (
          <div className="py-16 text-center">
            <Link2 size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No campaign links yet</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Use your default link above, or create campaign-specific links to track performance.
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
                      <td className="px-5 py-3 text-right font-semibold" style={{ color: "#00254B" }}>
                        {link.conversionCount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {formatDate(link.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <CopyButton text={trackingUrl} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

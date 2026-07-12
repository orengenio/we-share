"use client";

import { useState } from "react";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";

/**
 * Admin AI email composer (Gemini). Drafts only — review, copy, and send
 * through GHL yourself. Compliance guardrails are baked into the system
 * prompt server-side.
 */
export default function AiComposer() {
  const [brief, setBrief] = useState("");
  const [audience, setAudience] = useState<"rep" | "customer" | "applicant">("rep");
  const [draft, setDraft] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function compose() {
    if (brief.trim().length < 5) return;
    setLoading(true);
    setError(null);
    setDraft(null);
    try {
      const res = await fetch("/api/admin/ai/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, audience }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) setDraft(data.data.draft);
      else setError(data.error ?? "Draft failed");
    } catch {
      setError("Network error — try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} style={{ color: "#CC5500" }} />
        <h2 className="font-bold text-gray-900">AI Email Composer</h2>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Gemini drafts in the house voice with compliance guardrails. You review and send — it never
        sends anything itself.
      </p>
      <div className="flex gap-2 mb-2">
        {(["rep", "applicant", "customer"] as const).map((a) => (
          <button
            key={a}
            onClick={() => setAudience(a)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
              audience === a ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            style={audience === a ? { backgroundColor: "#00254B" } : undefined}
          >
            {a}
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        placeholder='Brief, e.g. "Nudge reps who haven&apos;t connected Stripe yet — friendly, one clear action."'
        className="form-input w-full text-sm"
      />
      <button
        onClick={compose}
        disabled={loading || brief.trim().length < 5}
        className="mt-2 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: "#CC5500" }}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {loading ? "Drafting…" : "Draft Email"}
      </button>
      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      {draft && (
        <div className="mt-3">
          <div className="flex justify-end mb-1">
            <button
              onClick={() => {
                navigator.clipboard.writeText(draft).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                });
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-gray-800">{draft}</pre>
        </div>
      )}
    </div>
  );
}

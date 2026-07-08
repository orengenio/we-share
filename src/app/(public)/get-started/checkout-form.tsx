"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

/**
 * Starts the official Stripe checkout. Attribution rides in automatically:
 * the server reads the visitor's 90-day tracking cookie (set by /r/ and /s/
 * links); ?ref= / ?rep= URL params are the cookieless fallback.
 */
export default function CheckoutForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/public/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || undefined,
          affiliateCode: params.get("ref") ?? undefined,
          partnerCode: params.get("rep") ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        setError(data.error ?? "Could not start checkout — try again");
        setLoading(false);
      }
    } catch {
      setError("Network error — try again");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={start}
      className="rounded-xl border border-slate-500/30 bg-white/5 p-5 space-y-4"
    >
      <p className="font-bold text-white">Start your build</p>
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Business email
        </label>
        <input
          type="email"
          required
          placeholder="you@yourbusiness.com"
          className="w-full rounded-lg border border-slate-500/40 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {error && (
        <div className="rounded-lg border border-red-400/40 bg-red-500/15 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg py-3 text-sm font-bold text-white disabled:opacity-60 inline-flex items-center justify-center gap-2 hover:opacity-90"
        style={{ backgroundColor: "#CC5500" }}
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={14} />}
        {loading ? "Opening secure checkout…" : "Get My Website — $997 + $247/mo"}
      </button>
      <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
        <Lock size={11} /> Secure checkout by Stripe
      </p>
    </form>
  );
}

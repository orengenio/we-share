"use client";

import { useEffect, useState } from "react";
import { FileSignature, Loader2 } from "lucide-react";

/**
 * Shown on the partner dashboard until the CURRENT VERSION of the Sales
 * Representative Agreement is accepted (version-aware: a new agreement
 * version re-surfaces the banner for existing reps). Tax identity itself is
 * handled by Stripe Connect — this records the contractual acceptance.
 */
export default function AgreementBanner() {
  const [needed, setNeeded] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/partners/me/agreement")
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && d.data?.accepted === false) setNeeded(true);
      })
      .catch(() => null);
  }, []);

  async function accept() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/partners/me/agreement", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setDone(true);
        setOpen(false);
      } else {
        setError(data.error ?? "Could not record acceptance — try again");
      }
    } catch {
      setError("Network error — try again");
    } finally {
      setSaving(false);
    }
  }

  if (!needed || done) return null;

  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <FileSignature size={18} className="shrink-0 text-blue-700" />
          <p className="text-sm text-blue-900">
            <span className="font-semibold">One document before your first payout:</span>{" "}
            the Partner Payment Authorization &amp; Contractor Agreement.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
          style={{ backgroundColor: "#00254B" }}
        >
          Review &amp; Accept
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Sales Representative Agreement
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                By clicking <strong>I Agree</strong> you accept the full{" "}
                <a
                  href="/partner-agreement"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                  style={{ color: "#CC5500" }}
                >
                  Sales Representative Agreement (v3-2026-07-22)
                </a>
                . The short version:
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  You are an <strong>independent contractor</strong>, responsible for your own
                  taxes — W-9/TIN and 1099s are handled through the <strong>Stripe account you
                  connect</strong>.
                </li>
                <li>
                  You earn <strong>25% of the setup fee + 25% of the monthly, for the life of
                  each client you close</strong>. Commissions mature on a{" "}
                  <strong>72-hour rescission hold</strong> and are subject to <strong>clawback</strong> only
                  if the client cancels within that statutory window — after hour 72 the commission is locked.
                </li>
                <li>
                  You sell at the fixed price ($997 + $247/mo) through the official checkout,
                  log every touch same-day, and make first contact with assigned leads within
                  4 hours.
                </li>
                <li>
                  Client relationships, lead data, scripts, and pricing strategy are OrenGen
                  property — no diverting clients or leads off-platform, no representing
                  competing product lines.
                </li>
                <li>
                  Exit in good standing and your <strong>residuals continue for the life of
                  your client accounts</strong>. Termination for cause (fraud, circumvention,
                  material breach) forfeits unpaid and future commissions. Either side gives
                  14 days&apos; notice.
                </li>
              </ol>
              <p className="text-xs text-gray-500">
                Version v3-2026-07-22 · incorporates the Program Terms of Service and Partner
                Handbook by reference. Your acceptance is recorded with a timestamp and your
                account identity.
              </p>
            </div>
            {error && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Not now
              </button>
              <button
                onClick={accept}
                disabled={saving}
                className="flex-1 rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-60 inline-flex items-center justify-center gap-2"
                style={{ backgroundColor: "#CC5500" }}
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Recording…" : "I Agree"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

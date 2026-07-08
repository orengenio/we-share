"use client";

import { useState } from "react";
import { FileSignature, Loader2 } from "lucide-react";

/**
 * Shown on the partner dashboard until the Payment Authorization & Contractor
 * Agreement is accepted. Tax identity itself is handled by Stripe Connect —
 * this records the contractual acknowledgment.
 */
export default function AgreementBanner() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  if (done) return null;

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
              Payment Authorization &amp; Contractor Agreement
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p>As an OrenGen Sales Partner, I acknowledge and agree:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  I am an <strong>independent contractor</strong>, not an employee of OrenGen
                  Worldwide LLC. I am responsible for my own taxes.
                </li>
                <li>
                  Commission payments are remitted to the <strong>Stripe account I connect</strong>.
                  My tax information (W-9/TIN) is collected and certified through Stripe Connect,
                  and tax forms (e.g. 1099) are issued through Stripe where thresholds are met.
                </li>
                <li>
                  Commissions mature on a <strong>NET-15 hold</strong> and are subject to
                  <strong> clawback</strong> if the customer refunds within 30 days — including
                  netting against future payouts where a commission was already paid.
                </li>
                <li>
                  Client relationships, lead data, scripts, and pricing strategy are OrenGen
                  property. I will not divert clients or leads off-platform.
                </li>
                <li>
                  On exit in good standing, my <strong>residual commissions continue</strong> on
                  clients I closed, per the Partner Handbook. Termination for cause forfeits
                  unpaid and future commissions.
                </li>
              </ol>
              <p className="text-xs text-gray-500">
                Version v1-2026-07-08. Your acceptance is recorded with a timestamp and your
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

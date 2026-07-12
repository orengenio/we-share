"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldOff, Loader2 } from "lucide-react";

/**
 * Inline suspend/reinstate actions for a referral partner row. Calls the
 * working PATCH /api/admin/affiliates endpoint instead of linking to the
 * (nonexistent) /admin/affiliates/[id]/suspend pages.
 */
export default function AffiliateRowActions({
  affiliateId,
  isActive,
  userId,
  userEmail,
}: {
  affiliateId: string;
  isActive: boolean;
  userId?: string;
  userEmail?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function act(action: "suspend" | "reinstate") {
    if (action === "suspend" && !confirm("Suspend this referral partner? They'll lose portal access until reinstated.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/affiliates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ affiliateId, action }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "Action failed");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      {isActive ? (
        <button
          onClick={() => act("suspend")}
          disabled={isPending}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 size={11} className="animate-spin" /> : <ShieldOff size={11} />} Suspend
        </button>
      ) : (
        <button
          onClick={() => act("reinstate")}
          disabled={isPending}
          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
        >
          {isPending ? "…" : "Reinstate"}
        </button>
      )}
      {userId && (
        <button
          onClick={() => {
            if (!confirm(`PERMANENTLY DELETE ${userEmail ?? "this account"}?\n\nThe login, profile, and links are removed. Financial ledger rows are kept (owner unlinked) for tax/audit retention. This cannot be undone — suspending is usually the better option.`)) return;
            setError(null);
            startTransition(async () => {
              const res = await fetch("/api/admin/users", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
              });
              if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                setError(json.error ?? "Delete failed");
                return;
              }
              router.refresh();
            });
          }}
          disabled={isPending}
          className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          Delete
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

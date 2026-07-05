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
}: {
  affiliateId: string;
  isActive: boolean;
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
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

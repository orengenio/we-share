"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";

const RESOLUTIONS = [
  { value: "DISMISSED", label: "Dismiss — False positive" },
  { value: "WARNED", label: "Warn — Issue a warning" },
  { value: "SUSPENDED", label: "Suspend — Suspend account" },
  { value: "TERMINATED", label: "Terminate — Permanent ban" },
];

interface Props {
  flagId: string;
}

export default function FraudResolveForm({ flagId }: Props) {
  const [open, setOpen] = useState(false);
  const [resolution, setResolution] = useState("DISMISSED");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await fetch(`/api/admin/fraud/${flagId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution, notes: notes || undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to resolve flag");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
        style={{ backgroundColor: "#00254B" }}
      >
        <ShieldCheck size={12} />
        Resolve
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3">
      <p className="text-xs font-semibold text-gray-700">Resolve Flag</p>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Resolution</label>
        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        >
          {RESOLUTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Notes <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal resolution notes…"
          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        />
      </div>

      {error && (
        <p className="text-xs font-medium text-red-600">{error}</p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-60 transition-colors"
          style={{
            backgroundColor:
              resolution === "SUSPENDED" || resolution === "TERMINATED"
                ? "#dc2626"
                : "#CC5500",
          }}
        >
          {isPending && <Loader2 size={11} className="animate-spin" />}
          {isPending ? "Saving…" : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Camera, Loader2, Check, CreditCard, ShieldCheck, ExternalLink } from "lucide-react";

interface Me {
  id: string;
  email: string;
  name: string | null;
  role: string;
  phone: string | null;
  timezone: string | null;
  avatarUrl: string | null;
  showOnLeaderboard: boolean;
  affiliateProfile: { stripeConnectId: string | null; stripeAccountStatus: string | null } | null;
  partnerProfile: { stripeConnectId: string | null; stripeAccountStatus: string | null } | null;
}

const TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Phoenix", "America/Anchorage", "Pacific/Honolulu", "UTC",
];

// Resize an image file to a square data URL, client-side, so we never upload a
// multi-MB photo into the DB.
function fileToResizedDataUrl(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unsupported"));
        // Center-crop to a square.
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function SettingsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripeStatus, setStripeStatus] = useState<string>("loading");
  const [connecting, setConnecting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ name: "", phone: "", timezone: "America/Chicago", showOnLeaderboard: false });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (data.success) {
      const m: Me = data.data;
      setMe(m);
      setForm({
        name: m.name ?? "",
        phone: m.phone ?? "",
        timezone: m.timezone ?? "America/Chicago",
        showOnLeaderboard: m.showOnLeaderboard,
      });
      setAvatarUrl(m.avatarUrl);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Load Stripe Connect status (admins have no payout profile).
  useEffect(() => {
    if (!me || me.role === "ADMIN") { setStripeStatus("n/a"); return; }
    fetch("/api/user/stripe-connect")
      .then(r => r.json())
      .then(d => setStripeStatus(d.success ? d.data.status : "error"))
      .catch(() => setStripeStatus("error"));
  }, [me]);

  async function save(partial: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "Save failed"); return false; }
      setSavedAt(true);
      setTimeout(() => setSavedAt(false), 2000);
      return true;
    } finally {
      setSaving(false);
    }
  }

  async function onAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setAvatarUrl(dataUrl);
      await save({ avatarUrl: dataUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not process image");
    }
  }

  async function connectStripe() {
    setConnecting(true);
    try {
      const res = await fetch("/api/user/stripe-connect", { method: "POST" });
      const data = await res.json();
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        setError(data.error ?? "Could not start payout setup");
      }
    } finally {
      setConnecting(false);
    }
  }

  if (loading) {
    return <div className="max-w-2xl space-y-4 animate-pulse">{[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-gray-200" />)}</div>;
  }
  if (!me) return null;

  const initials = (me.name ?? me.email).slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your profile, photo, and payout details.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
      {savedAt && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 flex items-center gap-2">
          <Check size={14} /> Saved
        </div>
      )}

      {/* Profile photo */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Profile Photo</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Your profile photo" className="w-20 h-20 rounded-full object-cover border border-gray-200" />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold text-white" style={{ backgroundColor: "#00254B" }}>
                {initials}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white shadow"
              style={{ backgroundColor: "#CC5500" }}
              aria-label="Upload a new profile photo"
            >
              <Camera size={13} />
            </button>
          </div>
          <div className="text-sm text-gray-500">
            <p>Click the camera to upload. Square JPG/PNG works best.</p>
            <p className="text-xs text-gray-400 mt-0.5">Automatically resized and cropped.</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarPick} />
        </div>
      </section>

      {/* Profile details */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Profile Details</h2>
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-gray-600 mb-1">Full name</label>
          <input id="name" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input id="email" className="form-input bg-gray-50 text-gray-500" value={me.email} disabled />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <input id="phone" className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label htmlFor="tz" className="block text-xs font-medium text-gray-600 mb-1">Timezone</label>
            <select id="tz" className="form-input" value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}>
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={() => save({ name: form.name || undefined, phone: form.phone, timezone: form.timezone })}
          disabled={saving}
          className="btn-primary text-sm"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </section>

      {/* Payouts & Tax (not for admins) */}
      {me.role !== "ADMIN" && (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={16} style={{ color: "#00254B" }} />
            <h2 className="text-sm font-semibold text-gray-900">Payouts &amp; Tax (W-9 / 1099)</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Payouts and your tax forms are handled securely by Stripe. Completing Stripe onboarding
            collects your W-9 information and enables weekly Friday payouts — Stripe issues your 1099 at year end.
          </p>
          {stripeStatus === "enabled" ? (
            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
              <ShieldCheck size={16} /> Payouts enabled — you&apos;re all set.
            </div>
          ) : (
            <button onClick={connectStripe} disabled={connecting} className="btn-primary text-sm inline-flex items-center gap-2">
              {connecting ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
              {stripeStatus === "pending" ? "Finish payout & tax setup" : "Set up payouts & tax (Stripe)"}
            </button>
          )}
        </section>
      )}

      {/* Public leaderboard visibility */}
      {me.role !== "ADMIN" && (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Public Leaderboard</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.showOnLeaderboard}
              onChange={async (e) => {
                setForm({ ...form, showOnLeaderboard: e.target.checked });
                await save({ showOnLeaderboard: e.target.checked });
              }}
              className="h-4 w-4 rounded border-gray-300 accent-[#CC5500]"
            />
            <span className="text-sm text-gray-700">Show my name and earnings on the public leaderboard</span>
          </label>
        </section>
      )}
    </div>
  );
}

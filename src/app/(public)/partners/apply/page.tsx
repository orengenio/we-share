"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const inputCls =
  "w-full rounded-lg border border-slate-500/40 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400";
const labelCls = "block text-xs font-semibold text-slate-300 mb-1.5";

const RADIO_GROUPS = {
  experience: {
    label: "Have you sold on commission before? *",
    options: [
      ["full_time", "Yes — full time"],
      ["side_income", "Yes — side income"],
      ["none_but_ready", "No, but I can hold a hard conversation"],
    ],
  },
  hours: {
    label: "Hours per week you'll actually work this *",
    options: [["lt10", "<10"], ["10_20", "10–20"], ["20_40", "20–40"], ["40_plus", "40+"]],
  },
  start: {
    label: "How soon can you start? *",
    options: [["this_week", "This week"], ["two_weeks", "Within 2 weeks"], ["exploring", "Just exploring"]],
  },
} as const;

export default function PartnerApplyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", cityState: "",
    experience: "", soldWhat: "", hours: "", objectionAnswer: "",
    start: "", referrer: "", serviceConsent: false, smsConsent: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.experience || !form.hours || !form.start) {
      setError("Please answer all the required questions.");
      return;
    }
    if (!form.serviceConsent) {
      setError("The contact-about-your-application consent is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/public/partner-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          serviceConsent: true,
          soldWhat: form.soldWhat || undefined,
          referrer: form.referrer || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        router.push("/partners/thanks");
      } else {
        setError(data.error ?? "Could not submit — try again");
      }
    } catch {
      setError("Network error — try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto pb-10">
      <h1 className="text-3xl font-black text-white tracking-tight">
        Ten questions. Five minutes. Then we talk.
      </h1>
      <p className="mt-3 text-slate-300 text-sm">
        The application is short on purpose — the questions aren&apos;t. We&apos;re staffing seats
        with people who&apos;ll actually work them, because every lead we assign to a dead seat is
        a business owner who never got a call.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <label className={labelCls}>Full name *</label>
          <input required className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Email *</label>
            <input required type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Mobile phone *</label>
            <input required className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelCls}>City &amp; state *</label>
          <input required className={inputCls} placeholder="Mansfield, TX" value={form.cityState} onChange={(e) => set("cityState", e.target.value)} />
        </div>

        {(Object.entries(RADIO_GROUPS) as [keyof typeof RADIO_GROUPS, (typeof RADIO_GROUPS)[keyof typeof RADIO_GROUPS]][]).map(
          ([key, group]) => (
            <fieldset key={key}>
              <legend className={labelCls}>{group.label}</legend>
              <div className="flex flex-wrap gap-2">
                {group.options.map(([value, label]) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      form[key] === value
                        ? "border-orange-400 bg-orange-400/20 text-white"
                        : "border-slate-500/40 text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name={key}
                      value={value}
                      checked={form[key] === value}
                      onChange={() => set(key, value)}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          )
        )}

        <div>
          <label className={labelCls}>What have you sold?</label>
          <input className={inputCls} value={form.soldWhat} onChange={(e) => set("soldWhat", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>
            When a prospect says &quot;I need to think about it,&quot; what do you say next? *
          </label>
          <textarea
            required
            minLength={10}
            rows={3}
            className={inputCls}
            placeholder="We read every answer to this one."
            value={form.objectionAnswer}
            onChange={(e) => set("objectionAnswer", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Who sent you? <span className="text-slate-500">(referral / rep / leader code)</span></label>
          <input className={inputCls} value={form.referrer} onChange={(e) => set("referrer", e.target.value)} />
        </div>

        {/* Consent — service required, marketing SMS optional, never pre-checked */}
        <div className="space-y-3 rounded-xl border border-slate-500/30 bg-white/5 p-4 text-xs text-slate-300">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={form.serviceConsent}
              onChange={(e) => set("serviceConsent", e.target.checked)}
              className="mt-0.5"
            />
            <span><strong className="text-slate-200">(required)</strong> I agree OrenGen may contact me by phone and email about my application.</span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.smsConsent}
              onChange={(e) => set("smsConsent", e.target.checked)}
              className="mt-0.5"
            />
            <span>(optional) Text me updates about my application and partner program news. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help.</span>
          </label>
        </div>

        {error && (
          <div className="rounded-lg border border-red-400/40 bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg py-3 text-sm font-bold text-white disabled:opacity-60 inline-flex items-center justify-center gap-2 hover:opacity-90"
          style={{ backgroundColor: "#CC5500" }}
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          {saving ? "Submitting…" : "Submit My Application →"}
        </button>
        <p className="text-center text-xs text-slate-400">
          We reply within one business day. If it&apos;s a no, it&apos;s a fast, respectful no.
        </p>
      </form>
    </div>
  );
}

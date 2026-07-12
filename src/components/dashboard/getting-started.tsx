"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, FileText, CreditCard, Camera, Link2, Award, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface Me {
  role: string;
  avatarUrl: string | null;
  docsAcknowledgedAt: string | null;
  affiliateProfile: { stripeAccountStatus: string | null; lifetimeSales?: number } | null;
  partnerProfile: { stripeAccountStatus: string | null; isCertified: boolean; leadsUnlocked: boolean } | null;
}

interface Step {
  key: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  done: boolean;
  href?: string;
  action?: "ackDocs";
  required: boolean;
}

export default function GettingStarted() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [ackBusy, setAckBusy] = useState(false);
  const [stripeLiveEnabled, setStripeLiveEnabled] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json().catch(() => ({}));
    if (data.success) setMe(data.data);
    setLoading(false);
  }, []);

  const refreshStripeStatus = useCallback(async () => {
    const r = await fetch("/api/user/stripe-connect");
    const d = await r.json().catch(() => ({}));
    if (d.success && d.data.status === "enabled") {
      setStripeLiveEnabled(true);
      await load();
    }
  }, [load]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!me || me.role === "ADMIN") return;
    refreshStripeStatus();
  }, [me, refreshStripeStatus]);

  async function acknowledgeDocs() {
    setAckBusy(true);
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docsAcknowledged: true }),
      });
      await load();
    } finally {
      setAckBusy(false);
    }
  }

  if (loading || !me || me.role === "ADMIN") return null;

  const isPartner = me.role === "PARTNER";
  const stripeEnabled =
    stripeLiveEnabled ||
    (me.affiliateProfile?.stripeAccountStatus ?? me.partnerProfile?.stripeAccountStatus) === "enabled";
  const docsDone = Boolean(me.docsAcknowledgedAt);

  const steps: Step[] = [
    {
      key: "docs",
      label: "Review your program documents",
      desc: "Read your agreement, handbook, and the earnings disclaimer before you begin.",
      icon: <FileText size={16} />,
      done: docsDone,
      href: "/resources",
      action: "ackDocs",
      required: true,
    },
    {
      key: "payouts",
      label: "Set up payouts & tax (W-9 / 1099)",
      desc: "Complete Stripe onboarding so you can get paid every Friday.",
      icon: <CreditCard size={16} />,
      done: stripeEnabled,
      href: "/settings",
      required: true,
    },
    ...(isPartner
      ? [{
          key: "cert",
          label: "Complete certification",
          desc: "Your certification role-play unlocks leads. OrenGen will schedule this with you.",
          icon: <Award size={16} />,
          done: Boolean(me.partnerProfile?.isCertified),
          required: true,
        } as Step]
      : [{
          key: "firstlink",
          label: "Grab your referral link & share it",
          desc: "Your unique link is ready — create campaign links and start sharing.",
          icon: <Link2 size={16} />,
          done: (me.affiliateProfile?.lifetimeSales ?? 0) > 0,
          href: "/affiliate/links",
          required: false,
        } as Step]),
    {
      key: "photo",
      label: "Add a profile photo",
      desc: "Optional — put a face to your name.",
      icon: <Camera size={16} />,
      done: Boolean(me.avatarUrl),
      href: "/settings",
      required: false,
    },
  ];

  const requiredSteps = steps.filter(s => s.required);
  const requiredDone = requiredSteps.filter(s => s.done).length;
  const allRequiredDone = requiredDone === requiredSteps.length;
  const totalDone = steps.filter(s => s.done).length;

  // Once everything required is done, stay out of the way (small collapsed bar).
  if (allRequiredDone && collapsed) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            {allRequiredDone ? "You're all set! 🎉" : "Before you begin"}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {totalDone} of {steps.length} steps complete
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-28 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(totalDone / steps.length) * 100}%`, backgroundColor: "#CC5500" }}
            />
          </div>
          {collapsed ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
        </div>
      </button>

      {!collapsed && (
        <div className="px-5 pb-5 space-y-2">
          {steps.map(step => (
            <div
              key={step.key}
              className={`flex items-start gap-3 rounded-lg border p-3 ${step.done ? "border-green-100 bg-green-50/40" : "border-gray-100"}`}
            >
              <span className={step.done ? "text-green-600 mt-0.5" : "text-gray-300 mt-0.5"}>
                {step.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400">{step.icon}</span>
                  <p className={`text-sm font-medium ${step.done ? "text-gray-500 line-through" : "text-gray-900"}`}>
                    {step.label}
                  </p>
                  {!step.required && <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Optional</span>}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                {!step.done && (
                  <div className="flex items-center gap-3 mt-2">
                    {step.href && (
                      <Link href={step.href} className="text-xs font-semibold hover:underline" style={{ color: "#CC5500" }}>
                        {step.action === "ackDocs" ? "Open documents →" : "Go →"}
                      </Link>
                    )}
                    {step.action === "ackDocs" && (
                      <button
                        onClick={acknowledgeDocs}
                        disabled={ackBusy}
                        className="text-xs font-semibold inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-white"
                        style={{ backgroundColor: "#00254B" }}
                      >
                        {ackBusy && <Loader2 size={11} className="animate-spin" />}
                        I&apos;ve reviewed them
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

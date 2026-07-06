"use client";

import { useState } from "react";
import { Download, Copy, Check, ImageIcon, MessageSquareText } from "lucide-react";

const LOGO_DARK = "https://cdn.content360.io/ea2381f4-12e0-4efd-b95b-6012c981eae0/uploads/05-2026/wJb1wZczjrrxwoRKmtjrspq1IJwjW00FtCsIfdn6.png";
const LOGO_LIGHT = "https://cdn.content360.io/ea2381f4-12e0-4efd-b95b-6012c981eae0/uploads/05-2026/bmeUUijIh8dkwmEIWUWDktHNGX2nMZ0HewKw9Q0e.png";
const FAVICON = "https://cdn.content360.io/ea2381f4-12e0-4efd-b95b-6012c981eae0/uploads/05-2026/SndVQLK75HyjFd6o7gHWoy3GksWvISLfzVqmOBry.png";

const BRAND_ASSETS = [
  { label: "OrenGen logo (for dark backgrounds)", url: LOGO_DARK },
  { label: "OrenGen logo (for light backgrounds)", url: LOGO_LIGHT },
  { label: "OrenGen mark / favicon", url: FAVICON },
];

// Swipe copy per track — real, ready-to-use snippets partners can copy & post.
const REFERRAL_SWIPE = [
  {
    title: "Text / DM",
    body: "Quick one — OrenGen (they build business websites) has a referral program. You share a tracked link, their team closes the sale, and you get paid ~$100 per signup plus a monthly cut for as long as the client stays. Free to join, paid weekly. Worth 2 minutes: {your link}",
  },
  {
    title: "Social post",
    body: "Every business around you needs a website. Most of them know it.\n\nI share a link, OrenGen's team builds and closes, and I get paid — upfront + every month the client stays. Free to join, paid every Friday. Grab your link → {your link}\n\n#ad",
  },
  {
    title: "Email",
    body: "Here's the whole pitch in four lines:\n\nBusinesses need websites. OrenGen builds them.\nYou share your link — their closers and engineers do the rest.\nYou earn a commission per sale + a residual every month the client stays.\nFree to join, paid weekly via Stripe.\n\nStart here: {your link}",
  },
];

const PARTNER_SWIPE = [
  {
    title: "LinkedIn opportunity post",
    body: "OrenGen is opening seats on its Sales Partner roster. Close website deals ($997 setup + $247/mo) on warm leads we hand you, with proven scripts. $249.25 per close + $61.75/mo per client for life. CRM, company number, and full fulfillment provided. Curated roster — certification required. DM me.",
  },
  {
    title: "Recruiting DM",
    body: "Saw your sales background — OrenGen is adding commission-only closers for our website service. We provide the leads, scripts, CRM, and a company line; you close at $249 upfront + $61.75/mo per client for life. The residual book stacks monthly and never resets. Want the breakdown?",
  },
];

function CopyBlock({ title, body }: { title: string; body: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors"
          style={copied ? { background: "#d1fae5", color: "#065f46" } : { background: "#f3f4f6", color: "#374151" }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{body}</p>
    </div>
  );
}

export default function MaterialsLibrary({ role }: { role: string }) {
  const showReferral = role === "AFFILIATE" || role === "ADMIN";
  const showPartner = role === "PARTNER" || role === "ADMIN";

  return (
    <div className="space-y-8">
      {/* Brand assets */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <ImageIcon className="w-4 h-4" style={{ color: "#CC5500" }} />
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Brand Assets</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {BRAND_ASSETS.map((a) => (
            <div key={a.url} className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-3">
              <div className="h-16 rounded-lg flex items-center justify-center" style={{ background: "#00254B" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.url} alt={a.label} className="max-h-10 max-w-[80%] object-contain" />
              </div>
              <p className="text-xs text-gray-600 flex-1">{a.label}</p>
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white self-start"
                style={{ background: "#CC5500" }}
              >
                <Download size={12} /> Download
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Swipe copy */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquareText className="w-4 h-4" style={{ color: "#CC5500" }} />
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Swipe Copy</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Copy, paste, and personalize. Replace <code className="bg-gray-100 px-1 rounded">{"{your link}"}</code> with your referral link.
          Always include a disclosure (e.g. <strong>#ad</strong>) when you post.
        </p>

        {showReferral && (
          <div className="space-y-3 mb-6">
            <p className="text-sm font-semibold text-gray-700">Referral Partner</p>
            {REFERRAL_SWIPE.map((s) => <CopyBlock key={s.title} {...s} />)}
          </div>
        )}

        {showPartner && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Sales Partner</p>
            {PARTNER_SWIPE.map((s) => <CopyBlock key={s.title} {...s} />)}
          </div>
        )}
      </section>
    </div>
  );
}

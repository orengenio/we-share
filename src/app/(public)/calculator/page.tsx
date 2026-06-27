"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Calculator, TrendingUp, Crown, DollarSign, Lock } from "lucide-react";
import { COMMISSION_CONFIGS, PARTNER_COMMISSION, LEADER_COMMISSION, WEBSITE_PACKAGES } from "@/types";
import { RANK_LABELS } from "@/lib/utils";

type Tab = "affiliate" | "partner" | "leader";
type PkgKey = "STANDARD" | "PROFESSIONAL" | "PREMIUM";

const RANK_ORDER = ["CATALYST", "BUILDER", "ARCHITECT", "SOVEREIGN"] as const;
const PKG_ORDER: PkgKey[] = ["STANDARD", "PROFESSIONAL", "PREMIUM"];

// ─── Package selector ─────────────────────────────────────────────────────────

function PackageSelector({ value, onChange }: { value: PkgKey; onChange: (k: PkgKey) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-2">Website Package</label>
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        {PKG_ORDER.map(k => (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            className={[
              "flex-1 py-2 text-xs font-semibold transition-colors",
              value === k
                ? "text-white"
                : "text-gray-500 hover:text-gray-700 bg-white",
            ].join(" ")}
            style={value === k ? { backgroundColor: "#003366" } : {}}
          >
            <span className="block">{WEBSITE_PACKAGES[k].name}</span>
            <span className="block font-normal opacity-70">{WEBSITE_PACKAGES[k].tagline}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Affiliate Calculator ─────────────────────────────────────────────────────

function AffiliateCalculator({ pkg }: { pkg: PkgKey }) {
  const [rank, setRank] = useState<string>("CATALYST");
  const [salesPerMonth, setSalesPerMonth] = useState(2);
  const [months, setMonths] = useState(12);

  const config = COMMISSION_CONFIGS[rank];
  const { setupFee, monthlyFee } = WEBSITE_PACKAGES[pkg];
  const setupPerSale = parseFloat((setupFee * config.setupFeeRate).toFixed(2));
  const residualPerClient = parseFloat((monthlyFee * config.residualRate).toFixed(2));

  const projections = Array.from({ length: months }, (_, i) => {
    const month = i + 1;
    let residual = 0;
    for (let sale = 1; sale <= month; sale++) {
      const monthsElapsed = month - sale + 1;
      const eligible = config.residualMonths === null || monthsElapsed <= config.residualMonths;
      if (eligible) residual += salesPerMonth * residualPerClient;
    }
    return { month, setup: salesPerMonth * setupPerSale, residual };
  });

  const totalSetup = projections.reduce((s, p) => s + p.setup, 0);
  const totalResidual = projections.reduce((s, p) => s + p.residual, 0);
  const lastMonthResidual = projections[projections.length - 1]?.residual ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Your Rank</label>
          <select
            value={rank}
            onChange={e => setRank(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
          >
            {RANK_ORDER.map(r => (
              <option key={r} value={r}>{RANK_LABELS[r]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Sales Per Month</label>
          <input
            type="number" min={1} max={100} value={salesPerMonth}
            onChange={e => setSalesPerMonth(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
          />
        </div>
      </div>

      {/* Rate summary */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500 mb-1">Setup Rate</p>
          <p className="font-bold text-lg" style={{ color: "#003366" }}>{(config.setupFeeRate * 100).toFixed(0)}%</p>
          <p className="text-xs text-gray-400">{formatCurrency(setupPerSale)}/sale</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Residual Rate</p>
          <p className="font-bold text-lg" style={{ color: "#003366" }}>{(config.residualRate * 100).toFixed(1)}%</p>
          <p className="text-xs text-gray-400">{formatCurrency(residualPerClient)}/mo/client</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Residual Duration</p>
          <p className="font-bold text-lg" style={{ color: "#003366" }}>
            {config.residualMonths === null ? "∞" : `${config.residualMonths} mo`}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Projection (months)</p>
          <div className="flex items-center gap-1 justify-center">
            <input
              type="number" min={1} max={60} value={months}
              onChange={e => setMonths(Math.max(1, Math.min(60, parseInt(e.target.value) || 12)))}
              className="w-16 rounded border border-gray-300 px-1.5 py-1 text-sm font-bold text-center focus:outline-none"
              style={{ color: "#CC5500" }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Total Setup</p>
          <p className="text-xl font-bold" style={{ color: "#003366" }}>{formatCurrency(totalSetup)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Total Residual</p>
          <p className="text-xl font-bold" style={{ color: "#003366" }}>{formatCurrency(totalResidual)}</p>
          <p className="text-xs text-gray-400">{formatCurrency(lastMonthResidual)}/mo at end</p>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center shadow-sm" style={{ borderColor: "#CC5500" }}>
          <p className="text-xs text-gray-500 mb-1">Total {months}mo Earnings</p>
          <p className="text-xl font-bold" style={{ color: "#CC5500" }}>{formatCurrency(totalSetup + totalResidual)}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Estimates assume consistent sales pace and client retention. Not a guarantee of income.
      </p>
    </div>
  );
}

// ─── Partner Calculator ───────────────────────────────────────────────────────

function PartnerCalculator({ pkg }: { pkg: PkgKey }) {
  const [dealsPerMonth, setDealsPerMonth] = useState(2);
  const [months, setMonths] = useState(12);

  const { setupFee, monthlyFee } = WEBSITE_PACKAGES[pkg];
  const setupPerDeal = parseFloat((setupFee * PARTNER_COMMISSION.setupFeeRate).toFixed(2));
  const residualPerClient = parseFloat((monthlyFee * PARTNER_COMMISSION.residualRate).toFixed(2));

  const projections = Array.from({ length: months }, (_, i) => {
    const month = i + 1;
    const totalClients = month * dealsPerMonth;
    return {
      month,
      setup: dealsPerMonth * setupPerDeal,
      residual: totalClients * residualPerClient,
    };
  });

  const totalSetup = projections.reduce((s, p) => s + p.setup, 0);
  const totalResidual = projections.reduce((s, p) => s + p.residual, 0);
  const monthlyResidualAtEnd = projections[projections.length - 1]?.residual ?? 0;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
        <p className="text-sm font-semibold text-orange-900 mb-1">Sales Partner — {WEBSITE_PACKAGES[pkg].name} Package</p>
        <p className="text-xs text-orange-700">
          <strong>25% setup fee</strong> ({formatCurrency(setupPerDeal)}/deal) +{" "}
          <strong>25% monthly residual</strong> ({formatCurrency(residualPerClient)}/mo) for the life of every client.
          Flat rate — no ranking system.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Deals Closed Per Month</label>
          <input
            type="number" min={1} max={50} value={dealsPerMonth}
            onChange={e => setDealsPerMonth(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Projection (months)</label>
          <input
            type="number" min={1} max={60} value={months}
            onChange={e => setMonths(Math.max(1, Math.min(60, parseInt(e.target.value) || 12)))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
          />
        </div>
        <div className="flex flex-col justify-end">
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-center">
            <p className="text-xs text-gray-500">Residual at Mo.{months}</p>
            <p className="font-bold text-base" style={{ color: "#003366" }}>{formatCurrency(monthlyResidualAtEnd)}/mo</p>
            <p className="text-xs text-gray-400">{months * dealsPerMonth} active clients</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Total Setup ({months} mo)</p>
          <p className="text-xl font-bold" style={{ color: "#003366" }}>{formatCurrency(totalSetup)}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center shadow-sm" style={{ borderColor: "#CC5500" }}>
          <p className="text-xs text-gray-500 mb-1">Total {months}mo Earnings</p>
          <p className="text-xl font-bold" style={{ color: "#CC5500" }}>{formatCurrency(totalSetup + totalResidual)}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Assumes zero churn. Actual residuals depend on client retention. For illustration only.
      </p>
    </div>
  );
}

// ─── Leader Calculator ────────────────────────────────────────────────────────

function LeaderCalculator({ pkg }: { pkg: PkgKey }) {
  const [personalDeals, setPersonalDeals] = useState(2);
  const [teamSize, setTeamSize] = useState(5);
  const [teamDealsPerPartner, setTeamDealsPerPartner] = useState(1);
  const [months, setMonths] = useState(12);

  const { setupFee, monthlyFee } = WEBSITE_PACKAGES[pkg];
  const mySetupPerDeal = parseFloat((setupFee * PARTNER_COMMISSION.setupFeeRate).toFixed(2));
  const myResidualPerClient = parseFloat((monthlyFee * PARTNER_COMMISSION.residualRate).toFixed(2));
  const teamSetupOverridePerDeal = parseFloat((setupFee * LEADER_COMMISSION.setupOverrideRate).toFixed(2));
  const teamResidualOverridePerClient = parseFloat((monthlyFee * LEADER_COMMISSION.residualOverrideRate).toFixed(2));

  const projections = Array.from({ length: months }, (_, i) => {
    const month = i + 1;
    return {
      month,
      mySetup: personalDeals * mySetupPerDeal,
      myResidual: month * personalDeals * myResidualPerClient,
      teamSetup: teamSize * teamDealsPerPartner * teamSetupOverridePerDeal,
      teamResidual: teamSize * month * teamDealsPerPartner * teamResidualOverridePerClient,
    };
  });

  const totals = projections.reduce(
    (acc, p) => ({
      mySetup: acc.mySetup + p.mySetup,
      myResidual: acc.myResidual + p.myResidual,
      teamSetup: acc.teamSetup + p.teamSetup,
      teamResidual: acc.teamResidual + p.teamResidual,
    }),
    { mySetup: 0, myResidual: 0, teamSetup: 0, teamResidual: 0 }
  );

  const grandTotal = totals.mySetup + totals.myResidual + totals.teamSetup + totals.teamResidual;
  const lastMonth = projections[projections.length - 1];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
        <Lock size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-900">Partner Leader — Internal Promotion Only</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Leadership is not available at signup. It is an earned position awarded internally to top-performing Sales Partners by OrenGen management.
            This calculator shows what a promoted Leader can earn on the <strong>{WEBSITE_PACKAGES[pkg].name}</strong> package.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Your Deals/Month", value: personalDeals, set: setPersonalDeals, min: 0, max: 50 },
          { label: "Team Size (partners)", value: teamSize, set: setTeamSize, min: 1, max: 100 },
          { label: "Avg Team Deals/Partner/Mo", value: teamDealsPerPartner, set: setTeamDealsPerPartner, min: 0, max: 20 },
          { label: "Projection (months)", value: months, set: setMonths, min: 1, max: 60 },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
            <input
              type="number" min={f.min} max={f.max} value={f.value}
              onChange={e => f.set(Math.max(f.min, Math.min(f.max, parseFloat(e.target.value) || f.min)))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Your Setup", value: totals.mySetup, sub: `${formatCurrency(personalDeals * mySetupPerDeal)}/mo`, highlight: false },
          { label: "Your Residual", value: totals.myResidual, sub: `${formatCurrency(lastMonth?.myResidual ?? 0)}/mo at end`, highlight: false },
          { label: "Team Setup Override", value: totals.teamSetup, sub: `${formatCurrency(teamSetupOverridePerDeal)}/deal × team`, highlight: true },
          { label: "Team Residual Override", value: totals.teamResidual, sub: `${formatCurrency(lastMonth?.teamResidual ?? 0)}/mo at end`, highlight: true },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border bg-white p-4 text-center ${s.highlight ? "border-amber-200" : "border-gray-200"}`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="font-bold text-base" style={{ color: s.highlight ? "#B45309" : "#003366" }}>{formatCurrency(s.value)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-5 text-center" style={{ backgroundColor: "#003366" }}>
        <p className="text-white/60 text-xs mb-1">{months}-month total as a Leader ({WEBSITE_PACKAGES[pkg].name} package)</p>
        <p className="text-3xl font-bold text-white">{formatCurrency(grandTotal)}</p>
        <p className="text-white/50 text-xs mt-1">
          {formatCurrency(totals.mySetup + totals.myResidual)} personal + {formatCurrency(totals.teamSetup + totals.teamResidual)} team overrides
        </p>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Assumes consistent team performance and zero churn. For illustration only.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  const [tab, setTab] = useState<Tab>("affiliate");
  const [pkg, setPkg] = useState<PkgKey>("STANDARD");

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calculator className="w-8 h-8" style={{ color: "#CC5500" }} />
          <h1 className="text-3xl font-bold" style={{ color: "#003366" }}>Earnings Calculator</h1>
        </div>
        <p className="text-gray-500">
          See what you could earn. Pick a package, choose your track, and adjust the numbers.
        </p>
      </div>

      {/* Package selector — shared across all tabs */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
        <PackageSelector value={pkg} onChange={setPkg} />
      </div>

      {/* Track tabs */}
      <div className="flex border-b border-gray-200">
        {([
          { key: "affiliate", label: "Affiliate", icon: <StarIcon size={15} /> },
          { key: "partner", label: "Sales Partner", icon: <TrendingUp size={15} /> },
          { key: "leader", label: "Partner Leader", icon: <Crown size={15} /> },
        ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              "flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.key ? "border-[#CC5500] text-[#CC5500]" : "border-transparent text-gray-500 hover:text-gray-800",
            ].join(" ")}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        {tab === "affiliate" && <AffiliateCalculator pkg={pkg} />}
        {tab === "partner" && <PartnerCalculator pkg={pkg} />}
        {tab === "leader" && <LeaderCalculator pkg={pkg} />}
      </div>

      <div className="text-center">
        <a
          href="/register"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: "#CC5500" }}
        >
          <DollarSign size={16} /> Join WeShare &amp; Start Earning
        </a>
      </div>
    </div>
  );
}

function StarIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

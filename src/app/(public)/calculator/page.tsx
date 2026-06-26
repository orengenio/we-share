"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Calculator, TrendingUp, Crown, DollarSign } from "lucide-react";
import { COMMISSION_CONFIGS, PARTNER_COMMISSION, LEADER_COMMISSION, PRODUCT_PRICING } from "@/types";
import { RANK_LABELS } from "@/lib/utils";

type Tab = "affiliate" | "partner" | "leader";

const RANK_ORDER = ["CATALYST", "BUILDER", "ARCHITECT", "SOVEREIGN"] as const;

// ─── Affiliate Calculator ─────────────────────────────────────────────────────

function AffiliateCalculator() {
  const [rank, setRank] = useState<string>("CATALYST");
  const [salesPerMonth, setSalesPerMonth] = useState(2);
  const [months, setMonths] = useState(12);

  const config = COMMISSION_CONFIGS[rank];

  const monthlySetup = salesPerMonth * config.setupFeeAmount;
  const projections = Array.from({ length: months }, (_, i) => {
    const month = i + 1;
    let residual = 0;
    // Sum residuals for all prior sales still active
    for (let sale = 1; sale <= month; sale++) {
      const monthsElapsed = month - sale + 1;
      const eligible = config.residualMonths === null || monthsElapsed <= config.residualMonths;
      if (eligible) residual += salesPerMonth * config.residualAmount;
    }
    return { month, setup: monthlySetup, residual };
  });

  const totalSetup = projections.reduce((s, p) => s + p.setup, 0);
  const totalResidual = projections.reduce((s, p) => s + p.residual, 0);
  const lastMonthResidual = projections[projections.length - 1]?.residual ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Your Rank</label>
          <select
            value={rank}
            onChange={e => setRank(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {RANK_ORDER.map(r => (
              <option key={r} value={r}>{RANK_LABELS[r]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Sales Per Month</label>
          <input
            type="number"
            min={1} max={100}
            value={salesPerMonth}
            onChange={e => setSalesPerMonth(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Projection (months)</label>
          <input
            type="number"
            min={1} max={60}
            value={months}
            onChange={e => setMonths(Math.max(1, Math.min(60, parseInt(e.target.value) || 12)))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      {/* Rate summary */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500 mb-1">Setup Rate</p>
          <p className="font-bold text-lg" style={{ color: "#003366" }}>{(config.setupFeeRate * 100).toFixed(0)}%</p>
          <p className="text-xs text-gray-400">{formatCurrency(config.setupFeeAmount)}/sale</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Residual Rate</p>
          <p className="font-bold text-lg" style={{ color: "#003366" }}>{(config.residualRate * 100).toFixed(1)}%</p>
          <p className="text-xs text-gray-400">{formatCurrency(config.residualAmount)}/mo/client</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Residual Duration</p>
          <p className="font-bold text-lg" style={{ color: "#003366" }}>
            {config.residualMonths === null ? "∞" : `${config.residualMonths} mo`}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Monthly at Mo.{months}</p>
          <p className="font-bold text-lg" style={{ color: "#CC5500" }}>{formatCurrency(lastMonthResidual)}</p>
          <p className="text-xs text-gray-400">residual income</p>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Total Setup</p>
          <p className="text-xl font-bold" style={{ color: "#003366" }}>{formatCurrency(totalSetup)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Total Residual</p>
          <p className="text-xl font-bold" style={{ color: "#003366" }}>{formatCurrency(totalResidual)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm" style={{ borderColor: "#CC5500" }}>
          <p className="text-xs text-gray-500 mb-1">Total {months}mo Earnings</p>
          <p className="text-xl font-bold" style={{ color: "#CC5500" }}>{formatCurrency(totalSetup + totalResidual)}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        * Estimates assume consistent sales pace. Residuals depend on client retention. No guarantee of income.
      </p>
    </div>
  );
}

// ─── Partner Calculator ───────────────────────────────────────────────────────

function PartnerCalculator() {
  const [dealsPerMonth, setDealsPerMonth] = useState(2);
  const [months, setMonths] = useState(12);

  const setupPerDeal = PARTNER_COMMISSION.setupFeeAmount;
  const residualPerClient = PARTNER_COMMISSION.residualAmount;

  const projections = Array.from({ length: months }, (_, i) => {
    const month = i + 1;
    const totalClients = month * dealsPerMonth; // all clients stay (for life)
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
        <p className="text-sm font-semibold text-orange-900 mb-1">Sales Partner Structure</p>
        <p className="text-xs text-orange-700">
          <strong>35% setup fee</strong> ({formatCurrency(PARTNER_COMMISSION.setupFeeAmount)}) on each new client +{" "}
          <strong>25% monthly residual</strong> ({formatCurrency(PARTNER_COMMISSION.residualAmount)}/mo) for the life of every client.
          There are no rank tiers — your income grows purely by adding clients.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Deals Closed Per Month</label>
          <input
            type="number"
            min={1} max={50}
            value={dealsPerMonth}
            onChange={e => setDealsPerMonth(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Projection (months)</label>
          <input
            type="number"
            min={1} max={60}
            value={months}
            onChange={e => setMonths(Math.max(1, Math.min(60, parseInt(e.target.value) || 12)))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Total Setup ({months} mo)</p>
          <p className="text-xl font-bold" style={{ color: "#003366" }}>{formatCurrency(totalSetup)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Residual at Mo.{months}</p>
          <p className="text-xl font-bold" style={{ color: "#003366" }}>{formatCurrency(monthlyResidualAtEnd)}/mo</p>
          <p className="text-xs text-gray-400">{months * dealsPerMonth} active clients</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm" style={{ borderColor: "#CC5500" }}>
          <p className="text-xs text-gray-500 mb-1">Total {months}mo Earnings</p>
          <p className="text-xl font-bold" style={{ color: "#CC5500" }}>{formatCurrency(totalSetup + totalResidual)}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        * Assumes zero client churn. Actual residuals depend on retention. For illustration only.
      </p>
    </div>
  );
}

// ─── Leader Calculator ────────────────────────────────────────────────────────

function LeaderCalculator() {
  const [personalDeals, setPersonalDeals] = useState(2);
  const [teamSize, setTeamSize] = useState(5);
  const [teamDealsPerPartnerPerMonth, setTeamDealsPerPartnerPerMonth] = useState(1);
  const [months, setMonths] = useState(12);

  const mySetupPerMonth = personalDeals * PARTNER_COMMISSION.setupFeeAmount;
  const myResidualPerMonth = (month: number) => month * personalDeals * PARTNER_COMMISSION.residualAmount;

  const teamSetupOverridePerMonth = teamSize * teamDealsPerPartnerPerMonth * LEADER_COMMISSION.setupOverrideAmount;
  const teamResidualOverridePerMonth = (month: number) =>
    teamSize * month * teamDealsPerPartnerPerMonth * LEADER_COMMISSION.residualOverrideAmount;

  const projections = Array.from({ length: months }, (_, i) => {
    const month = i + 1;
    return {
      month,
      mySetup: mySetupPerMonth,
      myResidual: myResidualPerMonth(month),
      teamSetupOverride: teamSetupOverridePerMonth,
      teamResidualOverride: teamResidualOverridePerMonth(month),
    };
  });

  const totals = projections.reduce(
    (acc, p) => ({
      mySetup: acc.mySetup + p.mySetup,
      myResidual: acc.myResidual + p.myResidual,
      teamSetup: acc.teamSetup + p.teamSetupOverride,
      teamResidual: acc.teamResidual + p.teamResidualOverride,
    }),
    { mySetup: 0, myResidual: 0, teamSetup: 0, teamResidual: 0 }
  );

  const grandTotal = totals.mySetup + totals.myResidual + totals.teamSetup + totals.teamResidual;
  const lastMonth = projections[projections.length - 1];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Crown size={15} className="text-amber-600" />
          <p className="text-sm font-semibold text-amber-900">Partner Leader Structure</p>
        </div>
        <p className="text-xs text-amber-700">
          Keep your full partner commissions (35% setup + 25% residual for life) PLUS earn{" "}
          <strong>5% of every team setup</strong> ({formatCurrency(LEADER_COMMISSION.setupOverrideAmount)}/deal) and{" "}
          <strong>5% of every team monthly residual</strong> ({formatCurrency(LEADER_COMMISSION.residualOverrideAmount)}/client/mo).
          Leadership is admin-promoted based on performance.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Your Deals/Month</label>
          <input type="number" min={0} max={50} value={personalDeals}
            onChange={e => setPersonalDeals(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Team Size (partners)</label>
          <input type="number" min={1} max={100} value={teamSize}
            onChange={e => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Avg Team Deals/Partner/Mo</label>
          <input type="number" min={0} max={20} step={0.5} value={teamDealsPerPartnerPerMonth}
            onChange={e => setTeamDealsPerPartnerPerMonth(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Projection (months)</label>
          <input type="number" min={1} max={60} value={months}
            onChange={e => setMonths(Math.max(1, Math.min(60, parseInt(e.target.value) || 12)))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Your Setup", value: formatCurrency(totals.mySetup), sub: `${formatCurrency(mySetupPerMonth)}/mo` },
          { label: "Your Residual", value: formatCurrency(totals.myResidual), sub: `${formatCurrency(lastMonth?.myResidual ?? 0)}/mo at end` },
          { label: "Team Setup Override", value: formatCurrency(totals.teamSetup), sub: `${formatCurrency(teamSetupOverridePerMonth)}/mo`, highlight: true },
          { label: "Team Residual Override", value: formatCurrency(totals.teamResidual), sub: `${formatCurrency(lastMonth?.teamResidualOverride ?? 0)}/mo at end`, highlight: true },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border bg-white p-4 text-center ${s.highlight ? "border-amber-200" : "border-gray-200"}`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="font-bold text-base" style={{ color: s.highlight ? "#B45309" : "#003366" }}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-5 text-center" style={{ backgroundColor: "#003366" }}>
        <p className="text-white/60 text-xs mb-1">{months}-month total earnings as a Leader</p>
        <p className="text-3xl font-bold text-white">{formatCurrency(grandTotal)}</p>
        <p className="text-white/50 text-xs mt-1">
          {formatCurrency(totals.mySetup + totals.myResidual)} personal + {formatCurrency(totals.teamSetup + totals.teamResidual)} team overrides
        </p>
      </div>

      <p className="text-xs text-gray-400 text-center">
        * Assumes consistent team performance and zero churn. For illustration only.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  const [tab, setTab] = useState<Tab>("affiliate");

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calculator className="w-8 h-8" style={{ color: "#CC5500" }} />
          <h1 className="text-3xl font-bold" style={{ color: "#003366" }}>Earnings Calculator</h1>
        </div>
        <p className="text-gray-500">
          See what you could earn in the WeShare program. Switch between tracks below.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {([
          { key: "affiliate", label: "Affiliate", icon: <Star size={15} /> },
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
        {tab === "affiliate" && <AffiliateCalculator />}
        {tab === "partner" && <PartnerCalculator />}
        {tab === "leader" && <LeaderCalculator />}
      </div>

      <div className="text-center">
        <a
          href="/register"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: "#CC5500" }}
        >
          <DollarSign size={16} /> Join WeShare & Start Earning
        </a>
      </div>
    </div>
  );
}

// needed for the affiliate tab
function Star({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

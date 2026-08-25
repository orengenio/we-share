"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import CalculatorNumberInput from "@/components/public/calculator-number-input";
import { TrendingUp, Crown, DollarSign, Lock } from "lucide-react";
import { COMMISSION_CONFIGS, PARTNER_COMMISSION, LEADER_COMMISSION, WEBSITE_PACKAGES } from "@/types";
import { RANK_LABELS } from "@/lib/utils";

type Tab = "affiliate" | "partner" | "leader";
type PkgKey = "STANDARD" | "PROFESSIONAL" | "PREMIUM";

const MUTED = "var(--ws-text-muted)";
const LINE  = "var(--ws-line)";
const SURF  = "var(--ws-panel-solid)";
const SURF2 = "var(--ws-panel-2)";

const RANK_ORDER = ["CATALYST", "BUILDER", "ARCHITECT", "SOVEREIGN"] as const;
const PKG_ORDER: PkgKey[] = ["STANDARD", "PROFESSIONAL", "PREMIUM"];

// ─── Package selector ─────────────────────────────────────────────────────────

function PackageSelector({ value, onChange }: { value: PkgKey; onChange: (k: PkgKey) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-2" style={{ color: "rgba(148,163,184,0.7)" }}>Website Package</label>
      <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
        {PKG_ORDER.map(k => (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            className="flex-1 py-2 text-xs font-semibold transition-all"
            style={value === k
              ? { backgroundColor: "#CC5500", color: "#fff" }
              : { background: "rgba(255,255,255,0.04)", color: MUTED }
            }
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
          <label className="block text-xs font-semibold mb-1" style={{ color: "rgba(148,163,184,0.7)" }}>Your Rank</label>
          <select
            value={rank}
            onChange={e => setRank(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${LINE}`, color: "white" }}
          >
            {RANK_ORDER.map(r => (
              <option key={r} value={r} style={{ background: "#00254B" }}>{RANK_LABELS[r]}</option>
            ))}
          </select>
        </div>
        <div>
          <CalculatorNumberInput
            label="Sales Per Month"
            value={salesPerMonth}
            onChange={setSalesPerMonth}
            min={0}
            step="any"
          />
        </div>
      </div>

      {/* Rate summary */}
      <div className="rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center" style={{ background: SURF2, border: `1px solid ${LINE}` }}>
        <div>
          <p className="text-xs mb-1" style={{ color: MUTED }}>Setup Rate</p>
          <p className="font-bold text-lg text-white">{(config.setupFeeRate * 100).toFixed(0)}%</p>
          <p className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>{formatCurrency(setupPerSale)}/sale</p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: MUTED }}>Residual Rate</p>
          <p className="font-bold text-lg text-white">{(config.residualRate * 100).toFixed(1)}%</p>
          <p className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>{formatCurrency(residualPerClient)}/mo/client</p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: MUTED }}>Residual Duration</p>
          <p className="font-bold text-lg text-white">
            {config.residualMonths === null ? "∞" : `${config.residualMonths} mo`}
          </p>
        </div>
        <div>
          <CalculatorNumberInput
            label="Projection (months)"
            value={months}
            onChange={setMonths}
            min={1}
            hint="Enter any timeframe — no cap"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-xl p-4 text-center" style={{ background: SURF, border: `1px solid ${LINE}` }}>
          <p className="text-xs mb-1" style={{ color: MUTED }}>Total Setup</p>
          <p className="text-xl font-bold text-white">{formatCurrency(totalSetup)}</p>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ background: SURF, border: `1px solid ${LINE}` }}>
          <p className="text-xs mb-1" style={{ color: MUTED }}>Total Residual</p>
          <p className="text-xl font-bold text-white">{formatCurrency(totalResidual)}</p>
          <p className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>{formatCurrency(lastMonthResidual)}/mo at end</p>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ background: "rgba(204,85,0,0.12)", border: "1px solid rgba(204,85,0,0.35)" }}>
          <p className="text-xs mb-1" style={{ color: MUTED }}>Total {months}mo Earnings</p>
          <p className="text-xl font-bold" style={{ color: "#CC5500" }}>{formatCurrency(totalSetup + totalResidual)}</p>
        </div>
      </div>

      <p className="text-xs text-center" style={{ color: "rgba(148,163,184,0.5)" }}>
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
      <div className="rounded-xl p-4" style={{ background: "rgba(204,85,0,0.1)", border: "1px solid rgba(204,85,0,0.25)" }}>
        <p className="text-sm font-semibold text-white mb-1">Sales Partner — {WEBSITE_PACKAGES[pkg].name} Package</p>
        <p className="text-xs" style={{ color: MUTED }}>
          <strong>25% setup fee</strong> ({formatCurrency(setupPerDeal)}/deal) +{" "}
          <strong>25% monthly residual</strong> ({formatCurrency(residualPerClient)}/mo) for the life of every client.
          Flat rate — no ranking system.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CalculatorNumberInput
          label="Deals Closed Per Month"
          value={dealsPerMonth}
          onChange={setDealsPerMonth}
          min={0}
          step="any"
        />
        <CalculatorNumberInput
          label="Projection (months)"
          value={months}
          onChange={setMonths}
          min={1}
        />
        <div className="flex flex-col justify-end">
          <div className="rounded-lg p-3 text-center" style={{ background: SURF2, border: `1px solid ${LINE}` }}>
            <p className="text-xs" style={{ color: MUTED }}>Residual at Mo.{months}</p>
            <p className="font-bold text-base text-white">{formatCurrency(monthlyResidualAtEnd)}/mo</p>
            <p className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>{months * dealsPerMonth} active clients</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl p-4 text-center" style={{ background: SURF, border: `1px solid ${LINE}` }}>
          <p className="text-xs mb-1" style={{ color: MUTED }}>Total Setup ({months} mo)</p>
          <p className="text-xl font-bold text-white">{formatCurrency(totalSetup)}</p>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ background: "rgba(204,85,0,0.12)", border: "1px solid rgba(204,85,0,0.35)" }}>
          <p className="text-xs mb-1" style={{ color: MUTED }}>Total {months}mo Earnings</p>
          <p className="text-xl font-bold" style={{ color: "#CC5500" }}>{formatCurrency(totalSetup + totalResidual)}</p>
        </div>
      </div>

      <p className="text-xs text-center" style={{ color: "rgba(148,163,184,0.5)" }}>
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
      <div className="rounded-xl p-4 flex gap-3" style={{ background: "var(--ws-orange-soft)", border: "1px solid rgba(232,118,43,0.3)" }}>
        <Lock size={16} className="mt-0.5 shrink-0" style={{ color: "var(--ws-orange-bright)" }} />
        <div>
          <p className="text-sm font-semibold text-white">Partner Leader — Internal Promotion Only</p>
          <p className="text-xs mt-0.5" style={{ color: MUTED }}>
            Leadership is not available at signup. It is an earned position awarded internally to top-performing Sales Partners by OrenGen management.
            This calculator shows what a promoted Leader can earn on the <strong>{WEBSITE_PACKAGES[pkg].name}</strong> package.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <CalculatorNumberInput label="Your Deals/Month" value={personalDeals} onChange={setPersonalDeals} min={0} step="any" />
        <CalculatorNumberInput label="Team Size (partners)" value={teamSize} onChange={setTeamSize} min={0} />
        <CalculatorNumberInput label="Avg Team Deals/Partner/Mo" value={teamDealsPerPartner} onChange={setTeamDealsPerPartner} min={0} step="any" />
        <CalculatorNumberInput label="Projection (months)" value={months} onChange={setMonths} min={1} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Your Setup", value: totals.mySetup, sub: `${formatCurrency(personalDeals * mySetupPerDeal)}/mo`, amber: false },
          { label: "Your Residual", value: totals.myResidual, sub: `${formatCurrency(lastMonth?.myResidual ?? 0)}/mo at end`, amber: false },
          { label: "Team Setup Override", value: totals.teamSetup, sub: `${formatCurrency(teamSetupOverridePerDeal)}/deal × team`, amber: true },
          { label: "Team Residual Override", value: totals.teamResidual, sub: `${formatCurrency(lastMonth?.teamResidual ?? 0)}/mo at end`, amber: true },
        ].map(s => (
          <div
            key={s.label}
            className="rounded-xl p-4 text-center"
            style={s.amber
              ? { background: "var(--ws-orange-soft)", border: "1px solid rgba(232,118,43,0.3)" }
              : { background: SURF, border: `1px solid ${LINE}` }
            }
          >
            <p className="text-xs mb-1" style={{ color: MUTED }}>{s.label}</p>
            <p className="font-bold text-base" style={{ color: s.amber ? "var(--ws-orange-bright)" : "white" }}>{formatCurrency(s.value)}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-5 text-center" style={{ background: "rgba(0,37,75,0.8)", border: `1px solid rgba(148,163,184,0.22)` }}>
        <p className="text-xs mb-1" style={{ color: "rgba(203,213,225,0.6)" }}>{months}-month total as a Leader ({WEBSITE_PACKAGES[pkg].name} package)</p>
        <p className="text-3xl font-black text-white">{formatCurrency(grandTotal)}</p>
        <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.5)" }}>
          {formatCurrency(totals.mySetup + totals.myResidual)} personal + {formatCurrency(totals.teamSetup + totals.teamResidual)} team overrides
        </p>
      </div>

      <p className="text-xs text-center" style={{ color: "rgba(148,163,184,0.5)" }}>
        Assumes consistent team performance and zero churn. For illustration only.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EarningsCalculator() {
  const [tab, setTab] = useState<Tab>("affiliate");
  const [pkg, setPkg] = useState<PkgKey>("STANDARD");

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2 text-center">
        <span className="ws-eyebrow mx-auto">Earnings Calculator</span>
        <h1 className="ws-display mx-auto mt-5" style={{ fontSize: "clamp(28px,4vw,44px)" }}>What could you earn?</h1>
        <p style={{ color: MUTED }}>
          Pick a package, choose your track, and adjust the numbers.
        </p>
      </div>

      {/* Package selector */}
      <div className="rounded-xl p-5" style={{ background: SURF, border: `1px solid ${LINE}`, backdropFilter: "blur(10px)" }}>
        <PackageSelector value={pkg} onChange={setPkg} />
      </div>

      {/* Track tabs */}
      <div className="flex" style={{ borderBottom: `1px solid ${LINE}` }}>
        {([
          { key: "affiliate", label: "Referral Partner", icon: <StarIcon size={15} /> },
          { key: "partner", label: "Sales Partner", icon: <TrendingUp size={15} /> },
          { key: "leader", label: "Partner Leader", icon: <Crown size={15} /> },
        ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors"
            style={tab === t.key
              ? { borderColor: "#CC5500", color: "#CC5500" }
              : { borderColor: "transparent", color: MUTED }
            }
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl p-6" style={{ background: SURF, border: `1px solid ${LINE}`, backdropFilter: "blur(10px)" }}>
        {tab === "affiliate" && <AffiliateCalculator pkg={pkg} />}
        {tab === "partner" && <PartnerCalculator pkg={pkg} />}
        {tab === "leader" && <LeaderCalculator pkg={pkg} />}
      </div>

      <div className="text-center">
        <a href="/register" className="ws-cta">
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

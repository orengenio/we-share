"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { formatCompact } from "@/lib/calculator-utils";
import CalculatorNumberInput from "@/components/public/calculator-number-input";
import { INFLUENCER_COMMISSION, PARTNER_COMMISSION, WEBSITE_PACKAGES } from "@/types";
import { Sparkles, Users, Network, TrendingUp, Radio } from "lucide-react";

type PkgKey = "STANDARD" | "PROFESSIONAL" | "PREMIUM";

const MUTED = "rgba(203,213,225,0.75)";
const LINE = "rgba(148,163,184,0.18)";
const SURF = "rgba(255,255,255,0.06)";
const SURF2 = "rgba(255,255,255,0.09)";
const PKG_ORDER: PkgKey[] = ["STANDARD", "PROFESSIONAL", "PREMIUM"];

function PackageSelector({ value, onChange }: { value: PkgKey; onChange: (k: PkgKey) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-2" style={{ color: "rgba(148,163,184,0.7)" }}>
        Website package (avg deal size)
      </label>
      <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
        {PKG_ORDER.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            className="flex-1 py-2 text-xs font-semibold transition-all"
            style={
              value === k
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

export default function InfluencerCalculator() {
  const [pkg, setPkg] = useState<PkgKey>("STANDARD");
  const [salesPartners, setSalesPartners] = useState(10);
  const [dealsPerPartner, setDealsPerPartner] = useState(2);
  const [subInfluencers, setSubInfluencers] = useState(0);
  const [partnersPerSub, setPartnersPerSub] = useState(5);
  const [dealsPerSubPartner, setDealsPerSubPartner] = useState(2);
  const [months, setMonths] = useState(24);
  const [followers, setFollowers] = useState(1_000_000);
  const [partnerConversionPct, setPartnerConversionPct] = useState(0.001);
  const [showReachModel, setShowReachModel] = useState(false);

  const { setupFee, monthlyFee } = WEBSITE_PACKAGES[pkg];
  const setupOverride = setupFee * INFLUENCER_COMMISSION.setupOverrideRate;
  const residualOverride = monthlyFee * INFLUENCER_COMMISSION.residualOverrideRate;

  const projections = useMemo(() => {
    const rows: {
      month: number;
      directSetup: number;
      directResidual: number;
      subSetup: number;
      subResidual: number;
    }[] = [];

    for (let m = 1; m <= months; m++) {
      const directClients = m * salesPartners * dealsPerPartner;
      const subClients = m * subInfluencers * partnersPerSub * dealsPerSubPartner;

      rows.push({
        month: m,
        directSetup: salesPartners * dealsPerPartner * setupOverride,
        directResidual: directClients * residualOverride,
        subSetup: subInfluencers * partnersPerSub * dealsPerSubPartner * setupOverride,
        subResidual: subClients * residualOverride,
      });
    }
    return rows;
  }, [
    months,
    salesPartners,
    dealsPerPartner,
    subInfluencers,
    partnersPerSub,
    dealsPerSubPartner,
    setupOverride,
    residualOverride,
  ]);

  const totals = projections.reduce(
    (acc, p) => ({
      directSetup: acc.directSetup + p.directSetup,
      directResidual: acc.directResidual + p.directResidual,
      subSetup: acc.subSetup + p.subSetup,
      subResidual: acc.subResidual + p.subResidual,
    }),
    { directSetup: 0, directResidual: 0, subSetup: 0, subResidual: 0 }
  );

  const last = projections[projections.length - 1];
  const monthlyAtEnd =
    (last?.directSetup ?? 0) +
    (last?.directResidual ?? 0) +
    (last?.subSetup ?? 0) +
    (last?.subResidual ?? 0);
  const grandTotal =
    totals.directSetup + totals.directResidual + totals.subSetup + totals.subResidual;

  const reachEstimatedPartners = Math.floor(followers * (partnerConversionPct / 100));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{ background: "rgba(204,85,0,0.15)", color: "#FDBA74", border: "1px solid rgba(204,85,0,0.3)" }}>
          <Sparkles size={14} /> Ambassador · Invite Only
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Influencer &amp; Celebrity Earnings Model
        </h1>
        <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: MUTED }}>
          Model your network: <strong className="text-white">5% of every setup fee</strong> and{" "}
          <strong className="text-white">5% of monthly residual</strong> for the life of each client —
          on all Sales Partner volume you bring in, plus the same on any Ambassador you recruit.
        </p>
      </div>

      <div className="rounded-xl p-5 space-y-4" style={{ background: SURF, border: `1px solid ${LINE}` }}>
        <PackageSelector value={pkg} onChange={setPkg} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="rounded-lg p-3" style={{ background: SURF2 }}>
            <p style={{ color: MUTED }}>Your setup override</p>
            <p className="font-bold text-white text-sm">{formatCurrency(setupOverride)}/deal</p>
          </div>
          <div className="rounded-lg p-3" style={{ background: SURF2 }}>
            <p style={{ color: MUTED }}>Your residual override</p>
            <p className="font-bold text-white text-sm">{formatCurrency(residualOverride)}/mo/client</p>
          </div>
          <div className="rounded-lg p-3" style={{ background: SURF2 }}>
            <p style={{ color: MUTED }}>Partner earns (ref)</p>
            <p className="font-bold text-white text-sm">
              {formatCurrency(setupFee * PARTNER_COMMISSION.setupFeeRate)}/deal
            </p>
          </div>
          <div className="rounded-lg p-3" style={{ background: SURF2 }}>
            <p style={{ color: MUTED }}>Partner residual (ref)</p>
            <p className="font-bold text-white text-sm">
              {formatCurrency(monthlyFee * PARTNER_COMMISSION.residualRate)}/mo
            </p>
          </div>
        </div>
      </div>

      {/* Direct network */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: SURF, border: `1px solid ${LINE}` }}>
        <div className="flex items-center gap-2">
          <Users size={18} style={{ color: "#CC5500" }} />
          <h2 className="text-sm font-bold text-white">Your direct Sales Partners</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CalculatorNumberInput
            label="Active Sales Partners"
            value={salesPartners}
            onChange={setSalesPartners}
            min={0}
            hint="Partners you personally recruited"
          />
          <CalculatorNumberInput
            label="Avg deals closed / partner / month"
            value={dealsPerPartner}
            onChange={setDealsPerPartner}
            min={0}
            step="any"
          />
          <CalculatorNumberInput
            label="Projection (months)"
            value={months}
            onChange={setMonths}
            min={1}
            hint="No cap — model 5, 10, or 20+ years"
          />
        </div>
      </div>

      {/* Sub-ambassadors */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: SURF, border: `1px solid ${LINE}` }}>
        <div className="flex items-center gap-2">
          <Network size={18} style={{ color: "#FCD34D" }} />
          <h2 className="text-sm font-bold text-white">Ambassadors you recruit (optional)</h2>
        </div>
        <p className="text-xs" style={{ color: MUTED }}>
          Each Ambassador you bring in earns the same 5% / 5% deal on their own network — and you
          also earn 5% / 5% on everything their network produces.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CalculatorNumberInput
            label="Sub-Ambassadors (celebrities)"
            value={subInfluencers}
            onChange={setSubInfluencers}
            min={0}
          />
          <CalculatorNumberInput
            label="Avg partners per Sub-Ambassador"
            value={partnersPerSub}
            onChange={setPartnersPerSub}
            min={0}
          />
          <CalculatorNumberInput
            label="Avg deals / their partner / month"
            value={dealsPerSubPartner}
            onChange={setDealsPerSubPartner}
            min={0}
            step="any"
          />
        </div>
      </div>

      {/* Reach model */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
        <button
          type="button"
          onClick={() => setShowReachModel(!showReachModel)}
          className="flex items-center gap-2 text-sm font-semibold text-white w-full text-left"
        >
          <Radio size={16} style={{ color: "#FCD34D" }} />
          {showReachModel ? "Hide" : "Show"} audience reach estimator
        </button>
        {showReachModel && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <CalculatorNumberInput
              label="Total followers / audience reach"
              value={followers}
              onChange={setFollowers}
              min={0}
              hint={`${formatCompact(followers)} people`}
            />
            <CalculatorNumberInput
              label="Partner signup rate (% of audience)"
              value={partnerConversionPct}
              onChange={setPartnerConversionPct}
              min={0}
              step="any"
              hint="Even 0.001% on 5M = 50 partners"
            />
            <div className="sm:col-span-2 rounded-lg p-4 text-center" style={{ background: SURF2 }}>
              <p className="text-xs" style={{ color: MUTED }}>Estimated partners from reach (illustrative)</p>
              <p className="text-2xl font-black text-white">{reachEstimatedPartners.toLocaleString()}</p>
              <button
                type="button"
                onClick={() => setSalesPartners(reachEstimatedPartners)}
                className="mt-2 text-xs font-semibold underline"
                style={{ color: "#CC5500" }}
              >
                Apply to Active Sales Partners →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Direct setup overrides", value: totals.directSetup, accent: false },
          { label: "Direct residual overrides", value: totals.directResidual, accent: false },
          { label: "Sub-Ambassador setup", value: totals.subSetup, accent: true },
          { label: "Sub-Ambassador residual", value: totals.subResidual, accent: true },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4 text-center"
            style={
              s.accent
                ? { background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }
                : { background: SURF, border: `1px solid ${LINE}` }
            }
          >
            <p className="text-xs mb-1" style={{ color: MUTED }}>{s.label}</p>
            <p className="font-bold text-base" style={{ color: s.accent ? "#FCD34D" : "white" }}>
              {formatCurrency(s.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-6 text-center space-y-2" style={{ background: "rgba(0,37,75,0.85)", border: `1px solid ${LINE}` }}>
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider" style={{ color: MUTED }}>
          <TrendingUp size={14} /> {months}-month projection
        </div>
        <p className="text-4xl font-black text-white">{formatCurrency(grandTotal)}</p>
        <p className="text-sm" style={{ color: "#CC5500" }}>
          {formatCurrency(monthlyAtEnd)}/mo run-rate in month {months}
        </p>
        <p className="text-xs max-w-lg mx-auto pt-2" style={{ color: "rgba(148,163,184,0.5)" }}>
          Assumes consistent partner performance and zero client churn. Overrides are on{" "}
          <strong>gross</strong> setup ({formatCurrency(setupFee)}) and monthly ({formatCurrency(monthlyFee)})
          — not on the partner&apos;s 25% share. For illustration only; not a guarantee of income.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { Crown, Trophy, TrendingUp, Users, Star } from "lucide-react";
import { RANK_COLORS, RANK_LABELS } from "@/lib/utils";

interface AffiliateEntry {
  rank: number;
  displayName: string;
  affiliateRank: string;
  lifetimeSales: number;
  totalEarned: number;
  memberSince: string;
}

interface PartnerEntry {
  rank: number;
  displayName: string;
  dealsWon: number;
  totalEarned: number;
  isLeader: boolean;
  memberSince: string;
}

interface LeaderEntry {
  rank: number;
  displayName: string;
  teamSize: number;
  personalDealsWon: number;
  leaderOverrides: number;
  totalEarned: number;
  memberSince: string;
}

type Tab = "affiliates" | "partners" | "leaders";

const MUTED = "rgba(203,213,225,0.75)";
const LINE  = "rgba(148,163,184,0.18)";
const SURF  = "rgba(255,255,255,0.06)";
const MEDAL = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("affiliates");
  const [data, setData] = useState<{
    affiliates: AffiliateEntry[];
    partners: PartnerEntry[];
    leaders: LeaderEntry[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/leaderboard")
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Trophy className="w-8 h-8" style={{ color: "#CC5500" }} />
          <h1 className="text-3xl font-black text-white">Leaderboard</h1>
        </div>
        <p className="max-w-xl mx-auto" style={{ color: MUTED }}>
          The top performers in the WeShare referral partner and sales partner program. Earn commissions, build your team, and climb the ranks.
        </p>
        <a
          href="/register"
          className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#CC5500", boxShadow: "0 4px 16px rgba(204,85,0,0.3)" }}
        >
          Join &amp; Compete
        </a>
        <p className="max-w-2xl mx-auto text-xs pt-3" style={{ color: "rgba(148,163,184,0.6)" }}>
          These are the program&apos;s top performers. Earnings shown are not typical —
          most participants earn less, and results depend on individual effort and client retention.
          See the{" "}
          <a href="/docs/earnings-disclaimer.pdf" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#CC5500" }}>
            Earnings Disclaimer
          </a>
          .
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1" style={{ borderBottom: `1px solid ${LINE}` }}>
        {([
          { key: "affiliates", label: "Referral Partners", icon: <Star size={15} /> },
          { key: "partners", label: "Sales Partners", icon: <TrendingUp size={15} /> },
          { key: "leaders", label: "Leaders", icon: <Crown size={15} /> },
        ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors"
            style={tab === t.key
              ? { borderColor: "#CC5500", color: "#CC5500" }
              : { borderColor: "transparent", color: MUTED }
            }
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: SURF }} />
          ))}
        </div>
      ) : !data ? (
        <p className="text-center py-12" style={{ color: MUTED }}>Could not load leaderboard.</p>
      ) : tab === "affiliates" ? (
        <AffiliatesBoard entries={data.affiliates} />
      ) : tab === "partners" ? (
        <PartnersBoard entries={data.partners} />
      ) : (
        <LeadersBoard entries={data.leaders} />
      )}
    </div>
  );
}

function RankBadge({ pos }: { pos: number }) {
  if (pos <= 3) {
    return <span className="text-2xl leading-none">{MEDAL[pos - 1]}</span>;
  }
  return (
    <span
      className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold"
      style={{ background: "rgba(255,255,255,0.08)", color: MUTED }}
    >
      {pos}
    </span>
  );
}

function AffiliatesBoard({ entries }: { entries: AffiliateEntry[] }) {
  if (entries.length === 0) return <EmptyState msg="No referral partner data yet. Be the first!" />;
  return (
    <div className="space-y-2">
      {entries.map(e => (
        <div
          key={e.rank}
          className="flex items-center gap-4 p-4 rounded-xl"
          style={e.rank <= 3
            ? { background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }
            : { background: SURF, border: `1px solid ${LINE}` }
          }
        >
          <RankBadge pos={e.rank} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{e.displayName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${RANK_COLORS[e.affiliateRank] ?? "bg-gray-100 text-gray-600"}`}>
                {RANK_LABELS[e.affiliateRank as keyof typeof RANK_LABELS] ?? e.affiliateRank}
              </span>
              <span className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>{e.lifetimeSales} sales</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-lg text-white">{formatCurrency(e.totalEarned)}</p>
            <p className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>total earned</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PartnersBoard({ entries }: { entries: PartnerEntry[] }) {
  if (entries.length === 0) return <EmptyState msg="No partner data yet." />;
  return (
    <div className="space-y-2">
      {entries.map(e => (
        <div
          key={e.rank}
          className="flex items-center gap-4 p-4 rounded-xl"
          style={e.rank <= 3
            ? { background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }
            : { background: SURF, border: `1px solid ${LINE}` }
          }
        >
          <RankBadge pos={e.rank} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-white truncate">{e.displayName}</p>
              {e.isLeader && (
                <span
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold"
                  style={{ background: "rgba(251,191,36,0.15)", color: "#FCD34D" }}
                >
                  <Crown size={9} /> LEADER
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>{e.dealsWon} deals closed</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-lg text-white">{formatCurrency(e.totalEarned)}</p>
            <p className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>total earned</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function LeadersBoard({ entries }: { entries: LeaderEntry[] }) {
  if (entries.length === 0) {
    return <EmptyState msg="No leaders yet. Earn your Leadership promotion." />;
  }
  return (
    <div className="space-y-2">
      <p className="text-xs pb-1" style={{ color: "rgba(148,163,184,0.5)" }}>
        Leaders earn 5% of their team&apos;s setup + 5% of monthly residuals on top of their personal commissions.
      </p>
      {entries.map(e => (
        <div
          key={e.rank}
          className="flex items-center gap-4 p-4 rounded-xl"
          style={e.rank <= 3
            ? { background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }
            : { background: SURF, border: `1px solid ${LINE}` }
          }
        >
          <RankBadge pos={e.rank} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Crown size={14} style={{ color: "#FCD34D" }} className="shrink-0" />
              <p className="font-semibold text-white truncate">{e.displayName}</p>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs flex items-center gap-1" style={{ color: "rgba(148,163,184,0.5)" }}><Users size={11} /> {e.teamSize} team</span>
              <span className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>{e.personalDealsWon} personal deals</span>
            </div>
          </div>
          <div className="text-right shrink-0 space-y-0.5">
            <p className="font-bold text-lg text-white">{formatCurrency(e.totalEarned)}</p>
            <p className="text-xs font-medium" style={{ color: "#FCD34D" }}>{formatCurrency(e.leaderOverrides)} overrides</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="py-16 text-center">
      <Trophy className="w-12 h-12 mx-auto mb-3" style={{ color: "rgba(148,163,184,0.2)" }} />
      <p className="text-sm" style={{ color: MUTED }}>{msg}</p>
      <a href="/register" className="inline-block mt-4 text-sm font-semibold underline" style={{ color: "#CC5500" }}>
        Join WeShare
      </a>
    </div>
  );
}

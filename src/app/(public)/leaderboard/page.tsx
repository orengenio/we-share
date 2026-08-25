"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { Crown, Trophy, TrendingUp, Users, Star } from "lucide-react";
import { RANK_LABELS } from "@/lib/utils";

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

const TEXT = "var(--ws-text)";
const MUTED = "var(--ws-text-muted)";
const SOFT = "var(--ws-text-soft)";
const ORANGE = "var(--ws-orange-bright)";
const LINE = "var(--ws-line)";

const PANEL = { background: "var(--ws-panel-solid)", border: "1px solid var(--ws-line)" };
const TOP = { background: "rgba(232,118,43,0.08)", border: "1px solid rgba(232,118,43,0.32)" };

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
      <div className="space-y-2 text-center">
        <span className="ws-eyebrow mx-auto">Leaderboard</span>
        <h1 className="ws-display mx-auto mt-5" style={{ fontSize: "clamp(30px,4vw,48px)" }}>Top performers</h1>
        <p className="mx-auto max-w-xl" style={{ color: MUTED }}>
          The top performers in the WeShare referral partner and sales partner program. Earn
          commissions, build your team, and climb the ranks.
        </p>
        <div className="pt-2">
          <a href="/register" className="ws-cta">Join &amp; Compete</a>
        </div>
        <p className="mx-auto max-w-2xl pt-3 text-xs" style={{ color: SOFT }}>
          These are the program&apos;s top performers. Earnings shown are not typical — most
          participants earn less, and results depend on individual effort and client retention. See the{" "}
          <a href="/earnings-disclaimer" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: ORANGE }}>
            Earnings Disclaimer
          </a>.
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
            className="-mb-px flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-semibold transition-colors"
            style={tab === t.key
              ? { borderColor: "var(--ws-orange-bright)", color: ORANGE }
              : { borderColor: "transparent", color: MUTED }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl" style={{ background: "var(--ws-panel-2)" }} />
          ))}
        </div>
      ) : !data ? (
        <p className="py-12 text-center" style={{ color: MUTED }}>Could not load leaderboard.</p>
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
  const top = pos <= 3;
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black"
      style={top
        ? { background: "var(--ws-orange)", color: "#fff" }
        : { background: "var(--ws-panel-2)", color: MUTED }}
    >
      {pos}
    </span>
  );
}

function Row({ top, children }: { top: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-xl p-4" style={top ? TOP : PANEL}>
      {children}
    </div>
  );
}

function AffiliatesBoard({ entries }: { entries: AffiliateEntry[] }) {
  if (entries.length === 0) return <EmptyState msg="No referral partner data yet. Be the first!" />;
  return (
    <div className="space-y-2">
      {entries.map(e => (
        <Row key={e.rank} top={e.rank <= 3}>
          <RankBadge pos={e.rank} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold" style={{ color: TEXT }}>{e.displayName}</p>
            <div className="mt-0.5 flex items-center gap-2">
              <span
                className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold"
                style={{ background: "var(--ws-panel-2)", color: MUTED }}
              >
                {RANK_LABELS[e.affiliateRank as keyof typeof RANK_LABELS] ?? e.affiliateRank}
              </span>
              <span className="text-xs" style={{ color: SOFT }}>{e.lifetimeSales} sales</span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold" style={{ color: TEXT }}>{formatCurrency(e.totalEarned)}</p>
            <p className="text-xs" style={{ color: SOFT }}>total earned</p>
          </div>
        </Row>
      ))}
    </div>
  );
}

function PartnersBoard({ entries }: { entries: PartnerEntry[] }) {
  if (entries.length === 0) return <EmptyState msg="No partner data yet." />;
  return (
    <div className="space-y-2">
      {entries.map(e => (
        <Row key={e.rank} top={e.rank <= 3}>
          <RankBadge pos={e.rank} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold" style={{ color: TEXT }}>{e.displayName}</p>
              {e.isLeader && (
                <span
                  className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold"
                  style={{ background: "var(--ws-orange-soft)", color: ORANGE }}
                >
                  <Crown size={9} /> LEADER
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs" style={{ color: SOFT }}>{e.dealsWon} deals closed</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold" style={{ color: TEXT }}>{formatCurrency(e.totalEarned)}</p>
            <p className="text-xs" style={{ color: SOFT }}>total earned</p>
          </div>
        </Row>
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
      <p className="pb-1 text-xs" style={{ color: SOFT }}>
        Leaders earn 5% of their team&apos;s setup + 5% of monthly residuals on top of their personal commissions.
      </p>
      {entries.map(e => (
        <Row key={e.rank} top={e.rank <= 3}>
          <RankBadge pos={e.rank} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Crown size={14} style={{ color: ORANGE }} className="shrink-0" />
              <p className="truncate font-semibold" style={{ color: TEXT }}>{e.displayName}</p>
            </div>
            <div className="mt-0.5 flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs" style={{ color: SOFT }}><Users size={11} /> {e.teamSize} team</span>
              <span className="text-xs" style={{ color: SOFT }}>{e.personalDealsWon} personal deals</span>
            </div>
          </div>
          <div className="shrink-0 space-y-0.5 text-right">
            <p className="text-lg font-bold" style={{ color: TEXT }}>{formatCurrency(e.totalEarned)}</p>
            <p className="text-xs font-medium" style={{ color: ORANGE }}>{formatCurrency(e.leaderOverrides)} overrides</p>
          </div>
        </Row>
      ))}
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="py-16 text-center">
      <Trophy className="mx-auto mb-3 h-12 w-12" style={{ color: "var(--ws-text-soft)" }} />
      <p className="text-sm" style={{ color: MUTED }}>{msg}</p>
      <a href="/register" className="mt-4 inline-block text-sm font-semibold underline" style={{ color: ORANGE }}>
        Join WeShare
      </a>
    </div>
  );
}

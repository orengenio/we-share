import type { Metadata } from "next";
import {
  Mail, Headphones, Calendar, Check, Bot, Clock, Puzzle, Lock,
  BarChart3, Users, ArrowRight, ShieldCheck, Globe, Zap, Phone,
} from "lucide-react";
import { OrenGenWordmark, WsMonogram } from "@/components/brand/orengen-marks";

export const metadata: Metadata = {
  title: "Brand System",
  description: "The WeShare ⨯ OrenGen visual system — colors, type, and components.",
};

const PALETTE = [
  { name: "Canvas", value: "#05070d", token: "--ws-bg" },
  { name: "Canvas 2", value: "#0a1120", token: "--ws-bg-2" },
  { name: "Panel", value: "#0c1728", token: "--ws-panel-solid" },
  { name: "Navy", value: "#00254B", token: "--ws-navy" },
  { name: "Orange", value: "#CC5500", token: "--ws-orange" },
  { name: "Orange Bright", value: "#E8762B", token: "--ws-orange-bright" },
  { name: "Standard", value: "#3b82f6", token: "--ws-tier-standard" },
  { name: "Professional", value: "#22c55e", token: "--ws-tier-pro" },
];

const PRODUCT_CARDS = [
  {
    glow: "orange" as const,
    icon: Mail,
    title: "Email Manager",
    items: ["Compose", "Respond", "Organize"],
  },
  {
    glow: "pro" as const,
    icon: Headphones,
    title: "Client Support",
    items: ["Answer Queries", "Resolve Issues", "24/7 Availability"],
  },
  {
    glow: "standard" as const,
    icon: Calendar,
    title: "Scheduler",
    items: ["Book Meetings", "Manage Calendar", "Send Reminders"],
  },
];

const SERVICES = [
  { icon: Bot, label: "AI Agents" },
  { icon: Phone, label: "AI Voice" },
  { icon: Users, label: "CRM & Automation" },
  { icon: Zap, label: "Lead Generation" },
  { icon: Globe, label: "Secure Websites" },
  { icon: Puzzle, label: "Custom Systems" },
];

const STATS = [
  { label: "Leads", value: "1,248", delta: "+28%", up: true },
  { label: "Opportunities", value: "342", delta: "+18%", up: true },
  { label: "Conversion Rate", value: "24.6%", delta: "+16%", up: true },
  { label: "Pipeline Value", value: "$2.48M", delta: "+31%", up: true },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div
        className="text-[12px] font-extrabold uppercase tracking-[0.28em]"
        style={{ color: "var(--ws-text-soft)" }}
      >
        {children}
      </div>
      <div className="ws-rule mt-2" />
    </div>
  );
}

export default function BrandPage() {
  return (
    <div className="ws-shell min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* ── Masthead ─────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6"
             style={{ borderColor: "var(--ws-line)" }}>
          <div className="flex items-center gap-4">
            <WsMonogram size={40} />
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-black tracking-tight" style={{ color: "var(--ws-text)" }}>
                WeShare
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em]"
                    style={{ color: "var(--ws-text-soft)" }}>
                by OrenGen
              </span>
            </div>
          </div>
          <OrenGenWordmark height={30} />
        </div>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="grid gap-10 py-14 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <span className="ws-eyebrow">Brand System</span>
            <h1 className="ws-display mt-6">
              One brand.<br />
              <span className="ws-display--accent">Billion-dollar</span> feel.
            </h1>
            <p className="ws-lead mt-6 max-w-xl">
              The WeShare partner portal now speaks the same visual language as the
              OrenGen campaign: near-black navy canvases, a single vivid-orange master
              accent, heavy Public Sans display type, and governed, premium detailing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="ws-cta" href="#components">
                Explore the system <ArrowRight size={16} />
              </a>
              <a className="ws-cta ws-cta--outline" href="#dashboard">
                Dashboard kit
              </a>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="ws-seal">
              <div className="ws-seal-core">
                ORENGEN<br />WORLDWIDE<br />
                <span style={{ fontSize: 9, fontWeight: 800 }}>EST. 2018</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Palette ──────────────────────────────────────────────────────── */}
        <section className="py-10">
          <SectionLabel>Color · Master accent is orange on near-black navy</SectionLabel>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {PALETTE.map((c) => (
              <div key={c.token} className="ws-stat-card">
                <div
                  className="mb-3 h-16 w-full rounded-lg"
                  style={{ background: c.value, border: "1px solid var(--ws-line-strong)" }}
                />
                <div className="text-sm font-bold" style={{ color: "var(--ws-text)" }}>{c.name}</div>
                <div className="text-[12px]" style={{ color: "var(--ws-text-soft)" }}>{c.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Typography ───────────────────────────────────────────────────── */}
        <section className="py-10">
          <SectionLabel>Typography · Public Sans across the board</SectionLabel>
          <div className="ws-stat-card space-y-4">
            <div className="ws-display" style={{ fontSize: "clamp(30px,5vw,56px)" }}>
              Display 900 <span className="ws-display--accent">Accent</span>
            </div>
            <div className="ws-subhead">Subhead 700 — <span className="ws-subhead--accent">tireless. scalable.</span></div>
            <p className="ws-lead max-w-2xl">
              Body / lead 500 — Public Sans keeps the entire ecosystem consistent, from
              the recruiting deck to the marketing site to this partner portal.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="ws-eyebrow">Master · Orange</span>
              <span className="ws-eyebrow" data-tier="standard">Standard · Blue</span>
              <span className="ws-eyebrow" data-tier="pro">Professional · Green</span>
            </div>
          </div>
        </section>

        {/* ── Glow product cards ───────────────────────────────────────────── */}
        <section id="components" className="py-10">
          <SectionLabel>Glow cards · Neon product tiles from the campaign creative</SectionLabel>
          <div className="grid gap-5 md:grid-cols-3">
            {PRODUCT_CARDS.map(({ glow, icon: Icon, title, items }) => (
              <div key={title} className="ws-glow-card" data-glow={glow}>
                <div className="ws-icon-tile mb-4"><Icon size={24} /></div>
                <div className="text-lg font-extrabold uppercase tracking-wide"
                     style={{ color: "var(--ws-text)" }}>{title}</div>
                <ul className="mt-4 space-y-2">
                  {items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-sm"
                        style={{ color: "var(--ws-text-muted)" }}>
                      <Check size={16} className="ws-check" /> {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Service icon row ─────────────────────────────────────────────── */}
        <section className="py-10">
          <SectionLabel>Iconography · Thin-line service tiles</SectionLabel>
          <div className="ws-trust-bar" style={{ justifyContent: "space-between" }}>
            {SERVICES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <span className="ws-icon-tile ws-icon-tile--round"><Icon size={22} /></span>
                <span className="text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: "var(--ws-text-muted)" }}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Dashboard stat kit ───────────────────────────────────────────── */}
        <section id="dashboard" className="py-10">
          <SectionLabel>Dashboard · Dark stat cards (partner portal reference)</SectionLabel>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="ws-stat-card">
                <div className="ws-stat-label">{s.label}</div>
                <div className="mt-2 flex items-end justify-between">
                  <span className="ws-stat-value">{s.value}</span>
                  <span className={s.up ? "ws-delta-up" : "ws-delta-down"}>{s.delta}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA + corner brackets ────────────────────────────────────────── */}
        <section className="py-10">
          <SectionLabel>Call to action · Orange, corner-bracketed</SectionLabel>
          <div className="ws-bracket ws-stat-card flex flex-wrap items-center justify-between gap-5"
               style={{ padding: "26px 28px" }}>
            <div className="flex items-center gap-4">
              <span className="ws-icon-tile"><Calendar size={22} /></span>
              <div>
                <div className="text-xl font-black uppercase tracking-wide"
                     style={{ color: "var(--ws-text)" }}>Book a Strategy Session</div>
                <div className="text-sm" style={{ color: "var(--ws-text-soft)" }}>
                  api.orengen.io/booking/coffeechat
                </div>
              </div>
            </div>
            <a className="ws-cta" href="#">
              Get started <ArrowRight size={16} />
            </a>
          </div>
        </section>

        {/* ── Trust bar ────────────────────────────────────────────────────── */}
        <section className="py-10">
          <SectionLabel>Credential bar · Governed systems, founder-stage execution</SectionLabel>
          <div className="ws-trust-bar">
            <span className="ws-trust-item"><ShieldCheck size={14} /> BBB Accredited</span>
            <span className="ws-trust-item"><Globe size={14} /> SAM.gov Registered</span>
            <span className="ws-trust-item"><Lock size={14} /> CAGE 12XC1</span>
            <span className="ws-trust-item"><BarChart3 size={14} /> UEI RX16QFYT6YM5</span>
            <span className="ws-trust-item"><Clock size={14} /> A2P 10DLC + SHAKEN/STIR</span>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="mt-6 flex items-center justify-between border-t pt-6 text-[12px]"
             style={{ borderColor: "var(--ws-line)", color: "var(--ws-text-soft)" }}>
          <span>OrenGen Worldwide Sales Partner Program • Powered by WeShare</span>
          <span>weshare.orengen.io</span>
        </div>
      </div>
    </div>
  );
}

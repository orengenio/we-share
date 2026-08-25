import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionFromCookies } from "@/lib/auth";
import { Check, ArrowRight, Share2, TrendingUp } from "lucide-react";
import { WEBSITE_PACKAGES } from "@/types";
import PublicHeader from "@/components/public/header";
import { OrenGenWordmark } from "@/components/brand/orengen-marks";

const PANEL = { background: "var(--ws-panel-solid)", border: "1px solid var(--ws-line)" };
const TEXT = "var(--ws-text)";
const MUTED = "var(--ws-text-muted)";
const SOFT = "var(--ws-text-soft)";
const ORANGE = "var(--ws-orange-bright)";

const TRACKS = [
  {
    icon: Share2,
    name: "Referral Partner",
    desc: "Share your unique link. When someone becomes an OrenGen website client through it, you earn upfront and every month they stay active.",
    features: [
      "10–25% setup commission (by rank)",
      "5–10% monthly residual (rank-based)",
      "Army Builder — earn on your recruits too",
      "$50 fast-start bonus on first sale",
    ],
    example: "Standard package (Catalyst rank): $99.70 setup + $12.35/mo",
    href: "/register?type=AFFILIATE",
    cta: "Join as Referral Partner",
  },
  {
    icon: TrendingUp,
    name: "Sales Partner",
    desc: "Work directly with OrenGen's sales team. Close deals on any package and earn the highest flat rates on every client you bring in.",
    features: [
      "25% of setup fee on every deal",
      "25% monthly residual — for life",
      "Works on all 3 packages",
      "$50 fast-start bonus on first deal",
    ],
    example: "Standard package: $249.25 setup + $61.75/mo",
    href: "/register?type=PARTNER",
    cta: "Apply as Sales Partner",
  },
];

const STEPS = [
  { step: "1", title: "Create your free account", desc: "Pick your track — Referral or Sales Partner. No setup cost, no credit card." },
  { step: "2", title: "Get your unique link", desc: "Your personal referral link and partner code are ready the moment you sign up." },
  { step: "3", title: "Earn every Friday", desc: "Approved commissions are paid every Friday via Stripe. $25 minimum balance." },
];

function SectionHead({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      {eyebrow && <span className="ws-eyebrow mb-5">{eyebrow}</span>}
      <h2 className="ws-display mt-5" style={{ fontSize: "clamp(28px,4vw,44px)" }}>{title}</h2>
      {sub && <p className="ws-lead mx-auto mt-4">{sub}</p>}
    </div>
  );
}

export default async function Home() {
  const session = await getSessionFromCookies();
  if (session?.role === "ADMIN")     redirect("/admin");
  if (session?.role === "AFFILIATE") redirect("/affiliate");
  if (session?.role === "PARTNER")   redirect("/partner");

  const packages = [
    WEBSITE_PACKAGES.STANDARD,
    WEBSITE_PACKAGES.PROFESSIONAL,
    WEBSITE_PACKAGES.PREMIUM,
  ];

  return (
    <div className="ws-shell min-h-screen">
      <PublicHeader />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="px-6 pt-24 pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="ws-eyebrow">OrenGen Website Partner Program</span>
          <h1 className="ws-display mt-7">
            Get paid to sell<br />
            <span className="ws-display--accent">premium websites.</span>
          </h1>
          <p className="ws-lead mx-auto mt-6 max-w-xl">
            Refer clients or close deals on OrenGen&apos;s website packages. Earn a
            setup commission upfront — then collect a residual every month they stay active.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register?type=AFFILIATE" className="ws-cta">
              Start as a Referral Partner <ArrowRight size={16} />
            </Link>
            <Link href="/register?type=PARTNER" className="ws-cta ws-cta--outline">
              Become a Sales Partner
            </Link>
          </div>
          <p className="mt-6 text-sm" style={{ color: SOFT }}>
            Free to join · No credit card · Paid every Friday
          </p>
        </div>
      </section>

      {/* ── Packages ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <SectionHead
            eyebrow="The Offer"
            title="Three packages. One program."
            sub="Every OrenGen website package earns commissions. The higher the package, the bigger your payout."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {packages.map((pkg, i) => {
              const isPopular = i === 1;
              const partnerSetup = (pkg.setupFee * 0.25).toFixed(2);
              const partnerMonthly = (pkg.monthlyFee * 0.25).toFixed(2);
              return (
                <div
                  key={pkg.key}
                  className="relative flex flex-col rounded-2xl p-7"
                  style={isPopular
                    ? { background: "rgba(204,85,0,0.08)", border: "1px solid rgba(232,118,43,0.5)" }
                    : PANEL}
                >
                  {isPopular && (
                    <span
                      className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white"
                      style={{ background: "var(--ws-orange)" }}
                    >
                      Most Popular
                    </span>
                  )}
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em]" style={{ color: ORANGE }}>
                    {pkg.name}
                  </p>
                  <p className="mt-2 text-3xl font-black" style={{ color: TEXT, letterSpacing: "-0.03em" }}>
                    ${pkg.monthlyFee}<span className="text-lg font-bold" style={{ color: SOFT }}>/mo</span>
                  </p>
                  <p className="mt-1 text-xs" style={{ color: SOFT }}>
                    + ${pkg.setupFee.toLocaleString()} one-time setup
                  </p>
                  <hr className="my-5" style={{ borderColor: "var(--ws-line)" }} />
                  <ul className="mb-6 flex-1 space-y-2.5">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm" style={{ color: MUTED }}>
                        <Check size={15} className="mt-0.5 shrink-0" style={{ color: ORANGE }} /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-xl p-3 text-center" style={{ background: "var(--ws-panel-2)" }}>
                    <p className="text-xs" style={{ color: SOFT }}>Partner earns</p>
                    <p className="mt-0.5 text-sm font-bold" style={{ color: TEXT }}>
                      ${partnerSetup} setup + ${partnerMonthly}/mo
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs" style={{ color: SOFT }}>
            Referral commissions vary by rank (10–25% setup, 5–10% residual). Sales Partner: flat 25% on all packages.{" "}
            <Link href="/calculator" className="font-semibold underline" style={{ color: ORANGE }}>Use the calculator →</Link>
          </p>
        </div>
      </section>

      {/* ── Two ways to earn ──────────────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <SectionHead
            eyebrow="Your Path"
            title="Two ways to earn"
            sub="Share a link or close a deal — pick the model that fits you."
          />
          <div className="grid gap-5 md:grid-cols-2">
            {TRACKS.map(({ icon: Icon, name, desc, features, example, href, cta }) => (
              <div key={name} className="flex flex-col rounded-2xl p-8" style={PANEL}>
                <span className="ws-icon-tile mb-5"><Icon size={22} /></span>
                <h3 className="text-xl font-black" style={{ color: TEXT, letterSpacing: "-0.02em" }}>{name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: MUTED }}>{desc}</p>
                <ul className="my-6 space-y-2.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: MUTED }}>
                      <Check size={15} style={{ color: ORANGE }} /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mb-5 rounded-xl p-3 text-center text-sm" style={{ background: "var(--ws-panel-2)", color: TEXT }}>
                  {example}
                </div>
                <Link href={href} className="ws-cta w-full">{cta}</Link>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed" style={{ color: SOFT }}>
            <span className="font-semibold" style={{ color: MUTED }}>Partner Leader</span> is an internal role
            awarded to high-performing Sales Partners by OrenGen — earned, not applied for. Leaders keep full
            commissions plus 5% of team setup and residual.
          </p>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <SectionHead title="Get started in minutes" />
          <div className="grid gap-10 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.step} className="text-center">
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-lg font-black text-white"
                  style={{ background: "var(--ws-orange)" }}
                >
                  {s.step}
                </div>
                <h3 className="font-bold" style={{ color: TEXT }}>{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: MUTED }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl p-12 text-center" style={PANEL}>
          <h2 className="ws-display" style={{ fontSize: "clamp(26px,3.6vw,40px)" }}>Ready to start earning?</h2>
          <p className="ws-lead mx-auto mt-4 max-w-lg">
            Join as a Referral Partner and share links, or apply as a Sales Partner and close deals directly.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register" className="ws-cta">Create free account <ArrowRight size={16} /></Link>
            <Link href="/calculator" className="ws-cta ws-cta--outline">Try the calculator</Link>
          </div>
          <p className="mt-6 text-sm" style={{ color: SOFT }}>
            Questions? <a href="tel:8336736436" className="underline" style={{ color: MUTED }}>833-673-6436</a>
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t px-6 py-10" style={{ borderColor: "var(--ws-line)" }}>
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <OrenGenWordmark height={26} />
          <div className="flex flex-wrap items-center justify-center gap-5 text-sm" style={{ color: SOFT }}>
            <Link href="/leaderboard" className="transition-colors hover:text-white">Leaderboard</Link>
            <Link href="/calculator" className="transition-colors hover:text-white">Calculator</Link>
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
            <Link href="/login" className="transition-colors hover:text-white">Sign In</Link>
            <Link href="/register" className="font-bold" style={{ color: ORANGE }}>Join Free</Link>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed" style={{ color: SOFT }}>
          © {new Date().getFullYear()} OrenGen Worldwide LLC · WeShare Referral &amp; Sales Partner Program. Partners are
          independent contractors. Earnings, ranks, and percentages shown are illustrative — not guarantees — and vary
          with effort, skill, and client retention. Partners must disclose their material connection (e.g. #ad) when
          promoting, per the FTC Endorsement Guides.
        </p>
      </footer>
    </div>
  );
}

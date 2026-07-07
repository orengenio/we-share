import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSessionFromCookies } from "@/lib/auth";
import { CheckCircle, ArrowRight, Lock } from "lucide-react";
import { WEBSITE_PACKAGES } from "@/types";
import PublicHeader from "@/components/public/header";

const LINE  = "rgba(148,163,184,0.2)";
const SURF  = "rgba(255,255,255,0.07)";
const MUTED = "rgba(203,213,225,0.75)";

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
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(165deg, #001F3F 0%, #00254B 35%, #003D7A 70%, #002952 100%)",
        fontFamily: "'Public Sans', system-ui, sans-serif",
        color: "#f8fafc",
      }}
    >

      <PublicHeader />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="eyebrow mb-6 mx-auto w-fit">
            OrenGen Website Partner Program
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-none mb-6"
            style={{ letterSpacing: "-0.05em", color: "#f8fafc" }}
          >
            Get Paid to Sell<br />
            <span style={{ color: "#CC5500" }}>Premium Websites.</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: MUTED }}>
            Refer clients or close deals on OrenGen&apos;s website packages.
            Earn a setup commission upfront — then collect a residual every single month they stay active.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register?type=AFFILIATE"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white text-sm"
              style={{ background: "#CC5500", boxShadow: "0 14px 36px rgba(204,85,0,0.3)" }}
            >
              Start as a Referral Partner <ArrowRight size={16} />
            </Link>
            <Link
              href="/register?type=PARTNER"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm"
              style={{ background: SURF, border: `1px solid ${LINE}`, color: "#f8fafc" }}
            >
              Become a Sales Partner <ArrowRight size={16} />
            </Link>
          </div>
          <p className="mt-5 text-sm" style={{ color: "rgba(148,163,184,0.65)" }}>
            Free to join · No credit card · Paid every Friday
          </p>
        </div>
      </section>

      {/* ── Website Packages ───────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="eyebrow mx-auto w-fit mb-4">The Offer</div>
            <h2
              className="text-3xl sm:text-4xl font-black mb-4"
              style={{ color: "#f8fafc", letterSpacing: "-0.04em" }}
            >
              Three Packages. One Program.
            </h2>
            <p style={{ color: MUTED, maxWidth: "480px", margin: "0 auto" }}>
              Every OrenGen website package earns commissions. The higher the package, the bigger your payout.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {packages.map((pkg, i) => {
              const isPopular      = i === 1;
              const partnerSetup   = (pkg.setupFee   * 0.25).toFixed(2);
              const partnerMonthly = (pkg.monthlyFee * 0.25).toFixed(2);
              return (
                <div
                  key={pkg.key}
                  className="rounded-2xl p-7 relative flex flex-col transition-all duration-300"
                  style={{
                    border:     isPopular ? "1px solid rgba(204,85,0,0.5)" : `1px solid ${LINE}`,
                    background: isPopular ? "rgba(204,85,0,0.1)" : SURF,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span
                        className="text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest"
                        style={{ background: "#CC5500" }}
                      >
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <div className="mb-3">
                    <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "#CC5500" }}>
                      {pkg.name}
                    </p>
                    <p className="text-2xl font-black" style={{ color: "#f8fafc", letterSpacing: "-0.04em" }}>
                      ${pkg.monthlyFee}/mo
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.65)" }}>
                      + ${pkg.setupFee.toLocaleString()} one-time setup
                    </p>
                  </div>
                  <hr style={{ borderColor: LINE, margin: "14px 0" }} />
                  <ul className="space-y-2 mb-6 flex-1">
                    {pkg.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm" style={{ color: MUTED }}>
                        <CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: "#CC5500" }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div
                    className="rounded-xl p-3 text-center"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${LINE}` }}
                  >
                    <p className="text-xs mb-0.5" style={{ color: "rgba(148,163,184,0.6)" }}>Partner earns</p>
                    <p className="font-bold text-sm" style={{ color: "#f8fafc" }}>
                      ${partnerSetup} setup + ${partnerMonthly}/mo
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "rgba(148,163,184,0.55)" }}>
            Referral Partner commissions vary by rank (10–25% setup, 5–10% residual). Sales Partner: flat 25% on all packages.{" "}
            <Link href="/calculator" className="underline" style={{ color: "#CC5500" }}>Use the calculator →</Link>
          </p>
        </div>
      </section>

      {/* ── Two tracks ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="eyebrow mx-auto w-fit mb-4">Your Path</div>
            <h2
              className="text-3xl sm:text-4xl font-black mb-3"
              style={{ color: "#f8fafc", letterSpacing: "-0.04em" }}
            >
              Two Ways to Earn
            </h2>
            <p style={{ color: MUTED }}>Share a link or close a deal — pick the model that fits you.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Referral Partner */}
            <div
              className="rounded-2xl p-8 flex flex-col"
              style={{ border: `1px solid ${LINE}`, background: SURF, backdropFilter: "blur(12px)" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "rgba(0,37,75,0.6)", border: `1px solid ${LINE}` }}
              >
                <svg width={22} height={22} viewBox="0 0 24 24" fill="#CC5500">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-black mb-2" style={{ color: "#f8fafc", letterSpacing: "-0.03em" }}>
                Referral Partner
              </h3>
              <p className="text-sm mb-5 leading-relaxed flex-1" style={{ color: MUTED }}>
                Share your unique link. When someone becomes an OrenGen website client through your link,
                you earn a commission upfront and every month they stay active.
              </p>
              <ul className="space-y-2.5 mb-6">
                {[
                  "10–25% setup commission (by rank)",
                  "5–10% monthly residual (rank-based)",
                  "Army Builder — earn on your recruits too",
                  "$50 fast-start bonus on first sale",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: MUTED }}>
                    <CheckCircle size={14} style={{ color: "#CC5500" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <div
                className="rounded-xl p-3 text-center mb-4"
                style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${LINE}` }}
              >
                <p className="text-xs mb-0.5" style={{ color: "rgba(148,163,184,0.6)" }}>Standard package (Catalyst rank)</p>
                <p className="font-bold text-sm" style={{ color: "#f8fafc" }}>$99.70 setup + $12.35/mo</p>
              </div>
              <Link
                href="/register?type=AFFILIATE"
                className="block text-center py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "#CC5500", boxShadow: "0 8px 24px rgba(204,85,0,0.28)" }}
              >
                Join as Referral Partner
              </Link>
            </div>

            {/* Sales Partner */}
            <div
              className="rounded-2xl p-8 flex flex-col"
              style={{
                border: "1px solid rgba(204,85,0,0.3)",
                background: "rgba(204,85,0,0.08)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "rgba(204,85,0,0.15)", border: "1px solid rgba(204,85,0,0.3)" }}
              >
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#CC5500" strokeWidth={2}>
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <h3 className="text-xl font-black mb-2" style={{ color: "#f8fafc", letterSpacing: "-0.03em" }}>
                Sales Partner
              </h3>
              <p className="text-sm mb-5 leading-relaxed flex-1" style={{ color: MUTED }}>
                Work directly with OrenGen&apos;s sales team. Close deals on any of the three packages,
                earn the highest flat rates — on every client you bring in, forever.
              </p>
              <ul className="space-y-2.5 mb-6">
                {[
                  "25% of setup fee on every deal",
                  "25% monthly residual — for life",
                  "Works on all 3 packages",
                  "$50 fast-start bonus on first deal",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: MUTED }}>
                    <CheckCircle size={14} style={{ color: "#CC5500" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <div
                className="rounded-xl p-3 text-center mb-4"
                style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${LINE}` }}
              >
                <p className="text-xs mb-0.5" style={{ color: "rgba(148,163,184,0.6)" }}>Standard package</p>
                <p className="font-bold text-sm" style={{ color: "#f8fafc" }}>$249.25 setup + $61.75/mo</p>
              </div>
              <Link
                href="/register?type=PARTNER"
                className="block text-center py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "#CC5500", boxShadow: "0 8px 24px rgba(204,85,0,0.28)" }}
              >
                Apply as Sales Partner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partner Leader ─────────────────────────────────────────────────── */}
      <section className="py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-2xl p-6 flex items-start gap-4"
            style={{
              border: "1px solid rgba(245,158,11,0.3)",
              background: "rgba(245,158,11,0.07)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}
            >
              <Lock size={18} style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <p className="font-bold mb-1.5" style={{ color: "#f59e0b" }}>
                Partner Leader — Earned, Not Applied For
              </p>
              <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                Partner Leadership is an internal position awarded exclusively to high-performing Sales Partners by OrenGen management.
                It is <strong style={{ color: "#f8fafc" }}>not available at registration</strong> and cannot be purchased or requested.
                Promoted Leaders keep their full partner commissions (25% setup + 25% residual) and additionally earn{" "}
                <strong style={{ color: "#f8fafc" }}>5% of every team setup fee</strong> and{" "}
                <strong style={{ color: "#f8fafc" }}>5% of every team monthly residual</strong> — on any package.{" "}
                <Link href="/calculator" className="underline font-semibold" style={{ color: "#CC5500" }}>
                  See the Leader calculator →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl font-black mb-3"
              style={{ color: "#f8fafc", letterSpacing: "-0.04em" }}
            >
              Get Started in Minutes
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create your free account", desc: "Pick your track — Referral Partner or Sales Partner. Zero setup cost, no credit card required." },
              { step: "02", title: "Get your unique link",     desc: "Your personal referral link and partner code are ready immediately after signup." },
              { step: "03", title: "Earn every Friday",        desc: "Approved commissions are paid every Friday via Stripe direct deposit. $25 minimum balance." },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-base mx-auto mb-4"
                  style={{ background: "#CC5500", boxShadow: "0 8px 24px rgba(204,85,0,0.3)" }}
                >
                  {s.step}
                </div>
                <h3 className="font-bold mb-2" style={{ color: "#f8fafc" }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature grid ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl font-black mb-3"
              style={{ color: "#f8fafc", letterSpacing: "-0.04em" }}
            >
              Built for Long-Term Earners
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "💸", title: "Paid Every Friday",      desc: "Commissions released every Friday via Stripe direct deposit. $25 minimum balance." },
              { icon: "📅", title: "Residuals Stack Monthly", desc: "Every client adds a compounding monthly residual — for as long as they stay active." },
              { icon: "🔒", title: "30-Day Clawback Only",    desc: "After 30 days your client is locked. No retroactive reversals after the protection window." },
              { icon: "📊", title: "Real-Time Dashboard",     desc: "Track clicks, leads, earnings, commissions, and payout history in one place." },
            ].map(f => (
              <div
                key={f.title}
                className="rounded-2xl p-6"
                style={{ border: `1px solid ${LINE}`, background: SURF, backdropFilter: "blur(12px)" }}
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h4 className="font-bold mb-2" style={{ color: "#f8fafc" }}>{f.title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="rounded-2xl p-12"
            style={{ border: `1px solid ${LINE}`, background: SURF, backdropFilter: "blur(12px)" }}
          >
            <h2
              className="text-3xl sm:text-4xl font-black mb-4"
              style={{ color: "#f8fafc", letterSpacing: "-0.04em" }}
            >
              Ready to Start Earning?
            </h2>
            <p className="mb-8" style={{ color: MUTED }}>
              Join as a Referral Partner and share links, or apply as a Sales Partner and close deals directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white"
                style={{ background: "#CC5500", boxShadow: "0 14px 36px rgba(204,85,0,0.3)" }}
              >
                Create Free Account <ArrowRight size={16} />
              </Link>
              <Link
                href="/calculator"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold"
                style={{ background: SURF, border: `1px solid ${LINE}`, color: "#f8fafc" }}
              >
                Try the Calculator
              </Link>
            </div>
            <p className="mt-6 text-sm" style={{ color: "rgba(148,163,184,0.6)" }}>
              Questions?{" "}
              <a href="tel:8336736436" className="underline" style={{ color: MUTED }}>833-673-6436</a>
              {" "}or{" "}
              <a href="mailto:sales@orengen.io" className="underline" style={{ color: MUTED }}>sales@orengen.io</a>
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        className="py-8 px-6 border-t"
        style={{ borderColor: LINE, background: "rgba(0,37,75,0.35)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="https://orengen.io" target="_blank" rel="noopener noreferrer">
            <Image
              src="https://cdn.content360.io/ea2381f4-12e0-4efd-b95b-6012c981eae0/uploads/05-2026/wJb1wZczjrrxwoRKmtjrspq1IJwjW00FtCsIfdn6.png"
              alt="OrenGen Worldwide"
              width={100}
              height={25}
              unoptimized
            />
          </a>
          <div className="flex items-center gap-5 text-sm flex-wrap justify-center" style={{ color: "rgba(148,163,184,0.6)" }}>
            <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
            <Link href="/calculator"  className="hover:text-white transition-colors">Calculator</Link>
            <a href="/docs/privacy-policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy</a>
            <a href="/docs/program-terms.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms</a>
            <a href="/docs/earnings-disclaimer.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Disclaimer</a>
            <Link href="/login"       className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register"    className="font-bold hover:text-white transition-colors" style={{ color: "#CC5500" }}>Join Free</Link>
          </div>
        </div>
        <p className="text-center text-xs mt-4 leading-relaxed max-w-3xl mx-auto" style={{ color: "rgba(148,163,184,0.45)" }}>
          © {new Date().getFullYear()} OrenGen Worldwide LLC · WeShare Referral Partner &amp; Sales Partner Program<br />
          Partners are independent contractors. Commissions are earned only on completed customer sales; any earnings,
          ranks, or percentages shown are illustrative projections — <strong>not guarantees</strong> — and individual
          results vary with effort, skill, and client retention. Partners must disclose their material connection
          (e.g. #ad) when promoting, per the FTC Endorsement Guides.
        </p>
      </footer>
    </div>
  );
}

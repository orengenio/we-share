import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionFromCookies } from "@/lib/auth";
import { CheckCircle, ArrowRight, Lock } from "lucide-react";
import { WEBSITE_PACKAGES } from "@/types";

export default async function Home() {
  const session = await getSessionFromCookies();
  if (session?.role === "ADMIN") redirect("/admin");
  if (session?.role === "AFFILIATE") redirect("/affiliate");
  if (session?.role === "PARTNER") redirect("/partner");

  const packages = [
    WEBSITE_PACKAGES.STANDARD,
    WEBSITE_PACKAGES.PROFESSIONAL,
    WEBSITE_PACKAGES.PREMIUM,
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg font-bold text-white text-sm" style={{ backgroundColor: "#CC5500" }}>
              WS
            </div>
            <div>
              <p className="font-bold text-base leading-tight tracking-tight" style={{ color: "#003366" }}>WeShare</p>
              <p className="text-gray-400 text-[11px] leading-none tracking-wide uppercase">by OrenGen</p>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/leaderboard" className="text-gray-600 hover:text-gray-900 font-medium hidden sm:block">Leaderboard</Link>
            <Link href="/calculator" className="text-gray-600 hover:text-gray-900 font-medium hidden sm:block">Calculator</Link>
            <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: "#CC5500" }}>
              Join Now
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">Sign In</Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-16 px-6" style={{ background: "linear-gradient(135deg, #003366 0%, #00285a 100%)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide mb-6 text-white/80 border border-white/20">
            OrenGen Website Partner Program
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
            Get Paid to Sell<br />
            <span style={{ color: "#FF8C42" }}>Premium AI Websites.</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            Refer clients or close deals on OrenGen&apos;s website packages.
            Earn a setup commission upfront — then collect a residual every single month they stay active.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register?type=AFFILIATE"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white text-sm"
              style={{ backgroundColor: "#CC5500" }}
            >
              Start as an Affiliate <ArrowRight size={16} />
            </Link>
            <Link
              href="/register?type=PARTNER"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
            >
              Become a Sales Partner <ArrowRight size={16} />
            </Link>
          </div>
          <p className="mt-5 text-sm text-blue-200">
            Free to join · No credit card · Paid every Friday
          </p>
        </div>
      </section>

      {/* ── Website Packages ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#003366" }}>Three Packages. One Program.</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Every OrenGen website package is eligible for commissions. The higher the package, the bigger your payout.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg, i) => {
              const isPopular = i === 1;
              const partnerSetup = (pkg.setupFee * 0.25).toFixed(2);
              const partnerMonthly = (pkg.monthlyFee * 0.25).toFixed(2);
              return (
                <div
                  key={pkg.key}
                  className={`rounded-2xl p-7 relative ${isPopular ? "shadow-lg" : "shadow-sm border border-gray-100"}`}
                  style={isPopular ? { backgroundColor: "#003366" } : { backgroundColor: "white" }}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wide" style={{ backgroundColor: "#CC5500" }}>MOST POPULAR</span>
                    </div>
                  )}
                  <div className="mb-2">
                    <p className={`text-xs font-bold tracking-wide uppercase mb-1 ${isPopular ? "text-orange-300" : "text-gray-400"}`}>{pkg.name}</p>
                    <p className={`text-2xl font-bold ${isPopular ? "text-white" : ""}`} style={isPopular ? {} : { color: "#003366" }}>${pkg.monthlyFee}/mo</p>
                    <p className={`text-xs ${isPopular ? "text-blue-300" : "text-gray-400"}`}>+ ${pkg.setupFee.toLocaleString()} one-time setup</p>
                  </div>
                  <hr className={`my-4 ${isPopular ? "border-white/20" : "border-gray-100"}`} />
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: isPopular ? "#FF8C42" : "#CC5500" }} />
                        <span className={isPopular ? "text-blue-100" : "text-gray-600"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className={`rounded-xl p-3 text-center ${isPopular ? "bg-white/10" : "bg-blue-50"}`}>
                    <p className={`text-xs mb-0.5 ${isPopular ? "text-blue-300" : "text-gray-500"}`}>Partner earns</p>
                    <p className={`font-bold text-sm ${isPopular ? "text-white" : ""}`} style={isPopular ? {} : { color: "#003366" }}>
                      ${partnerSetup} setup + ${partnerMonthly}/mo
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Affiliate commissions vary by rank (10–25% setup, 5–10% residual). Sales Partner: flat 25% on all packages.
            {" "}<Link href="/calculator" className="underline" style={{ color: "#CC5500" }}>Use the calculator →</Link>
          </p>
        </div>
      </section>

      {/* ── Two tracks ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#003366" }}>Two Ways to Earn</h2>
            <p className="text-gray-500">Share a link or close a deal — pick the model that fits you.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Affiliate */}
            <div className="rounded-2xl border border-gray-100 p-8 bg-white shadow-sm">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "#e8eef7" }}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="#003366"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "#003366" }}>Affiliate</h3>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                Share your unique link. When someone becomes an OrenGen website client through your link, you earn a commission upfront and every month they stay active.
              </p>
              <ul className="space-y-2.5 mb-6">
                {[
                  "10–25% setup commission (by rank)",
                  "5–10% monthly residual (rank-based)",
                  "Army Builder — earn on your recruits too",
                  "$50 fast-start bonus on first sale",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle size={15} style={{ color: "#CC5500" }} />
                    <span className="text-gray-700">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "#e8eef7" }}>
                <p className="text-xs text-gray-500 mb-0.5">Standard package (Catalyst rank)</p>
                <p className="font-bold" style={{ color: "#003366" }}>$99.70 setup + $12.35/mo</p>
              </div>
              <Link
                href="/register?type=AFFILIATE"
                className="mt-4 block text-center py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: "#003366" }}
              >
                Join as Affiliate
              </Link>
            </div>

            {/* Sales Partner */}
            <div className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: "#003366" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 bg-white/10">
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Sales Partner</h3>
              <p className="text-blue-200 text-sm mb-5 leading-relaxed">
                Work directly with OrenGen&apos;s sales team. Close deals on any of the three packages, earn the highest flat rates — on every client you bring in, forever.
              </p>
              <ul className="space-y-2.5 mb-6">
                {[
                  "25% of setup fee on every deal",
                  "25% monthly residual — for life",
                  "Works on all 3 packages",
                  "$50 fast-start bonus on first deal",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle size={15} style={{ color: "#FF8C42" }} />
                    <span className="text-blue-100">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-xl p-3 text-center bg-white/10">
                <p className="text-xs text-blue-300 mb-0.5">Standard package</p>
                <p className="font-bold text-white">$249.25 setup + $61.75/mo</p>
              </div>
              <Link
                href="/register?type=PARTNER"
                className="mt-4 block text-center py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{ backgroundColor: "#CC5500", color: "white" }}
              >
                Join as Sales Partner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partner Leader — internal note ─────────────────────────────────── */}
      <section className="py-10 px-6 bg-amber-50 border-y border-amber-100">
        <div className="max-w-4xl mx-auto flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#CC5500" }}>
            <Lock size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-1">Partner Leader — Earned, Not Applied For</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Partner Leadership is an internal position awarded exclusively to high-performing Sales Partners by OrenGen management.
              It is <strong>not available at registration</strong> and cannot be purchased or requested.
              Promoted Leaders keep their full partner commissions (25% setup + 25% residual) and additionally earn
              <strong> 5% of every team setup fee</strong> and <strong>5% of every team monthly residual</strong> — on any package.
              {" "}<Link href="/calculator" className="underline font-semibold" style={{ color: "#CC5500" }}>See the Leader calculator →</Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#003366" }}>Get Started in Minutes</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create your free account", desc: "Pick your track — Affiliate or Sales Partner. Zero setup cost, no credit card required." },
              { step: "02", title: "Get your unique link", desc: "Your personal referral link and partner code are ready immediately after signup." },
              { step: "03", title: "Earn every Friday", desc: "Approved commissions are paid every Friday via Stripe direct deposit. $25 minimum balance." },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg mx-auto mb-4" style={{ backgroundColor: "#CC5500" }}>
                  {s.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why WeShare ────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#003366" }}>Built for Long-Term Earners</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "💸", title: "Paid Every Friday", desc: "Commissions are released every Friday via Stripe direct deposit. $25 minimum balance required." },
              { icon: "📅", title: "Residuals Stack Monthly", desc: "Every client you bring in adds to a compounding monthly residual — for as long as they stay." },
              { icon: "🔒", title: "30-Day Clawback Only", desc: "After 30 days, your client is locked. No retroactive reversals after the protection window." },
              { icon: "📊", title: "Real-Time Dashboard", desc: "Track clicks, leads, earnings, commissions, and payout history in one place." },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h4 className="font-bold text-gray-900 mb-2">{f.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: "#003366" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Earning?</h2>
          <p className="text-blue-200 mb-8">
            Join as an Affiliate and share links, or apply as a Sales Partner and close deals directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-bold text-white"
              style={{ backgroundColor: "#CC5500" }}
            >
              Create Free Account <ArrowRight size={16} />
            </Link>
            <Link
              href="/calculator"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
            >
              Try the Calculator
            </Link>
          </div>
          <p className="mt-6 text-blue-300 text-sm">
            Questions?{" "}
            <a href="tel:8336736436" className="underline text-blue-200 hover:text-white">833-673-6436</a>
            {" "}or{" "}
            <a href="mailto:sales@orengen.io" className="underline text-blue-200 hover:text-white">sales@orengen.io</a>
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-md font-bold text-white text-xs" style={{ backgroundColor: "#CC5500" }}>WS</div>
            <span className="text-gray-500 text-sm">© {new Date().getFullYear()} OrenGen · WeShare Website Partner Program</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-gray-400">
            <Link href="/leaderboard" className="hover:text-gray-700">Leaderboard</Link>
            <Link href="/calculator" className="hover:text-gray-700">Calculator</Link>
            <Link href="/login" className="hover:text-gray-700">Sign In</Link>
            <Link href="/register" className="hover:text-gray-700 font-semibold" style={{ color: "#CC5500" }}>Join Free</Link>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          Earnings are illustrative projections based on commission rates — not guarantees. Individual results vary based on sales activity and client retention.
        </p>
      </footer>
    </div>
  );
}

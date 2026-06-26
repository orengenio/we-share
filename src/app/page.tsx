import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionFromCookies } from "@/lib/auth";
import { CheckCircle, TrendingUp, Users, Crown, ArrowRight, Star } from "lucide-react";

export default async function Home() {
  const session = await getSessionFromCookies();
  if (session?.role === "ADMIN") redirect("/admin");
  if (session?.role === "AFFILIATE") redirect("/affiliate");
  if (session?.role === "PARTNER") redirect("/partner");

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}>
      {/* ── Header ───────────────────────────────────────────────────────── */}
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

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-16 px-6" style={{ background: "linear-gradient(135deg, #003366 0%, #00285a 100%)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide mb-6 text-white/80 border border-white/20">
            OrenGen Affiliate &amp; Partner Program
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
            Earn Real Residual Income<br />
            <span style={{ color: "#FF8C42" }}>While OrenGen Grows.</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            Refer clients or close deals — and keep earning every month they stay. No caps, no games.
            The same commission rate, forever, on every client you bring in.
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
            Free to join · No credit card · NET-15 payouts
          </p>
        </div>
      </section>

      {/* ── Program Tracks ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#003366" }}>Three Ways to Earn</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Choose the track that fits your style. Affiliates share links; Partners close deals; Leaders build teams.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Affiliate */}
            <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "#e8eef7" }}>
                <Star size={22} style={{ color: "#003366" }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#003366" }}>Affiliate</h3>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                Share your unique link. Earn commissions when your referrals become OrenGen clients — and keep earning every month they stay.
              </p>
              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={15} style={{ color: "#CC5500" }} />
                  <span className="text-gray-700">10–25% of setup fee</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={15} style={{ color: "#CC5500" }} />
                  <span className="text-gray-700">5–10% monthly residual</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={15} style={{ color: "#CC5500" }} />
                  <span className="text-gray-700">Rank up as you grow</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={15} style={{ color: "#CC5500" }} />
                  <span className="text-gray-700">Army Builder overrides</span>
                </div>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "#e8eef7" }}>
                <p className="text-xs text-gray-500 mb-0.5">Starting commission</p>
                <p className="font-bold" style={{ color: "#003366" }}>$99.70 setup + $12.35/mo</p>
              </div>
            </div>

            {/* Sales Partner — featured */}
            <div className="rounded-2xl p-7 shadow-md relative" style={{ backgroundColor: "#003366" }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#CC5500] text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wide">MOST POPULAR</span>
              </div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 bg-white/10">
                <TrendingUp size={22} className="text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Sales Partner</h3>
              <p className="text-blue-200 text-sm mb-5 leading-relaxed">
                Close deals directly with OrenGen prospects. Earn the highest flat rates — for life — on every client you bring on board.
              </p>
              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={15} style={{ color: "#FF8C42" }} />
                  <span className="text-blue-100">35% of every setup fee</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={15} style={{ color: "#FF8C42" }} />
                  <span className="text-blue-100">25% residual — for life</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={15} style={{ color: "#FF8C42" }} />
                  <span className="text-blue-100">$50 fast-start bonus (≤14 days)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={15} style={{ color: "#FF8C42" }} />
                  <span className="text-blue-100">Same rate — no ranking needed</span>
                </div>
              </div>
              <div className="rounded-xl p-3 text-center bg-white/10">
                <p className="text-xs text-blue-300 mb-0.5">Per deal commission</p>
                <p className="font-bold text-white">$348.95 setup + $61.75/mo</p>
              </div>
            </div>

            {/* Partner Leader */}
            <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "#fff7ed" }}>
                <Crown size={22} style={{ color: "#CC5500" }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#003366" }}>Partner Leader</h3>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                Promoted Sales Partners who build and coach a team. You keep your full Partner rate PLUS earn overrides on every deal your team closes.
              </p>
              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={15} style={{ color: "#CC5500" }} />
                  <span className="text-gray-700">Full 35% + 25% personal commissions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={15} style={{ color: "#CC5500" }} />
                  <span className="text-gray-700">+5% of team setup fees</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={15} style={{ color: "#CC5500" }} />
                  <span className="text-gray-700">+5% of team monthly residuals</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={15} style={{ color: "#CC5500" }} />
                  <span className="text-gray-700">Promotion by invitation</span>
                </div>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "#fff7ed" }}>
                <p className="text-xs text-gray-500 mb-0.5">Override per team deal</p>
                <p className="font-bold" style={{ color: "#CC5500" }}>+$49.85 setup + $12.35/mo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#003366" }}>Get Started in Minutes</h2>
            <p className="text-gray-500">No approval process. No waiting. Your first commission can land in days.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create your free account", desc: "Pick your track — Affiliate or Sales Partner. Zero setup cost, no credit card." },
              { step: "02", title: "Get your unique link", desc: "Your personal referral link and partner code are ready immediately after signup." },
              { step: "03", title: "Earn on every client", desc: "Every time a referral becomes a client, you earn a setup commission and a monthly residual — forever." },
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

      {/* ── Why WeShare ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#003366" }}>Built for Long-Term Earners</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "💸", title: "NET-15 Payouts", desc: "Commissions paid within 15 days of approval. $25 minimum, Stripe direct deposit." },
              { icon: "📅", title: "Residuals Stack Monthly", desc: "Every new client you bring adds to a growing monthly residual — compounding over time." },
              { icon: "🔒", title: "30-Day Clawback Only", desc: "After 30 days, a client is locked to you. No retroactive reversals." },
              { icon: "📊", title: "Real-Time Dashboard", desc: "Track clicks, conversions, pipeline, earnings, and payout history — all in one place." },
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

      {/* ── Products They'll Sell ─────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3" style={{ color: "#003366" }}>Sell OrenGen&apos;s Premium AI Solutions</h2>
          <p className="text-gray-500 mb-10 max-w-xl mx-auto">
            Every product is $997 setup + $247/month. High-ticket, sticky products with strong retention means your residual compounds fast.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              "OrenAgents — AI Sales Agents",
              "OrenWeb — AI-Powered Websites",
              "OrenLeads — Lead Generation",
              "OrenMarketing — AI Ad Campaigns",
              "OrenChatbots — Conversational AI",
              "OrenCRM — Client Management",
            ].map(p => (
              <div key={p} className="rounded-xl border border-gray-100 px-4 py-3.5 text-sm font-medium text-gray-700 bg-white shadow-sm text-left">
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: "#003366" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Earning?</h2>
          <p className="text-blue-200 mb-8">
            Join hundreds of affiliates and partners already building recurring income with OrenGen.
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
            <a href="tel:8336736436" className="underline text-blue-200 hover:text-white">
              Call 833-673-6436
            </a>{" "}
            or{" "}
            <a href="mailto:sales@orengen.io" className="underline text-blue-200 hover:text-white">
              sales@orengen.io
            </a>
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-md font-bold text-white text-xs" style={{ backgroundColor: "#CC5500" }}>WS</div>
            <span className="text-gray-500 text-sm">© {new Date().getFullYear()} OrenGen · WeShare Program</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-gray-400">
            <Link href="/leaderboard" className="hover:text-gray-700">Leaderboard</Link>
            <Link href="/calculator" className="hover:text-gray-700">Calculator</Link>
            <Link href="/login" className="hover:text-gray-700">Sign In</Link>
            <Link href="/register" className="hover:text-gray-700 font-semibold" style={{ color: "#CC5500" }}>Join Free</Link>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          Earnings figures are illustrative projections based on commission rates — not guarantees. Individual results vary.
        </p>
      </footer>
    </div>
  );
}

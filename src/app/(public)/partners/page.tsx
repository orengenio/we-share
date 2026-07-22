import Link from "next/link";
import { CheckCircle2, PhoneCall, ScrollText, LayoutDashboard, Package } from "lucide-react";

export const metadata = {
  title: "Become an OrenGen Sales Partner — Close Once, Get Paid Monthly",
  description:
    "Build a book of business: 25% of every setup and 25% of the monthly, for the life of every client you close. Leads, scripts, CRM, and a company number provided.",
};

function IncomeDisclaimer() {
  return (
    <div className="rounded-xl border border-slate-500/30 bg-white/5 px-4 py-3 text-xs text-slate-300 leading-relaxed">
      <strong className="text-slate-200">Income disclaimer:</strong> these figures describe the
      commission structure, not expected earnings. Closing sales requires real work and skill;
      many partners close few or no sales. No income is guaranteed.
    </div>
  );
}

export default function PartnersLandingPage() {
  return (
    <div className="space-y-14 pb-8">
      {/* HERO */}
      <section className="pt-6 max-w-3xl">
        <p className="text-[11px] font-bold tracking-[0.18em] uppercase mb-3" style={{ color: "#E66100" }}>
          OrenGen Sales Partner Program
        </p>
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.02] tracking-tight" style={{ textWrap: "balance" }}>
          Close once. Get paid every month the client stays. For life.
        </h1>
        <p className="mt-5 text-lg text-slate-300 max-w-2xl">
          Most sales jobs make you re-earn your living every 30 days. OrenGen Sales Partners build
          a <strong className="text-white">book of business</strong>: every website you close pays{" "}
          <strong className="text-white">25% of the setup and 25% of the monthly — for as long as
          that client stays. In writing.</strong>
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/partners/apply"
            className="rounded-lg px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#CC5500" }}
          >
            Apply to Claim a Seat →
          </Link>
          <a
            href="#math"
            className="rounded-lg px-6 py-3 text-sm font-semibold text-slate-200 border border-slate-500/40 hover:bg-white/5"
          >
            Show Me the Math ↓
          </a>
        </div>
      </section>

      {/* THE MATH */}
      <section id="math" className="max-w-3xl space-y-4">
        <h2 className="text-2xl font-extrabold text-white">One standard close</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-500/30 bg-white/5">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-500/20 text-slate-200">
              <tr><td className="px-5 py-3 text-slate-400">Client pays</td><td className="px-5 py-3 font-semibold">$997 setup + $247/mo</td></tr>
              <tr><td className="px-5 py-3 text-slate-400">You earn upfront</td><td className="px-5 py-3 font-bold text-white">$249.25</td></tr>
              <tr><td className="px-5 py-3 text-slate-400">You earn monthly</td><td className="px-5 py-3 font-bold text-white">$61.75/mo — for the life of the client</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-slate-300">
          Ten clients on the books = <strong className="text-white">$617.50/mo</strong> in residuals
          before you make a single new call that month. Fifty = <strong className="text-white">$3,087.50/mo</strong>.
          That&apos;s not a projection — it&apos;s multiplication. How many clients you close, and
          how long they stay, is on you.
        </p>
        <IncomeDisclaimer />
      </section>

      {/* WHAT WE HAND YOU */}
      <section className="max-w-3xl space-y-5">
        <h2 className="text-2xl font-extrabold text-white">What we hand you</h2>
        <p className="text-slate-300">You don&apos;t buy a kit. You don&apos;t pay to join. We arm you:</p>
        <ul className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: LayoutDashboard, t: "The leads", d: "Assigned to you in rotation — plus every prospect you self-source is yours. First to register owns it, claim-protected in the system." },
            { icon: ScrollText, t: "The scripts", d: "The full Handbook armory — cold opener, the Mockup Close™, objection battlecards. Field-tested language, not theory." },
            { icon: PhoneCall, t: "CRM + a company number", d: "Every touch logged, every deal tracked, your residuals visible live on your dashboard." },
            { icon: Package, t: "The product does the closing", d: "Your prospect sees a real mockup of their site before they pay a dollar. You're showing the finished thing, not a promise." },
          ].map(({ icon: Icon, t, d }) => (
            <li key={t} className="rounded-xl border border-slate-500/30 bg-white/5 p-4">
              <Icon size={18} style={{ color: "#E66100" }} />
              <p className="mt-2 font-bold text-white">{t}</p>
              <p className="mt-1 text-sm text-slate-300">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* THE ENEMY */}
      <section className="max-w-3xl rounded-xl border border-slate-500/30 bg-white/5 p-6">
        <h2 className="text-xl font-extrabold text-white">The part nobody says out loud</h2>
        <p className="mt-3 text-slate-300">
          Commission jobs have a dirty secret: <strong className="text-white">you build the
          company&apos;s book, and the company keeps it.</strong> Quit, and your income stops the
          same day. Here, exit in good standing and{" "}
          <strong className="text-white">your lifetime residuals keep paying on every client you
          closed.</strong> You earned them. That&apos;s the whole philosophy.
        </p>
      </section>

      {/* FOR / NOT FOR + PROOF */}
      <section className="max-w-3xl grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-500/30 bg-white/5 p-5">
          <p className="font-bold text-white">For you if</p>
          <p className="mt-2 text-sm text-slate-300">
            You can hold a phone conversation with a business owner, take a no without folding,
            and want income that compounds instead of resets.
          </p>
        </div>
        <div className="rounded-xl border border-slate-500/30 bg-white/5 p-5">
          <p className="font-bold text-white">Not for you if</p>
          <p className="mt-2 text-sm text-slate-300">
            You want passive anything, you need a salary, or you&apos;re allergic to the word no.
          </p>
        </div>
      </section>

      <section className="max-w-3xl space-y-3">
        {[
          "Website live in five days or less after the client says yes — we build, you never touch code.",
          "Delivery, support, and billing handled 100% by OrenGen — you sell, we fulfill.",
          "Residuals paid via Stripe to your own account, visible per-client on your dashboard.",
        ].map((line) => (
          <p key={line} className="flex items-start gap-2 text-slate-200 text-sm">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "#E66100" }} /> {line}
          </p>
        ))}
        <div className="pt-3">
          <Link
            href="/partners/apply"
            className="inline-block rounded-lg px-6 py-3 text-sm font-bold text-white hover:opacity-90"
            style={{ backgroundColor: "#CC5500" }}
          >
            Apply to Claim a Seat →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl space-y-4">
        <h2 className="text-2xl font-extrabold text-white">Straight answers</h2>
        {[
          ["What does it cost to join?", "Nothing. We don't sell seats; we recruit closers. Your only investment is work."],
          ["Is this MLM?", "No. You earn on your sales: 25% + 25%, flat. There's a separate referral program with its own rules; as a Sales Partner your money comes from closing, period."],
          ["What do I actually sell?", "One thing: a professional business website — $997 setup + $247/mo maintenance. Fixed pricing, official checkout, no games."],
          ["When do I get paid?", "Commissions lock 72 hours after your client's payment clears (the Texas right-of-rescission window), then pay out via Stripe every Friday."],
          ["What if I leave?", "In good standing: your residuals continue on every client you closed. For life. It's in the handbook, in writing."],
        ].map(([q, a]) => (
          <div key={q} className="rounded-xl border border-slate-500/30 bg-white/5 p-5">
            <p className="font-bold text-white">{q}</p>
            <p className="mt-1.5 text-sm text-slate-300">{a}</p>
          </div>
        ))}
        <IncomeDisclaimer />
      </section>
    </div>
  );
}

import Link from "next/link";
import { CheckCircle2, PhoneCall, ScrollText, LayoutDashboard, Package } from "lucide-react";

export const metadata = {
  title: "Become an OrenGen Sales Partner — Close Once, Get Paid Monthly",
  description:
    "Build a book of business: 25% of every setup and 25% of the monthly, for the life of every client you close. Leads, scripts, CRM, and a company number provided.",
};

const PANEL = { background: "var(--ws-panel-solid)", border: "1px solid var(--ws-line)" };
const TEXT = "var(--ws-text)";
const MUTED = "var(--ws-text-muted)";
const SOFT = "var(--ws-text-soft)";
const ORANGE = "var(--ws-orange-bright)";

function IncomeDisclaimer() {
  return (
    <div className="rounded-xl px-4 py-3 text-xs leading-relaxed" style={{ ...PANEL, color: MUTED }}>
      <strong style={{ color: TEXT }}>Income disclaimer:</strong> these figures describe the
      commission structure, not expected earnings. Closing sales requires real work and skill;
      many partners close few or no sales. No income is guaranteed.
    </div>
  );
}

export default function PartnersLandingPage() {
  return (
    <div className="space-y-16 pb-8">
      {/* HERO */}
      <section className="max-w-3xl pt-6">
        <span className="ws-eyebrow">OrenGen Sales Partner Program</span>
        <h1 className="ws-display mt-6" style={{ fontSize: "clamp(32px,5vw,56px)", textTransform: "none" }}>
          Close once. Get paid every month the client stays. For life.
        </h1>
        <p className="ws-lead mt-6 max-w-2xl">
          Most sales jobs make you re-earn your living every 30 days. OrenGen Sales Partners build
          a <strong style={{ color: TEXT }}>book of business</strong>: every website you close pays{" "}
          <strong style={{ color: TEXT }}>25% of the setup and 25% of the monthly — for as long as
          that client stays. In writing.</strong>
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/partners/apply" className="ws-cta">Apply to Claim a Seat →</Link>
          <a href="#math" className="ws-cta ws-cta--outline">Show Me the Math ↓</a>
        </div>
      </section>

      {/* THE MATH */}
      <section id="math" className="max-w-3xl space-y-4">
        <h2 className="text-2xl font-black" style={{ color: TEXT }}>One standard close</h2>
        <div className="overflow-hidden rounded-2xl" style={PANEL}>
          <table className="w-full text-sm">
            <tbody style={{ color: MUTED }}>
              <tr style={{ borderBottom: "1px solid var(--ws-line)" }}><td className="px-5 py-3" style={{ color: SOFT }}>Client pays</td><td className="px-5 py-3 font-semibold">$997 setup + $247/mo</td></tr>
              <tr style={{ borderBottom: "1px solid var(--ws-line)" }}><td className="px-5 py-3" style={{ color: SOFT }}>You earn upfront</td><td className="px-5 py-3 font-bold" style={{ color: TEXT }}>$249.25</td></tr>
              <tr><td className="px-5 py-3" style={{ color: SOFT }}>You earn monthly</td><td className="px-5 py-3 font-bold" style={{ color: TEXT }}>$61.75/mo — for the life of the client</td></tr>
            </tbody>
          </table>
        </div>
        <p style={{ color: MUTED }}>
          Ten clients on the books = <strong style={{ color: TEXT }}>$617.50/mo</strong> in residuals
          before you make a single new call that month. Fifty = <strong style={{ color: TEXT }}>$3,087.50/mo</strong>.
          That&apos;s not a projection — it&apos;s multiplication. How many clients you close, and
          how long they stay, is on you.
        </p>
        <IncomeDisclaimer />
      </section>

      {/* WHAT WE HAND YOU */}
      <section className="max-w-3xl space-y-5">
        <h2 className="text-2xl font-black" style={{ color: TEXT }}>What we hand you</h2>
        <p style={{ color: MUTED }}>You don&apos;t buy a kit. You don&apos;t pay to join. We arm you:</p>
        <ul className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: LayoutDashboard, t: "The leads", d: "Assigned to you in rotation — plus every prospect you self-source is yours. First to register owns it, claim-protected in the system." },
            { icon: ScrollText, t: "The scripts", d: "The full Handbook armory — cold opener, the Mockup Close™, objection battlecards. Field-tested language, not theory." },
            { icon: PhoneCall, t: "CRM + a company number", d: "Every touch logged, every deal tracked, your residuals visible live on your dashboard." },
            { icon: Package, t: "The product does the closing", d: "Your prospect sees a real mockup of their site before they pay a dollar. You're showing the finished thing, not a promise." },
          ].map(({ icon: Icon, t, d }) => (
            <li key={t} className="rounded-2xl p-5" style={PANEL}>
              <span className="ws-icon-tile mb-3" style={{ width: 42, height: 42 }}><Icon size={18} /></span>
              <p className="font-bold" style={{ color: TEXT }}>{t}</p>
              <p className="mt-1 text-sm" style={{ color: MUTED }}>{d}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* THE ENEMY */}
      <section className="max-w-3xl rounded-2xl p-6" style={PANEL}>
        <h2 className="text-xl font-black" style={{ color: TEXT }}>The part nobody says out loud</h2>
        <p className="mt-3" style={{ color: MUTED }}>
          Commission jobs have a dirty secret: <strong style={{ color: TEXT }}>you build the
          company&apos;s book, and the company keeps it.</strong> Quit, and your income stops the
          same day. Here, exit in good standing and{" "}
          <strong style={{ color: TEXT }}>your lifetime residuals keep paying on every client you
          closed.</strong> You earned them. That&apos;s the whole philosophy.
        </p>
      </section>

      {/* FOR / NOT FOR */}
      <section className="grid max-w-3xl gap-4 sm:grid-cols-2">
        <div className="rounded-2xl p-5" style={PANEL}>
          <p className="font-bold" style={{ color: TEXT }}>For you if</p>
          <p className="mt-2 text-sm" style={{ color: MUTED }}>
            You can hold a phone conversation with a business owner, take a no without folding,
            and want income that compounds instead of resets.
          </p>
        </div>
        <div className="rounded-2xl p-5" style={PANEL}>
          <p className="font-bold" style={{ color: TEXT }}>Not for you if</p>
          <p className="mt-2 text-sm" style={{ color: MUTED }}>
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
          <p key={line} className="flex items-start gap-2 text-sm" style={{ color: MUTED }}>
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: ORANGE }} /> {line}
          </p>
        ))}
        <div className="pt-3">
          <Link href="/partners/apply" className="ws-cta">Apply to Claim a Seat →</Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl space-y-4">
        <h2 className="text-2xl font-black" style={{ color: TEXT }}>Straight answers</h2>
        {[
          ["What does it cost to join?", "Nothing. We don't sell seats; we recruit closers. Your only investment is work."],
          ["Is this MLM?", "No. You earn on your sales: 25% + 25%, flat. There's a separate referral program with its own rules; as a Sales Partner your money comes from closing, period."],
          ["What do I actually sell?", "One thing: a professional business website — $997 setup + $247/mo maintenance. Fixed pricing, official checkout, no games."],
          ["When do I get paid?", "Commissions lock 72 hours after your client's payment clears (the Texas right-of-rescission window), then pay out via Stripe every Friday."],
          ["What if I leave?", "In good standing: your residuals continue on every client you closed. For life. It's in the handbook, in writing."],
        ].map(([q, a]) => (
          <div key={q} className="rounded-2xl p-5" style={PANEL}>
            <p className="font-bold" style={{ color: TEXT }}>{q}</p>
            <p className="mt-1.5 text-sm" style={{ color: MUTED }}>{a}</p>
          </div>
        ))}
        <IncomeDisclaimer />
      </section>
    </div>
  );
}

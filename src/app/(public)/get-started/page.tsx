import { Suspense } from "react";
import CheckoutForm from "./checkout-form";
import { CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Get Your Business Website — $997 + $247/mo | OrenGen",
  description:
    "A professional business website, built for you and live in five days or less. $997 setup + $247/mo for hosting, maintenance, updates, and support. No surprise fees.",
};

export default function GetStartedPage() {
  return (
    <div className="space-y-14 pb-8">
      {/* HERO */}
      <section className="pt-6 max-w-3xl">
        <p className="text-[11px] font-bold tracking-[0.18em] uppercase mb-3" style={{ color: "#E66100" }}>
          OrenWeb · by OrenGen Worldwide
        </p>
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.02] tracking-tight" style={{ textWrap: "balance" }}>
          Your next customer just Googled you. What did they find?
        </h1>
        <p className="mt-5 text-lg text-slate-300 max-w-2xl">
          If the answer is &quot;nothing&quot; or &quot;a page from 2019,&quot; they called your
          competitor. We fix that: a professional business website —{" "}
          <strong className="text-white">built for you, live in five days or less.</strong> You
          never touch code.
        </p>
      </section>

      {/* OFFER + CHECKOUT */}
      <section className="max-w-3xl grid md:grid-cols-2 gap-6 items-start">
        <div className="space-y-3">
          <h2 className="text-2xl font-extrabold text-white">The whole deal, no games</h2>
          <div className="rounded-xl border border-slate-500/30 bg-white/5 p-5">
            <p className="text-3xl font-black text-white">$997 <span className="text-base font-semibold text-slate-300">to build</span></p>
            <p className="mt-1 text-xl font-bold text-white">+ $247/mo <span className="text-sm font-medium text-slate-300">to keep it working for you</span></p>
            <ul className="mt-4 space-y-2 text-sm text-slate-200">
              {[
                "Designed and built by our team — your business, your services, your town",
                "Live in five days or less",
                "Hosting, maintenance, updates, and support all included",
                "No surprise fees — this is the whole price",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0" style={{ color: "#E66100" }} /> {line}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-slate-400">
            Payment is processed by Stripe on OrenGen&apos;s official checkout. After payment, a
            short intake lands in your inbox — ten minutes of your time, then we build.
          </p>
        </div>
        <Suspense fallback={<div className="rounded-xl border border-slate-500/30 bg-white/5 p-5 h-64 animate-pulse" />}>
          <CheckoutForm />
        </Suspense>
      </section>

      {/* HOW IT GOES */}
      <section className="max-w-3xl space-y-4">
        <h2 className="text-2xl font-extrabold text-white">Exactly what happens next</h2>
        <ol className="grid sm:grid-cols-3 gap-4 text-sm">
          {[
            ["1 · Quick intake", "A few short questions — services, hours, photos if you have them. Ten minutes, total."],
            ["2 · We build", "Our team designs and builds the whole thing. Most sites are live in five days or less."],
            ["3 · Launch & care", "Your $247/mo plan covers hosting, maintenance, updates, and support — ongoing."],
          ].map(([t, d]) => (
            <li key={t} className="rounded-xl border border-slate-500/30 bg-white/5 p-4">
              <p className="font-bold text-white">{t}</p>
              <p className="mt-1.5 text-slate-300">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl space-y-4">
        <h2 className="text-2xl font-extrabold text-white">Fair questions</h2>
        {[
          ["I already have a website.", "When did it last bring you a job — versus just existing? If yours is working, keep it. If you're not sure, that's usually the answer."],
          ["Why $247 a month?", "Because a website isn't a one-time object — hosting, security, updates, and a human to call when you need changes. That's what keeps it ranking and working. No surprise fees, ever."],
          ["What if I want changes after launch?", "That's the plan doing its job — updates are included. Email or call, a real person handles it."],
          ["Can I cancel?", "Yes — it's a monthly plan, not a contract trap. We keep clients with results, not lock-in."],
        ].map(([q, a]) => (
          <div key={q} className="rounded-xl border border-slate-500/30 bg-white/5 p-5">
            <p className="font-bold text-white">{q}</p>
            <p className="mt-1.5 text-sm text-slate-300">{a}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

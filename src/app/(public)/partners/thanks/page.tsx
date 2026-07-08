import { CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Application received — OrenGen Sales Partners",
};

export default function PartnerThanksPage() {
  const calendarUrl = process.env.NEXT_PUBLIC_PARTNER_CALENDAR_URL;

  return (
    <div className="max-w-2xl mx-auto pb-10 pt-4">
      <CheckCircle2 size={36} style={{ color: "#E66100" }} />
      <h1 className="mt-4 text-3xl font-black text-white tracking-tight">
        Application in. One step between you and your first lead.
      </h1>
      <p className="mt-4 text-slate-300">Here&apos;s exactly how the next 7 days go — no mystery:</p>
      <ol className="mt-5 space-y-4 text-slate-200">
        <li className="rounded-xl border border-slate-500/30 bg-white/5 p-4">
          <strong className="text-white">1 · Your intro call (15 min).</strong> We talk territory,
          hours, and the math — both directions. You&apos;re interviewing us too.
        </li>
        <li className="rounded-xl border border-slate-500/30 bg-white/5 p-4">
          <strong className="text-white">2 · The certification role-play (30 min).</strong> You run
          the cold opener and the Mockup Close™ from Handbook §6 against us playing a skeptical
          plumber. Pass it, and lead rotation switches on — nobody gets live leads without it.
          That&apos;s why the leads you get are worth getting.
        </li>
        <li className="rounded-xl border border-slate-500/30 bg-white/5 p-4">
          <strong className="text-white">3 · Payouts + dashboard.</strong> Stripe connects to your
          own account; your book of business and residual run-rate are on your dashboard from day one.
        </li>
      </ol>
      <div className="mt-7">
        {calendarUrl ? (
          <a
            href={calendarUrl}
            className="inline-block rounded-lg px-6 py-3 text-sm font-bold text-white hover:opacity-90"
            style={{ backgroundColor: "#CC5500" }}
          >
            Book Your Intro Call →
          </a>
        ) : (
          <p className="text-sm text-slate-300">
            Watch your inbox — we reply within one business day with your intro-call booking link.
          </p>
        )}
      </div>
    </div>
  );
}

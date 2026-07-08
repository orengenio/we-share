import { CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Order confirmed — your build starts now | OrenGen",
};

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto pb-10 pt-4">
      <CheckCircle2 size={36} style={{ color: "#E66100" }} />
      <h1 className="mt-4 text-3xl font-black text-white tracking-tight">
        You&apos;re on the board. The build starts now.
      </h1>
      <p className="mt-4 text-slate-300">
        Payment received — a confirmation is on its way to your inbox, and as of right now your
        business is done being invisible online.
      </p>
      <ol className="mt-6 space-y-4 text-slate-200">
        <li className="rounded-xl border border-slate-500/30 bg-white/5 p-4">
          <strong className="text-white">1 · Quick intake.</strong> A few short questions land in
          your inbox — services, hours, photos if you have them. Ten minutes of your time, total.
        </li>
        <li className="rounded-xl border border-slate-500/30 bg-white/5 p-4">
          <strong className="text-white">2 · We build.</strong> Our team designs and builds the
          whole thing. Most sites are live in five days or less.
        </li>
        <li className="rounded-xl border border-slate-500/30 bg-white/5 p-4">
          <strong className="text-white">3 · Launch &amp; ongoing care.</strong> Hosting,
          maintenance, updates, and support — covered. Questions any time:{" "}
          <a href="mailto:support@orengen.io" className="font-semibold" style={{ color: "#E66100" }}>
            support@orengen.io
          </a>
        </li>
      </ol>
    </div>
  );
}

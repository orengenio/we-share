import Link from "next/link";
import InfluencerCalculator from "@/components/public/influencer-calculator";
import { Sparkles, Shield, Network, Mail } from "lucide-react";

export const metadata = {
  title: "Ambassador Program | Celebrity & Influencer Partners | WeShare",
  description:
    "Invite-only Ambassador tier for major influencers: 5% on every setup fee and 5% on monthly residuals for the life of each client — across your Sales Partner network and Sub-Ambassadors you recruit.",
};

const MUTED = "var(--ws-text-muted)";
const SOFT = "var(--ws-text-soft)";
const ORANGE = "var(--ws-orange-bright)";
const PANEL = { background: "var(--ws-panel-solid)", border: "1px solid var(--ws-line)" };

export default function InfluencersPage() {
  return (
    <div className="py-10 sm:py-14 px-4">
      <InfluencerCalculator />

      <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: <Network size={20} style={{ color: ORANGE }} />,
            title: "Network overrides",
            body: "5% of gross setup + 5% of gross monthly on every deal your Sales Partners close — for the life of the client.",
          },
          {
            icon: <Sparkles size={20} style={{ color: ORANGE }} />,
            title: "Sub-Ambassadors",
            body: "Recruit other major creators. You earn the same 5% / 5% on their entire downstream network.",
          },
          {
            icon: <Shield size={20} style={{ color: ORANGE }} />,
            title: "Invite only",
            body: "Ambassador status is not open enrollment. Built for verified creators with real distribution — not follower farms.",
          },
        ].map((card) => (
          <div key={card.title} className="rounded-2xl p-5" style={PANEL}>
            <span className="ws-icon-tile mb-3" style={{ width: 42, height: 42 }}>{card.icon}</span>
            <h3 className="text-sm font-bold text-white mb-2">{card.title}</h3>
            <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{card.body}</p>
          </div>
        ))}
      </div>

      <div
        className="max-w-2xl mx-auto mt-12 rounded-2xl p-8 text-center space-y-4"
        style={{ background: "var(--ws-orange-soft)", border: "1px solid rgba(232,118,43,0.3)" }}
      >
        <h2 className="text-xl font-black text-white">Ready to explore Ambassador terms?</h2>
        <p className="text-sm" style={{ color: MUTED }}>
          This tier is structured for creators with meaningful reach. Tell us your audience size,
          niche, and how you&apos;d recruit Sales Partners — we&apos;ll schedule a private call.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href="mailto:partners@orengen.io?subject=WeShare%20Ambassador%20Inquiry"
            className="ws-cta"
          >
            <Mail size={16} /> Request Ambassador Access
          </a>
          <Link href="/calculator" className="text-sm font-semibold underline" style={{ color: ORANGE }}>
            Sales Partner calculator →
          </Link>
        </div>
      </div>

      <p className="max-w-2xl mx-auto mt-8 text-center text-[11px]" style={{ color: SOFT }}>
        Earnings shown are hypothetical illustrations only. Ambassador compensation is governed by a
        separate agreement. WeShare does not guarantee income. Influencers must comply with FTC
        disclosure requirements when promoting the program.
      </p>
    </div>
  );
}

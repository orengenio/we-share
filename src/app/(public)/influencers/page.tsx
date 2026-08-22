import Link from "next/link";
import InfluencerCalculator from "@/components/public/influencer-calculator";
import { Sparkles, Shield, Network, Mail } from "lucide-react";

export const metadata = {
  title: "Ambassador Program | Celebrity & Influencer Partners | WeShare",
  description:
    "Invite-only Ambassador tier for major influencers: 2.5% on every setup fee and 2.5% on monthly residuals for the life of each client — across your Sales Partner network and Sub-Ambassadors you recruit.",
};

const MUTED = "rgba(203,213,225,0.75)";
const LINE = "rgba(148,163,184,0.18)";

export default function InfluencersPage() {
  return (
    <div className="py-10 sm:py-14 px-4">
      <InfluencerCalculator />

      <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: <Network size={20} style={{ color: "#CC5500" }} />,
            title: "Network overrides",
            body: "2.5% of gross setup + 2.5% of gross monthly on every deal your Sales Partners close — for the life of the client.",
          },
          {
            icon: <Sparkles size={20} style={{ color: "#FCD34D" }} />,
            title: "Sub-Ambassadors",
            body: "Recruit other major creators. You earn the same 2.5% / 2.5% on their entire downstream network.",
          },
          {
            icon: <Shield size={20} style={{ color: "#93C5FD" }} />,
            title: "Invite only",
            body: "Ambassador status is not open enrollment. Built for verified creators with real distribution — not follower farms.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-xl p-5"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${LINE}` }}
          >
            <div className="mb-3">{card.icon}</div>
            <h3 className="text-sm font-bold text-white mb-2">{card.title}</h3>
            <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{card.body}</p>
          </div>
        ))}
      </div>

      <div
        className="max-w-2xl mx-auto mt-12 rounded-xl p-8 text-center space-y-4"
        style={{ background: "rgba(204,85,0,0.1)", border: "1px solid rgba(204,85,0,0.3)" }}
      >
        <h2 className="text-xl font-bold text-white">Ready to explore Ambassador terms?</h2>
        <p className="text-sm" style={{ color: MUTED }}>
          This tier is structured for creators with meaningful reach. Tell us your audience size,
          niche, and how you&apos;d recruit Sales Partners — we&apos;ll schedule a private call.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href="mailto:partners@orengen.io?subject=WeShare%20Ambassador%20Inquiry"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: "#CC5500" }}
          >
            <Mail size={16} /> Request Ambassador Access
          </a>
          <Link
            href="/calculator"
            className="text-sm font-semibold underline"
            style={{ color: "#FDBA74" }}
          >
            Sales Partner calculator →
          </Link>
        </div>
      </div>

      <p className="max-w-2xl mx-auto mt-8 text-center text-[11px]" style={{ color: "rgba(148,163,184,0.45)" }}>
        Earnings shown are hypothetical illustrations only. Ambassador compensation is governed by a
        separate agreement. WeShare does not guarantee income. Influencers must comply with FTC
        disclosure requirements when promoting the program.
      </p>
    </div>
  );
}

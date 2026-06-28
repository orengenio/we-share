import Link from "next/link";
import { FileText, Download, Scale, BookOpen, ClipboardList } from "lucide-react";

const MUTED = "rgba(203,213,225,0.75)";
const LINE  = "rgba(148,163,184,0.18)";
const SURF  = "rgba(255,255,255,0.06)";

const LEGAL_DOCS = [
  {
    file: "affiliate-agreement.pdf",
    title: "Affiliate Agreement",
    description: "Commission terms, attribution rules, conduct requirements, and program obligations for WeShare Affiliates.",
  },
  {
    file: "partner-agreement.pdf",
    title: "Sales Partner Agreement",
    description: "25%/25% commission structure, lead management obligations, payment terms, and integrity requirements for Sales Partners.",
  },
  {
    file: "contractor-agreement.pdf",
    title: "Independent Contractor Agreement",
    description: "Confirms independent contractor classification, tax responsibilities, confidentiality, and non-solicitation terms.",
  },
  {
    file: "earnings-disclaimer.pdf",
    title: "Earnings Disclaimer",
    description: "FTC-compliant income disclosure. Required reading before joining — explains why results vary and what commissions actually represent.",
  },
  {
    file: "privacy-policy.pdf",
    title: "Privacy Policy",
    description: "What personal data we collect, how we use it, who we share it with, and your rights under CCPA and applicable law.",
  },
  {
    file: "program-terms.pdf",
    title: "Program Terms of Service",
    description: "Platform rules, account security, payout conditions, IP ownership, limitation of liability, and governing law.",
  },
];

const HANDBOOK_DOCS = [
  {
    file: "affiliate-handbook.pdf",
    title: "Affiliate Handbook",
    description: "Complete operating manual — rank structure, commission examples across all 3 packages, daily playbook, attribution rules, and enforcement.",
  },
  {
    file: "partner-handbook.pdf",
    title: "Sales Partner Handbook",
    description: "Full rules of engagement — offer details, commission tables, lead lifecycle SOP, CRM requirements, compliance, and what happens at separation.",
  },
  {
    file: "internal-sop.pdf",
    title: "Internal Operations SOP",
    description: "Admin-only procedures for application review, weekly Friday payout runs, fraud detection, dispute resolution, and KPI tracking.",
    internal: true,
  },
];

function DocCard({
  file,
  title,
  description,
  internal,
}: {
  file: string;
  title: string;
  description: string;
  internal?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3 transition-all duration-200"
      style={{
        background: SURF,
        border: `1px solid ${LINE}`,
        backdropFilter: "blur(10px)",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
      onMouseLeave={e => (e.currentTarget.style.background = SURF)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#CC5500" }}
          >
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm leading-tight">{title}</p>
            {internal && (
              <span
                className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded mt-0.5 inline-block"
                style={{ background: "rgba(251,191,36,0.15)", color: "#FCD34D", border: "1px solid rgba(251,191,36,0.25)" }}
              >
                Internal
              </span>
            )}
          </div>
        </div>
        <a
          href={`/docs/${file}`}
          download
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white flex-shrink-0 transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#CC5500", boxShadow: "0 4px 12px rgba(204,85,0,0.3)" }}
        >
          <Download className="w-3.5 h-3.5" />
          PDF
        </a>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{description}</p>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Program Documents</h1>
        <p style={{ color: MUTED }}>
          All WeShare agreements, handbooks, and policies — download as PDFs. Read these before
          joining. Questions? Email{" "}
          <a href="mailto:partners@orengen.io" className="font-semibold" style={{ color: "#CC5500" }}>
            partners@orengen.io
          </a>
          .
        </p>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-4 h-4" style={{ color: "#CC5500" }} />
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.7)" }}>
            Legal Documents
          </h2>
        </div>
        <div className="grid gap-3">
          {LEGAL_DOCS.map((doc) => (
            <DocCard key={doc.file} {...doc} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4" style={{ color: "#CC5500" }} />
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.7)" }}>
            Handbooks &amp; SOPs
          </h2>
        </div>
        <div className="grid gap-3">
          {HANDBOOK_DOCS.map((doc) => (
            <DocCard key={doc.file} {...doc} />
          ))}
        </div>
      </section>

      <div
        className="rounded-xl p-6 text-white"
        style={{
          background: "linear-gradient(135deg, rgba(0,37,75,0.9), rgba(0,64,128,0.8))",
          border: `1px solid ${LINE}`,
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-5 h-5" style={{ color: "#CC5500" }} />
          <p className="font-bold">Ready to join?</p>
        </div>
        <p className="text-sm mb-4" style={{ color: "rgba(203,213,225,0.8)" }}>
          After reviewing the documents above, create your free account to become a WeShare
          Affiliate, or apply to join as a Sales Partner.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#CC5500", boxShadow: "0 4px 12px rgba(204,85,0,0.3)" }}
          >
            Join as Affiliate — Free
          </Link>
          <Link
            href="/register?type=partner"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}
          >
            Apply as Sales Partner
          </Link>
        </div>
      </div>
    </div>
  );
}

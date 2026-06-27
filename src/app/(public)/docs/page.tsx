import Link from "next/link";
import { FileText, Download, Scale, BookOpen, ClipboardList } from "lucide-react";

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
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#003366" }}
          >
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{title}</p>
            {internal && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                Internal
              </span>
            )}
          </div>
        </div>
        <a
          href={`/docs/${file}`}
          download
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white flex-shrink-0 transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#CC5500" }}
        >
          <Download className="w-3.5 h-3.5" />
          PDF
        </a>
      </div>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#003366" }}>
          Program Documents
        </h1>
        <p className="text-gray-500">
          All WeShare agreements, handbooks, and policies — download as PDFs. Read these before
          joining. Questions? Email{" "}
          <a href="mailto:partners@orengen.io" className="font-medium" style={{ color: "#CC5500" }}>
            partners@orengen.io
          </a>
          .
        </p>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-4 h-4" style={{ color: "#CC5500" }} />
          <h2 className="text-base font-bold uppercase tracking-widest text-gray-500">
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
          <h2 className="text-base font-bold uppercase tracking-widest text-gray-500">
            Handbooks & SOPs
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
        style={{ background: "linear-gradient(135deg, #003366, #004080)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-5 h-5 opacity-80" />
          <p className="font-semibold">Ready to join?</p>
        </div>
        <p className="text-sm opacity-80 mb-4">
          After reviewing the documents above, create your free account to become a WeShare
          Affiliate, or apply to join as a Sales Partner.
        </p>
        <div className="flex gap-3">
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: "#CC5500" }}
          >
            Join as Affiliate — Free
          </Link>
          <Link
            href="/register?type=partner"
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Apply as Sales Partner
          </Link>
        </div>
      </div>
    </div>
  );
}

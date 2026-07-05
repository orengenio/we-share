import { getSessionFromCookies } from "@/lib/auth";
import { FileText, Download, Scale, BookOpen, ClipboardList, ShieldCheck } from "lucide-react";

const LEGAL_DOCS = [
  {
    file: "referral-partner-agreement.pdf",
    title: "Referral Partner Agreement",
    description: "Commission terms, attribution rules, conduct requirements, and program obligations for WeShare Referral Partners.",
    roles: ["AFFILIATE", "ADMIN"],
  },
  {
    file: "partner-agreement.pdf",
    title: "Sales Partner Agreement",
    description: "25%/25% commission structure, lead management obligations, payment terms, and integrity requirements for Sales Partners.",
    roles: ["PARTNER", "ADMIN"],
  },
  {
    file: "contractor-agreement.pdf",
    title: "Independent Contractor Agreement",
    description: "Confirms independent contractor classification, tax responsibilities, confidentiality, and non-solicitation terms.",
    roles: ["AFFILIATE", "PARTNER", "ADMIN"],
  },
  {
    file: "earnings-disclaimer.pdf",
    title: "Earnings Disclaimer",
    description: "FTC-compliant income disclosure — required reading that explains why results vary and what commissions actually represent.",
    roles: ["AFFILIATE", "PARTNER", "ADMIN"],
  },
  {
    file: "privacy-policy.pdf",
    title: "Privacy Policy",
    description: "What personal data we collect, how we use it, who we share it with, and your rights under CCPA and applicable law.",
    roles: ["AFFILIATE", "PARTNER", "ADMIN"],
  },
  {
    file: "program-terms.pdf",
    title: "Program Terms of Service",
    description: "Platform rules, account security, payout conditions, IP ownership, limitation of liability, and governing law.",
    roles: ["AFFILIATE", "PARTNER", "ADMIN"],
  },
];

const HANDBOOK_DOCS = [
  {
    file: "referral-partner-handbook.pdf",
    title: "Referral Partner Handbook",
    description: "Complete operating manual — rank structure, commission tables across all 3 packages, daily playbook, attribution rules, and enforcement.",
    roles: ["AFFILIATE", "ADMIN"],
  },
  {
    file: "partner-handbook.pdf",
    title: "Sales Partner Handbook",
    description: "Full rules of engagement — offer details, commission tables, lead lifecycle, CRM requirements, compliance, and what happens at separation.",
    roles: ["PARTNER", "ADMIN"],
  },
  // NOTE: the confidential Internal Operations SOP is intentionally NOT served
  // here. Files under /public are downloadable by anyone who guesses the URL
  // (there is no per-file auth on static assets), so a "roles: [ADMIN]" gate in
  // this list would not actually protect it. It has been removed from
  // public/docs/. To surface it to admins again, serve it through an
  // authenticated API route (e.g. /api/admin/docs/internal-sop) that checks the
  // session role before streaming the file — do not put it back under /public.
];

function DocCard({
  file,
  title,
  description,
  highlight,
}: {
  file: string;
  title: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl border p-5 flex flex-col gap-3 ${highlight ? "border-[#00254B] shadow-md" : "border-gray-200"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: highlight ? "#CC5500" : "#00254B" }}
          >
            <FileText className="w-4 h-4 text-white" />
          </div>
          <p className="font-semibold text-gray-900 text-sm leading-tight">{title}</p>
        </div>
        <a
          href={`/docs/${file}`}
          download
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white flex-shrink-0 transition-opacity hover:opacity-90"
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

export default async function ResourcesPage() {
  const session = await getSessionFromCookies();
  const role = session?.role ?? "AFFILIATE";
  const isPartner = role === "PARTNER";
  const isAdmin = role === "ADMIN";

  const primaryHandbook = isAdmin
    ? null
    : isPartner
    ? HANDBOOK_DOCS.find(d => d.file === "partner-handbook.pdf")!
    : HANDBOOK_DOCS.find(d => d.file === "referral-partner-handbook.pdf")!;

  const visibleLegal = LEGAL_DOCS.filter(d => d.roles.includes(role));
  const visibleHandbooks = HANDBOOK_DOCS.filter(d => d.roles.includes(role));

  const roleName = isAdmin ? "Admin" : isPartner ? "Sales Partner" : "Referral Partner";

  return (
    <div className="max-w-3xl space-y-10">
      {/* Welcome banner */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{ background: "linear-gradient(135deg, #00254B 0%, #003D7A 100%)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5" style={{ color: "#CC5500" }} />
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">Program Resources</p>
        </div>
        <h1 className="text-2xl font-black text-white mb-1">Your Documents</h1>
        <p className="text-white/70 text-sm">
          Everything you need as a WeShare <strong className="text-white">{roleName}</strong>.
          Download your agreement and handbook, review the legal docs, and keep them on file.
          Paid every Friday — questions? <a href="mailto:partners@orengen.io" className="underline text-white/90">partners@orengen.io</a>
        </p>
      </div>

      {/* Primary handbook — highlighted at the top */}
      {primaryHandbook && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4" style={{ color: "#CC5500" }} />
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Your Handbook</h2>
          </div>
          <DocCard
            file={primaryHandbook.file}
            title={primaryHandbook.title}
            description={primaryHandbook.description}
            highlight
          />
        </section>
      )}

      {/* Legal documents */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-4 h-4" style={{ color: "#CC5500" }} />
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Legal Documents</h2>
        </div>
        <div className="grid gap-3">
          {visibleLegal.map(doc => (
            <DocCard key={doc.file} file={doc.file} title={doc.title} description={doc.description} />
          ))}
        </div>
      </section>

      {/* Handbooks & SOPs — shows all for admin, or skips non-primary for others */}
      {(isAdmin || visibleHandbooks.length > 1) && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="w-4 h-4" style={{ color: "#CC5500" }} />
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {isAdmin ? "Handbooks & SOPs" : "Additional Handbooks"}
            </h2>
          </div>
          <div className="grid gap-3">
            {visibleHandbooks
              .filter(d => !primaryHandbook || d.file !== primaryHandbook.file)
              .map(doc => (
                <DocCard key={doc.file} file={doc.file} title={doc.title} description={doc.description} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * ComplianceFooter — the single source of truth for the site-wide legal footer.
 *
 * Rendered on EVERY surface (dashboard, admin, auth, public, marketing) so the
 * FTC income disclaimer, endorsement-disclosure reminder, and legal links are
 * always one glance away — especially on earnings/commission screens.
 *
 * `variant` adapts to the background: "light" for the app's gray dashboard,
 * "dark" for the navy public/auth surfaces. `compact` trims the disclaimer for
 * tight spots (e.g. the auth card).
 */
const LINKS = [
  { href: "/earnings-disclaimer", label: "Earnings Disclaimer" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "mailto:partners@orengen.io", label: "Contact" },
];

export default function ComplianceFooter({
  variant = "light",
  compact = false,
}: {
  variant?: "light" | "dark";
  compact?: boolean;
}) {
  const dark = variant === "dark";
  const year = new Date().getFullYear();

  const wrap = dark
    ? { borderColor: "rgba(148,163,184,0.14)", background: "rgba(0,37,75,0.30)" }
    : { borderColor: "#e5e7eb", background: "#ffffff" };
  const bodyColor = dark ? "rgba(148,163,184,0.62)" : "#6b7280";
  const linkClass = dark
    ? "underline-offset-2 hover:underline hover:text-white transition-colors"
    : "underline-offset-2 hover:underline hover:text-gray-900 transition-colors";

  return (
    <footer className="border-t" style={wrap}>
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-3">
        <p className="text-[11px] leading-relaxed text-center" style={{ color: bodyColor }}>
          <strong style={{ color: dark ? "rgba(203,213,225,0.85)" : "#4b5563" }}>Income Disclaimer:</strong>{" "}
          WeShare Referral Partners and Sales Partners are independent contractors. Commissions are earned
          only on completed, paid customer sales. Any earnings examples, ranks, or commission percentages
          shown are illustrative and are <strong>not a guarantee of income</strong> — actual results vary with
          individual effort, skill, and market conditions.
          {!compact && (
            <>
              {" "}When promoting the program, partners must clearly disclose their material connection
              (e.g. <strong>#ad</strong>) per the FTC Endorsement Guides.
            </>
          )}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px]" style={{ color: bodyColor }}>
          {LINKS.map((l, i) => (
            <span key={l.href} className="flex items-center gap-4">
              <a
                href={l.href}
                target={l.href.startsWith("/") ? "_blank" : undefined}
                rel={l.href.startsWith("/") ? "noopener noreferrer" : undefined}
                className={linkClass}
              >
                {l.label}
              </a>
              {i < LINKS.length - 1 && <span aria-hidden>·</span>}
            </span>
          ))}
        </div>

        <p className="text-[11px] text-center" style={{ color: bodyColor }}>
          © {year} OrenGen Worldwide LLC · WeShare Referral Partner &amp; Sales Partner Program. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

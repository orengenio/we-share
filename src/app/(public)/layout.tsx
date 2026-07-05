import type { ReactNode } from "react";
import PublicHeader from "@/components/public/header";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(165deg, #001F3F 0%, #00254B 35%, #003D7A 70%, #002952 100%)" }}
    >
      <PublicHeader />

      {/* ── Page content ───────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        className="mt-20 py-8 text-center text-xs border-t"
        style={{
          borderColor: "rgba(148,163,184,0.14)",
          color: "rgba(148,163,184,0.5)",
          background: "rgba(0,37,75,0.3)",
        }}
      >
        <div className="flex items-center justify-center gap-4 mb-2">
          <a href="/docs/privacy-policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy Policy</a>
          <span aria-hidden>·</span>
          <a href="/docs/program-terms.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms of Service</a>
          <span aria-hidden>·</span>
          <a href="/docs/earnings-disclaimer.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Earnings Disclaimer</a>
        </div>
        © {new Date().getFullYear()} OrenGen Worldwide LLC · WeShare Referral Partner &amp; Sales Partner Program
      </footer>
    </div>
  );
}

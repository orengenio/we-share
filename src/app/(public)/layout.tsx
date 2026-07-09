import type { ReactNode } from "react";
import PublicHeader from "@/components/public/header";
import ComplianceFooter from "@/components/legal-footer";
import FloatingCalculator from "@/components/public/floating-calculator";

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
      <div className="mt-20">
        <ComplianceFooter variant="dark" />
      </div>

      {/* Site-wide earnings calculator (hidden on /calculator itself) */}
      <FloatingCalculator />
    </div>
  );
}

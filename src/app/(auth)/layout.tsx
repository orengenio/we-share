import Image from "next/image";
import ComplianceFooter from "@/components/legal-footer";
import WeShareLogo from "@/components/weshare-logo";
import FloatingCalculator from "@/components/public/floating-calculator";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(165deg, #001F3F 0%, #00254B 40%, #003D7A 75%, #002952 100%)",
      }}
    >
      <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* WeShare lockup (links home) + OrenGen wordmark, equal 36px height.
            36px (not 40) so the row fits a 360px viewport without wrapping —
            a wrapped second line would strand the divider rule. */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4">
            <WeShareLogo height={36} />
            <a
              href="https://orengen.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block pl-4"
              style={{ borderLeft: "1px solid rgba(148,163,184,0.25)" }}
            >
              <Image
                src="https://cdn.content360.io/ea2381f4-12e0-4efd-b95b-6012c981eae0/uploads/05-2026/wJb1wZczjrrxwoRKmtjrspq1IJwjW00FtCsIfdn6.png"
                alt="OrenGen Worldwide"
                width={144}
                height={36}
                unoptimized
              />
            </a>
          </div>
          <p
            className="text-xs font-bold tracking-widest uppercase mt-4"
            style={{ color: "rgba(148,163,184,0.7)", letterSpacing: "0.18em" }}
          >
            Partner Portal
          </p>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.97)",
            boxShadow: "0 32px 80px rgba(0,37,75,0.45)",
          }}
        >
          {children}
        </div>

      </div>
      </div>

      <ComplianceFooter variant="dark" compact />

      {/* Site-wide earnings calculator */}
      <FloatingCalculator />
    </div>
  );
}

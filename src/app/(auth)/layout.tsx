import ComplianceFooter from "@/components/legal-footer";
import WeShareLogo from "@/components/weshare-logo";
import FloatingCalculator from "@/components/public/floating-calculator";
import { OrenGenWordmark } from "@/components/brand/orengen-marks";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ws-shell flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* WeShare lockup (links home) + OrenGen wordmark, equal 36px height. */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-4">
              <WeShareLogo height={36} />
              <OrenGenWordmark height={36} className="pl-4 border-l border-white/25" />
            </div>
            <p
              className="mt-4 text-xs font-bold uppercase"
              style={{ color: "var(--ws-text-soft)", letterSpacing: "0.24em" }}
            >
              Partner Portal
            </p>
          </div>

          {/* Form card — white for maximum readability on the dark canvas */}
          <div
            className="rounded-2xl p-8"
            style={{ background: "#ffffff", boxShadow: "0 30px 80px rgba(0,0,0,0.55)" }}
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

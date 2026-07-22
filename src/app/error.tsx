"use client";

import Link from "next/link";
import WeShareLogo from "@/components/weshare-logo";
import ComplianceFooter from "@/components/legal-footer";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(165deg, #001F3F 0%, #00254B 40%, #003D7A 75%, #002952 100%)",
      }}
    >
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-8">
            <WeShareLogo height={40} />
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">
            Something went wrong
          </h1>
          <p className="text-sm mb-2" style={{ color: "rgba(203,213,225,0.75)" }}>
            The error&apos;s on our side, not yours. Try again — if it keeps
            happening, email{" "}
            <a href="mailto:partners@orengen.io" className="underline text-white/90">
              partners@orengen.io
            </a>
            .
          </p>
          {error.digest && (
            <p className="text-xs mb-6" style={{ color: "rgba(148,163,184,0.5)" }}>
              Reference: {error.digest}
            </p>
          )}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={reset}
              className="inline-flex px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "#CC5500", boxShadow: "0 8px 24px rgba(204,85,0,0.3)" }}
            >
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                color: "rgba(203,213,225,0.85)",
                border: "1px solid rgba(148,163,184,0.22)",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
      <ComplianceFooter variant="dark" compact />
    </div>
  );
}

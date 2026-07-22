import Link from "next/link";
import WeShareLogo from "@/components/weshare-logo";
import ComplianceFooter from "@/components/legal-footer";

export default function NotFound() {
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
          <p
            className="text-[64px] font-black leading-none mb-3"
            style={{ color: "rgba(255,255,255,0.15)" }}
          >
            404
          </p>
          <h1 className="text-white text-2xl font-bold mb-2">
            That page doesn&apos;t exist
          </h1>
          <p className="text-sm mb-8" style={{ color: "rgba(203,213,225,0.75)" }}>
            The link may be old or mistyped. Everything WeShare is still one
            click away.
          </p>
          <Link
            href="/"
            className="inline-flex px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "#CC5500", boxShadow: "0 8px 24px rgba(204,85,0,0.3)" }}
          >
            Back to Home
          </Link>
        </div>
      </div>
      <ComplianceFooter variant="dark" compact />
    </div>
  );
}

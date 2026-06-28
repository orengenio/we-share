import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(165deg, #001F3F 0%, #00254B 35%, #003D7A 70%, #002952 100%)" }}
    >
      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          borderColor: "rgba(148,163,184,0.18)",
          background: "rgba(0,37,75,0.72)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <Image
              src="https://cdn.content360.io/ea2381f4-12e0-4efd-b95b-6012c981eae0/uploads/05-2026/wJb1wZczjrrxwoRKmtjrspq1IJwjW00FtCsIfdn6.png"
              alt="OrenGen Worldwide"
              width={130}
              height={32}
              unoptimized
            />
            <span
              className="hidden sm:block text-[10px] font-bold tracking-[0.18em] uppercase pl-3"
              style={{
                color: "rgba(148,163,184,0.65)",
                borderLeft: "1px solid rgba(148,163,184,0.2)",
              }}
            >
              WeShare
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {[
              { href: "/leaderboard", label: "Leaderboard" },
              { href: "/calculator",  label: "Calculator"  },
              { href: "/docs",        label: "Documents"   },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={{ color: "rgba(203,213,225,0.85)" }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all duration-200"
              style={{ background: "#CC5500", boxShadow: "0 8px 24px rgba(204,85,0,0.3)" }}
            >
              Join Now
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                color: "rgba(203,213,225,0.85)",
                border: "1px solid rgba(148,163,184,0.22)",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

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
        © {new Date().getFullYear()} OrenGen Worldwide LLC · WeShare Affiliate &amp; Partner Program
      </footer>
    </div>
  );
}

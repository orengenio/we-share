"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import WeShareLogo from "@/components/weshare-logo";

const LINE  = "rgba(148,163,184,0.18)";
const MUTED = "rgba(203,213,225,0.85)";

const NAV_LINKS = [
  { href: "/get-started", label: "Get Your Website" },
  { href: "/partners",    label: "Become a Partner" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/calculator",  label: "Calculator"  },
];

export default function PublicHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        borderColor: LINE,
        background: "rgba(0,37,75,0.72)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* ── Main bar ────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between gap-4">
        {/* Logo — WeShare lockup (always links home, every breakpoint) +
            OrenGen wordmark at the same 32px height */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <WeShareLogo height={32} />
          <a
            href="https://orengen.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden min-[480px]:block flex-shrink-0 pl-3"
            style={{ borderLeft: "1px solid rgba(148,163,184,0.2)" }}
          >
            <Image
              src="https://cdn.content360.io/ea2381f4-12e0-4efd-b95b-6012c981eae0/uploads/05-2026/wJb1wZczjrrxwoRKmtjrspq1IJwjW00FtCsIfdn6.png"
              alt="OrenGen Worldwide"
              width={130}
              height={32}
              unoptimized
            />
          </a>
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
              style={{ color: MUTED }}
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
          {/* Sign In — desktop only; appears in mobile menu */}
          <Link
            href="/login"
            className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{ color: MUTED, border: `1px solid rgba(148,163,184,0.22)`, background: "rgba(255,255,255,0.06)" }}
          >
            Sign In
          </Link>
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen(v => !v)}
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
            style={{
              background: open ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
              border: `1px solid rgba(148,163,184,0.22)`,
            }}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open
              ? <X size={18} color="rgba(255,255,255,0.9)" />
              : <Menu size={18} color="rgba(255,255,255,0.9)" />
            }
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ──────────────────────────────────────────────────── */}
      {open && (
        <div
          className="sm:hidden border-t"
          style={{
            borderColor: LINE,
            background: "rgba(0,20,58,0.97)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <nav className="px-4 pt-3 pb-2 space-y-0.5">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center px-3 py-3.5 rounded-xl text-base font-semibold transition-all duration-150"
                style={{ color: "rgba(203,213,225,0.8)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {label}
              </Link>
            ))}
            {/* Parent-brand link — the header's OrenGen wordmark is hidden
                below 480px, so keep a click path to orengen.io on phones */}
            <a
              href="https://orengen.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-3.5 rounded-xl text-base font-semibold transition-all duration-150 min-[480px]:hidden"
              style={{ color: "rgba(148,163,184,0.75)" }}
            >
              OrenGen Worldwide ↗
            </a>
          </nav>
          <div
            className="px-4 py-4 border-t"
            style={{ borderColor: "rgba(148,163,184,0.12)" }}
          >
            <Link
              href="/login"
              className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                color: MUTED,
                border: `1px solid rgba(148,163,184,0.22)`,
                background: "rgba(255,255,255,0.06)",
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

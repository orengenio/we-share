import type { ReactNode } from "react";
import Link from "next/link";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg font-bold text-white text-sm"
              style={{ backgroundColor: "#CC5500" }}
            >
              WS
            </div>
            <div>
              <p className="font-bold text-base leading-tight tracking-tight" style={{ color: "#003366" }}>
                WeShare
              </p>
              <p className="text-gray-400 text-[11px] leading-none tracking-wide uppercase">by OrenGen</p>
            </div>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/leaderboard" className="text-gray-600 hover:text-gray-900 font-medium">
              Leaderboard
            </Link>
            <Link href="/calculator" className="text-gray-600 hover:text-gray-900 font-medium">
              Calculator
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: "#CC5500" }}
            >
              Join Now
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
              Sign In
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
      <footer className="border-t border-gray-200 mt-20 py-8 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} OrenGen · WeShare Affiliate & Partner Program
      </footer>
    </div>
  );
}

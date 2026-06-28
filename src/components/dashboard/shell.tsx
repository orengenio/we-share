"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  Link2,
  DollarSign,
  Users,
  AlertCircle,
  UserCheck,
  Building2,
  CreditCard,
  Wallet,
  ShieldAlert,
  Bell,
  LogOut,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import type { AuthSession } from "@/types";

// ─── Nav link definitions ─────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case "ADMIN":
      return [
        { label: "Overview", href: "/admin", icon: <BarChart3 size={18} /> },
        { label: "Affiliates", href: "/admin/affiliates", icon: <Users size={18} /> },
        { label: "Partners", href: "/admin/partners", icon: <Building2 size={18} /> },
        { label: "Commissions", href: "/admin/commissions", icon: <DollarSign size={18} /> },
        { label: "Payouts", href: "/admin/payouts", icon: <Wallet size={18} /> },
        { label: "Fraud", href: "/admin/fraud", icon: <ShieldAlert size={18} /> },
        { label: "Disputes", href: "/admin/disputes", icon: <AlertCircle size={18} /> },
      ];
    case "PARTNER":
      return [
        { label: "Dashboard", href: "/partner", icon: <LayoutDashboard size={18} /> },
        { label: "My Leads", href: "/partner/leads", icon: <UserCheck size={18} /> },
        { label: "Earnings", href: "/partner/earnings", icon: <DollarSign size={18} /> },
        { label: "Disputes", href: "/partner/disputes", icon: <AlertCircle size={18} /> },
      ];
    default:
      // AFFILIATE
      return [
        { label: "Dashboard", href: "/affiliate", icon: <LayoutDashboard size={18} /> },
        { label: "My Links", href: "/affiliate/links", icon: <Link2 size={18} /> },
        { label: "Earnings", href: "/affiliate/earnings", icon: <DollarSign size={18} /> },
        { label: "Army Builder", href: "/affiliate/army", icon: <Users size={18} /> },
        { label: "Disputes", href: "/affiliate/disputes", icon: <AlertCircle size={18} /> },
      ];
  }
}

// ─── Page title helper ────────────────────────────────────────────────────────

function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "Dashboard";
  const last = segments[segments.length - 1];
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
}

// ─── Avatar initials ──────────────────────────────────────────────────────────

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "WS";
}

// ─── Component ────────────────────────────────────────────────────────────────

interface DashboardShellProps {
  session: AuthSession;
  children: React.ReactNode;
}

export default function DashboardShell({ session, children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = getNavItems(session.role);
  const pageTitle = getPageTitle(pathname);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
    }
  }

  const initials = getInitials(session.name, session.email);
  const displayName = session.name ?? session.email;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col shrink-0 w-60 h-full overflow-y-auto"
        style={{ backgroundColor: "#00254B" }}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg font-bold text-white text-sm"
              style={{ backgroundColor: "#CC5500" }}
            >
              WS
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight tracking-tight">
                WeShare
              </p>
              <p className="text-white/50 text-[11px] leading-none tracking-wide uppercase">
                by OrenGen
              </p>
            </div>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-6 pt-4 pb-2">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
            style={{
              backgroundColor:
                session.role === "ADMIN"
                  ? "rgba(204,85,0,0.25)"
                  : "rgba(255,255,255,0.08)",
              color:
                session.role === "ADMIN" ? "#FF8C42" : "rgba(255,255,255,0.5)",
            }}
          >
            {session.role}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href + "/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "text-white"
                    : "text-white/60 hover:text-white hover:bg-white/8",
                ].join(" ")}
                style={
                  isActive
                    ? { backgroundColor: "#CC5500", color: "#fff" }
                    : undefined
                }
              >
                <span
                  className={[
                    "shrink-0 transition-colors",
                    isActive ? "text-white" : "text-white/50 group-hover:text-white/80",
                  ].join(" ")}
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight size={14} className="text-white/60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          {/* User identity */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-sm font-bold text-white"
              style={{ backgroundColor: "rgba(204,85,0,0.7)" }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate leading-tight">
                {displayName}
              </p>
              {session.name && (
                <p className="text-white/40 text-[11px] truncate leading-tight">
                  {session.email}
                </p>
              )}
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut size={16} className="shrink-0" />
            <span>{loggingOut ? "Signing out…" : "Sign out"}</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            {pageTitle}
          </h1>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button
              className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {/* Unread indicator — wire up to real data later */}
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ backgroundColor: "#CC5500" }}
              />
            </button>

            {/* Avatar (top bar repeat) */}
            <div
              className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: "#00254B" }}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Scrollable body */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

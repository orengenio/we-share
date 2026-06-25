import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency ────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

// ─── Dates ───────────────────────────────────────────────────────────────────

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(date));
}

export function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

// ─── Affiliate codes ──────────────────────────────────────────────────────────

export function generateAffiliateCode(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 8);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${slug}${suffix}`;
}

export function generatePartnerCode(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 6);
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `P${slug}${suffix}`;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export function parsePagination(
  searchParams: URLSearchParams,
  defaultPageSize = 20
) {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? String(defaultPageSize)))
  );
  return { page, pageSize, skip: (page - 1) * pageSize };
}

// ─── IP extraction ────────────────────────────────────────────────────────────

export function getClientIP(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

// ─── API responses ────────────────────────────────────────────────────────────

export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

export function apiUnauthorized() {
  return apiError("Unauthorized", 401);
}

export function apiForbidden() {
  return apiError("Forbidden", 403);
}

export function apiNotFound(resource = "Resource") {
  return apiError(`${resource} not found`, 404);
}

export function apiServerError(err: unknown) {
  console.error(err);
  return apiError("Internal server error", 500);
}

// ─── Rank badge colours ───────────────────────────────────────────────────────

export const RANK_COLORS: Record<string, string> = {
  CATALYST: "bg-gray-100 text-gray-700",
  BUILDER: "bg-blue-100 text-blue-700",
  ARCHITECT: "bg-purple-100 text-purple-700",
  SOVEREIGN: "bg-yellow-100 text-yellow-800",
};

export const RANK_LABELS: Record<string, string> = {
  CATALYST: "Catalyst",
  BUILDER: "Builder",
  ARCHITECT: "Architect",
  SOVEREIGN: "Sovereign",
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-800",
  CLAWBACK: "bg-red-100 text-red-700",
  VOID: "bg-gray-100 text-gray-600",
  NEW: "bg-slate-100 text-slate-700",
  CONTACTED: "bg-blue-100 text-blue-700",
  APPOINTMENT: "bg-indigo-100 text-indigo-700",
  PROPOSAL: "bg-purple-100 text-purple-700",
  WON: "bg-green-100 text-green-800",
  LOST: "bg-red-100 text-red-700",
  NURTURE: "bg-orange-100 text-orange-700",
};

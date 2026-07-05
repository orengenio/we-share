import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import type { JWTPayload, AuthSession } from "@/types";

const SESSION_COOKIE = "ws_session";
const SESSION_DURATION_DAYS = 30;

// Resolve the signing secret lazily (at request time, not module load) so the
// production build — which runs with NODE_ENV=production but no JWT_SECRET —
// isn't broken, while a real runtime request in production fails closed if the
// secret is missing instead of silently using a public hardcoded fallback
// (which would make ADMIN tokens forgeable).
function getJwtSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (s && s.length > 0) return new TextEncoder().encode(s);
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is not configured");
  }
  return new TextEncoder().encode("insecure-dev-secret-change-me");
}

// ─── Token creation ───────────────────────────────────────────────────────────

export async function createSessionToken(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ─── Cookie management ────────────────────────────────────────────────────────

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionFromCookies(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getSessionFromToken(token);
}

// ─── Session resolution ───────────────────────────────────────────────────────

export async function getSessionFromToken(token: string): Promise<AuthSession | null> {
  const payload = await verifySessionToken(token);
  if (!payload) return null;

  return {
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
    name: (payload as { name?: string }).name,
    affiliateId: payload.affiliateId,
    partnerId: payload.partnerId,
    affiliateCode: (payload as { affiliateCode?: string }).affiliateCode,
    partnerCode: (payload as { partnerCode?: string }).partnerCode,
  };
}

export async function getSessionFromRequest(req: NextRequest): Promise<AuthSession | null> {
  // 1. Cookie
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (cookie) return getSessionFromToken(cookie);

  // 2. Bearer token
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return getSessionFromToken(authHeader.slice(7));
  }

  return null;
}

// ─── Route guards ─────────────────────────────────────────────────────────────

export function requireAuth(session: AuthSession | null): asserts session is AuthSession {
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
}

export function requireRole(session: AuthSession | null, ...roles: string[]): asserts session is AuthSession {
  requireAuth(session);
  if (!roles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
}

// ─── Admin bootstrap ──────────────────────────────────────────────────────────

/**
 * Emails listed in the ADMIN_EMAILS env var (comma-separated) are treated as
 * platform admins. This is the bootstrap mechanism for the first admin: whoever
 * owns one of these addresses is elevated to ADMIN on registration and on login,
 * so there is no need to hand-edit the database. Case-insensitive.
 */
export function isAdminEmail(email: string): boolean {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}

// ─── Affiliate cookie (90-day attribution) ────────────────────────────────────

export const AFFILIATE_COOKIE = "ws_ref";
export const AFFILIATE_COOKIE_DAYS = 90;
export const VISITOR_COOKIE = "ws_vid";
export const VISITOR_COOKIE_DAYS = 90;

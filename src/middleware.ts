import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

// Auth is enforced with an explicit allowlist of PROTECTED page prefixes.
// Everything not listed here is public by default — this is deliberately an
// allowlist (not a denylist) so a new public page can never be accidentally
// gated, and signup/login/marketing pages can never be locked out.
//
// Note: API routes are NOT gated here — every /api route performs its own
// getSessionFromRequest() + role check and returns proper 401/403 JSON
// (redirecting an API request to /login would break client fetches). This
// middleware only guards navigable page routes as defense-in-depth on top of
// the per-page session checks.
const ADMIN_PATHS = ["/admin"];
const AFFILIATE_PATHS = ["/affiliate"];
const PARTNER_PATHS = ["/partner"];
// Any authenticated user (role-agnostic) may reach these.
const AUTHENTICATED_PATHS = ["/resources", "/settings"];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdmin = matchesPrefix(pathname, ADMIN_PATHS);
  const isAffiliate = matchesPrefix(pathname, AFFILIATE_PATHS);
  const isPartner = matchesPrefix(pathname, PARTNER_PATHS);
  const isAuthed = matchesPrefix(pathname, AUTHENTICATED_PATHS);

  // Not a protected page → public, pass straight through.
  if (!isAdmin && !isAffiliate && !isPartner && !isAuthed) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(req);

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection (ADMIN may view everything).
  if (isAdmin && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (isAffiliate && session.role !== "AFFILIATE" && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (isPartner && session.role !== "PARTNER" && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts|images).*)"],
};

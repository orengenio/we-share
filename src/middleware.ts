import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/track",
  "/api/webhooks",
  "/r/",
];

const ADMIN_PATHS = ["/admin", "/api/admin"];
const AFFILIATE_PATHS = ["/affiliate"];
const PARTNER_PATHS = ["/partner"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p)
  );
  if (isPublic) return NextResponse.next();

  const session = await getSessionFromRequest(req);

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (
    AFFILIATE_PATHS.some((p) => pathname.startsWith(p)) &&
    session.role !== "AFFILIATE" &&
    session.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (
    PARTNER_PATHS.some((p) => pathname.startsWith(p)) &&
    session.role !== "PARTNER" &&
    session.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts|images).*)"],
};

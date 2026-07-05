/**
 * Click tracking endpoint — called on every affiliate link visit.
 * Sets/reads visitor cookie (90-day) and session cookie.
 * Records the click event and returns redirect destination.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordClick, generateToken } from "@/lib/tracking";
import { getClientIP } from "@/lib/utils";

const VISITOR_COOKIE = "ws_vid";
const SESSION_COOKIE = "ws_sid";
const COOKIE_90_DAYS = 90 * 24 * 60 * 60;

const schema = z.object({
  affiliateCode: z.string(),
  linkCode: z.string().optional(),
  destination: z.string().optional(),
});

/**
 * Only allow same-origin/relative redirect destinations. Prevents the
 * trusted weshare.orengen.io domain from being used as an open-redirect
 * phishing hop via ?to=https://evil.example. Returns a safe relative path.
 */
function safeInternalPath(raw: string | null): string {
  if (!raw) return "/";
  // Reject anything that isn't a plain relative path rooted at "/".
  // (protocol-relative "//host" and "https://host" are both blocked.)
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const affiliateCode = searchParams.get("ref") ?? searchParams.get("a");
  const linkCode = searchParams.get("l");
  const destination = safeInternalPath(searchParams.get("to"));

  if (!affiliateCode) {
    return NextResponse.redirect(new URL(destination, req.url));
  }

  // Get or generate visitor token
  let visitorToken = req.cookies.get(VISITOR_COOKIE)?.value;
  const sessionToken = generateToken();
  if (!visitorToken) visitorToken = generateToken();

  const ipAddress = getClientIP(req.headers);
  const userAgent = req.headers.get("user-agent");
  const referrer = req.headers.get("referer");

  // Record click (non-blocking for redirect speed)
  recordClick({
    affiliateCode,
    linkCode: linkCode ?? undefined,
    visitorToken,
    sessionToken,
    ipAddress,
    userAgent,
    referrer,
    landingPage: req.url,
  }).catch(console.error);

  const response = NextResponse.redirect(new URL(destination, req.url));

  // Set 90-day visitor token
  response.cookies.set(VISITOR_COOKIE, visitorToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_90_DAYS,
    domain: process.env.COOKIE_DOMAIN,
    path: "/",
  });

  // Set session token
  response.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24h
    domain: process.env.COOKIE_DOMAIN,
    path: "/",
  });

  return response;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { affiliateCode, linkCode } = schema.parse(body);

    let visitorToken = req.cookies.get(VISITOR_COOKIE)?.value ?? generateToken();
    const sessionToken = generateToken();
    const ipAddress = getClientIP(req.headers);

    await recordClick({
      affiliateCode,
      linkCode,
      visitorToken,
      sessionToken,
      ipAddress,
      userAgent: req.headers.get("user-agent"),
      referrer: req.headers.get("referer"),
      landingPage: req.headers.get("referer"),
    });

    const res = NextResponse.json({ ok: true, visitorToken, sessionToken });

    res.cookies.set(VISITOR_COOKIE, visitorToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_90_DAYS,
      domain: process.env.COOKIE_DOMAIN,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

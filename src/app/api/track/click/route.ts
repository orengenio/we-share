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

const PUBLIC_BASE = process.env.NEXT_PUBLIC_APP_URL || "https://weshare.orengen.io";

/**
 * Only allow same-origin/relative redirect destinations, resolved against the
 * public app URL. Prevents the trusted weshare.orengen.io domain from being
 * used as an open-redirect phishing hop via ?to=https://evil.example, and
 * avoids leaking the internal container host (req.url is 0.0.0.0:PORT behind
 * the Coolify proxy). Returns an absolute URL on the public origin.
 */
function safeRedirectUrl(raw: string | null): string {
  let path = "/";
  // Accept only a plain relative path rooted at "/" (blocks "//host" and
  // "https://host"); anything else falls back to the home page.
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) {
    path = raw;
  }
  return new URL(path, PUBLIC_BASE).toString();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const affiliateCode = searchParams.get("ref") ?? searchParams.get("a");
  const linkCode = searchParams.get("l");
  const destination = safeRedirectUrl(searchParams.get("to"));

  if (!affiliateCode) {
    return NextResponse.redirect(destination);
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

  const response = NextResponse.redirect(destination);

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

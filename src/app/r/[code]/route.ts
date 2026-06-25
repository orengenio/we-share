/**
 * Affiliate link redirect handler.
 * /r/:code → records click → redirects to destination.
 * Supports both affiliate codes and short link codes.
 */

import { NextRequest, NextResponse } from "next/server";
import { recordClick, generateToken } from "@/lib/tracking";
import db from "@/lib/db";
import { getClientIP } from "@/lib/utils";

const VISITOR_COOKIE = "ws_vid";
const SESSION_COOKIE = "ws_sid";
const COOKIE_90_DAYS = 90 * 24 * 60 * 60;

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const { code } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://weshare.orengen.io";

  // Look up by link code first, then affiliate code
  const link = await db.affiliateLink.findUnique({
    where: { code },
    include: { affiliate: true },
  });

  let affiliateCode: string;
  let destination: string;
  let linkCode: string | undefined;

  if (link && link.isActive && link.affiliate.isActive) {
    affiliateCode = link.affiliate.affiliateCode;
    destination = link.destinationUrl.startsWith("http")
      ? link.destinationUrl
      : `${appUrl}${link.destinationUrl}`;
    linkCode = code;
  } else {
    // Try as affiliate code directly
    const affiliate = await db.affiliateProfile.findUnique({
      where: { affiliateCode: code, isActive: true },
    });

    if (!affiliate) {
      return NextResponse.redirect(`${appUrl}/`);
    }

    affiliateCode = code;
    destination = appUrl;
  }

  // Get or generate visitor token
  let visitorToken = req.cookies.get(VISITOR_COOKIE)?.value ?? generateToken();
  const sessionToken = generateToken();

  const ipAddress = getClientIP(req.headers);

  // Record click (non-blocking)
  recordClick({
    affiliateCode,
    linkCode,
    visitorToken,
    sessionToken,
    ipAddress,
    userAgent: req.headers.get("user-agent"),
    referrer: req.headers.get("referer"),
    landingPage: destination,
  }).catch(console.error);

  const response = NextResponse.redirect(destination, { status: 302 });

  response.cookies.set(VISITOR_COOKIE, visitorToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_90_DAYS,
    domain: process.env.COOKIE_DOMAIN,
    path: "/",
  });

  response.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400,
    domain: process.env.COOKIE_DOMAIN,
    path: "/",
  });

  return response;
}

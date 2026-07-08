/**
 * Sales partner link redirect handler.
 * /s/:code → records click → redirects to destination.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  recordPartnerClick,
  generateToken,
  safeDestination,
  VISITOR_COOKIE,
  SESSION_COOKIE,
  COOKIE_90_DAYS,
} from "@/lib/tracking";
import db from "@/lib/db";
import { getClientIP } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const { code } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://weshare.orengen.io";

  const link = await db.partnerLink.findUnique({
    where: { code },
    include: { partner: true },
  });

  let partnerCode: string;
  let destination: string;
  let linkCode: string | undefined;

  if (link && link.isActive && link.partner.isActive) {
    partnerCode = link.partner.partnerCode;
    destination = safeDestination(link.destinationUrl, appUrl);
    linkCode = code;
  } else {
    const partner = await db.partnerProfile.findUnique({
      where: { partnerCode: code, isActive: true },
    });

    if (!partner) {
      return NextResponse.redirect(`${appUrl}/`);
    }

    partnerCode = code;
    destination = appUrl;
  }

  const destParam = req.nextUrl.searchParams.get("dest");
  if (destParam) {
    destination = safeDestination(destParam, appUrl);
  }

  let visitorToken = req.cookies.get(VISITOR_COOKIE)?.value ?? generateToken();
  const sessionToken = generateToken();
  const ipAddress = getClientIP(req.headers);

  recordPartnerClick({
    partnerCode,
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

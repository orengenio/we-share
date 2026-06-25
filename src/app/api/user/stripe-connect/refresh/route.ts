import { NextRequest, NextResponse } from "next/server";
import { createConnectOnboardingLink } from "@/lib/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://weshare.orengen.io";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("id");

  if (!accountId) {
    return NextResponse.redirect(`${APP_URL}/`);
  }

  try {
    const returnUrl = `${APP_URL}/affiliate/settings?stripe=complete`;
    const refreshUrl = `${APP_URL}/api/user/stripe-connect/refresh?id=${accountId}`;
    const link = await createConnectOnboardingLink(accountId, returnUrl, refreshUrl);
    return NextResponse.redirect(link.url);
  } catch {
    return NextResponse.redirect(`${APP_URL}/affiliate/settings?stripe=error`);
  }
}

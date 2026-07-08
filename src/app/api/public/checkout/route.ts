/**
 * Public checkout — creates the official OrenGen Stripe Checkout session for
 * the OrenWeb package ($997 setup + $247/mo) and bakes attribution into the
 * session metadata. The Stripe webhook does the rest (lead, conversion,
 * commissions, order-confirmation email).
 *
 * Attribution precedence mirrors the webhook: the visitor's 90-day ws_vid
 * cookie (from /r/ or /s/ links) resolves to an affiliate or partner; an
 * explicit ?ref= / ?rep= code passed by the page is the fallback when there
 * is no cookie.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { createCheckoutSession } from "@/lib/stripe";
import { resolveAttribution } from "@/lib/tracking";
import { apiSuccess, apiError } from "@/lib/utils";

const VISITOR_COOKIE = "ws_vid";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://weshare.orengen.io";

const schema = z.object({
  email: z.string().email().optional(),
  affiliateCode: z.string().max(60).optional(),
  partnerCode: z.string().max(60).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json().catch(() => ({})));

    let affiliateCode: string | undefined;
    let partnerCode: string | undefined;

    const visitorToken = req.cookies.get(VISITOR_COOKIE)?.value;
    if (visitorToken) {
      const attr = await resolveAttribution(visitorToken);
      affiliateCode = attr.affiliateCode ?? undefined;
      partnerCode = attr.partnerCode ?? undefined;
    }

    // Explicit page-passed codes only fill gaps — a tracked click wins.
    if (!affiliateCode && !partnerCode) {
      if (body.affiliateCode) {
        const aff = await db.affiliateProfile.findUnique({
          where: { affiliateCode: body.affiliateCode, isActive: true },
          select: { affiliateCode: true },
        });
        affiliateCode = aff?.affiliateCode;
      }
      if (!affiliateCode && body.partnerCode) {
        const partner = await db.partnerProfile.findUnique({
          where: { partnerCode: body.partnerCode, isActive: true },
          select: { partnerCode: true },
        });
        partnerCode = partner?.partnerCode;
      }
    }

    const session = await createCheckoutSession({
      email: body.email,
      affiliateCode,
      partnerCode,
      successUrl: `${APP_URL}/get-started/success`,
      cancelUrl: `${APP_URL}/get-started`,
    });

    return apiSuccess({ url: session.url });
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error("public checkout failed:", err);
    return apiError("Could not start checkout — try again or contact support@orengen.io", 502);
  }
}

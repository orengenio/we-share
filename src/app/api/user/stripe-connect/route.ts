/**
 * Stripe Connect onboarding for affiliates and partners.
 * GET  → returns onboarding link or dashboard link
 * POST → creates Connect account and returns onboarding link
 */

import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import {
  createConnectAccount,
  createConnectOnboardingLink,
} from "@/lib/stripe";
import { syncStripeConnectByAccountId } from "@/lib/stripe-connect-sync";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://weshare.orengen.io";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();

  const profile =
    session.role === "AFFILIATE"
      ? await db.affiliateProfile.findUnique({ where: { id: session.affiliateId } })
      : await db.partnerProfile.findUnique({ where: { id: session.partnerId } });

  if (!profile) return apiError("Profile not found", 404);

  const connectId = (profile as { stripeConnectId?: string | null }).stripeConnectId;

  if (!connectId) {
    return apiSuccess({ status: "not_connected", onboardingRequired: true });
  }

  const synced = await syncStripeConnectByAccountId(connectId);

  return apiSuccess({
    status: synced.nextStatus === "enabled" ? "enabled" : "pending",
    detailsSubmitted: synced.detailsSubmitted,
    payoutsEnabled: synced.payoutsEnabled,
    requirementsCurrentlyDue: synced.requirementsCurrentlyDue,
    stripeConnectId: connectId,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();

  try {
    const user = await db.user.findUniqueOrThrow({ where: { id: session.userId } });

    const profile =
      session.role === "AFFILIATE"
        ? await db.affiliateProfile.findUnique({ where: { id: session.affiliateId } })
        : await db.partnerProfile.findUnique({ where: { id: session.partnerId } });

    if (!profile) return apiError("Profile not found", 404);

    let connectId = (profile as { stripeConnectId?: string | null }).stripeConnectId;

    // Create account if not exists
    if (!connectId) {
      const account = await createConnectAccount(user.email, user.name ?? user.email);
      connectId = account.id;

      if (session.role === "AFFILIATE") {
        await db.affiliateProfile.update({
          where: { id: session.affiliateId },
          data: { stripeConnectId: connectId, stripeAccountStatus: "pending" },
        });
      } else {
        await db.partnerProfile.update({
          where: { id: session.partnerId },
          data: { stripeConnectId: connectId, stripeAccountStatus: "pending" },
        });
      }
    }

    const returnUrl = `${APP_URL}/settings?stripe=complete`;
    const refreshUrl = `${APP_URL}/api/user/stripe-connect/refresh?id=${connectId}`;

    const link = await createConnectOnboardingLink(connectId, returnUrl, refreshUrl);

    return apiSuccess({ url: link.url });
  } catch (err) {
    // Surface the real Stripe error instead of a bare 500 so payout setup
    // failures are diagnosable and the partner sees a useful message.
    console.error("stripe-connect POST failed:", err);
    const message = err instanceof Error ? err.message : "Could not start payout setup";
    return apiError(`Stripe: ${message}`, 502);
  }
}

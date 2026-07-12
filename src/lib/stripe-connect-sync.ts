/**
 * Keep AffiliateProfile / PartnerProfile stripeAccountStatus in sync with Stripe.
 */

import db from "./db";
import { getConnectAccountStatus } from "./stripe";
import { sendPartnerStripeReady } from "./email";

export async function syncStripeConnectByAccountId(connectId: string) {
  const status = await getConnectAccountStatus(connectId);
  const nextStatus = status.payoutsEnabled
    ? "enabled"
    : status.detailsSubmitted
      ? "pending"
      : "pending";

  const [affiliate, partner] = await Promise.all([
    db.affiliateProfile.findFirst({ where: { stripeConnectId: connectId } }),
    db.partnerProfile.findFirst({
      where: { stripeConnectId: connectId },
      include: { user: { select: { email: true, name: true } } },
    }),
  ]);

  if (affiliate && affiliate.stripeAccountStatus !== nextStatus) {
    await db.affiliateProfile.update({
      where: { id: affiliate.id },
      data: { stripeAccountStatus: nextStatus },
    });
  }

  if (partner && partner.stripeAccountStatus !== nextStatus) {
    await db.partnerProfile.update({
      where: { id: partner.id },
      data: { stripeAccountStatus: nextStatus },
    });

    if (nextStatus === "enabled" && partner.stripeAccountStatus !== "enabled" && partner.user) {
      sendPartnerStripeReady(
        partner.user.email,
        partner.user.name ?? "there"
      ).catch(console.error);
    }
  }

  return { connectId, nextStatus, ...status };
}

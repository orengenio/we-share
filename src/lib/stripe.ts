import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

export const STRIPE_PRICES = {
  setupFee: process.env.STRIPE_SETUP_FEE_PRICE_ID!,
  maintenance: process.env.STRIPE_MAINTENANCE_PRICE_ID!,
};

// ─── Stripe Connect helpers ───────────────────────────────────────────────────

export async function createConnectAccount(email: string, name: string) {
  return stripe.accounts.create({
    type: "express",
    email,
    capabilities: {
      transfers: { requested: true },
    },
    business_type: "individual",
    individual: { full_name_aliases: [name] },
    settings: {
      payouts: {
        schedule: { interval: "manual" },
      },
    },
  });
}

export async function createConnectOnboardingLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
) {
  return stripe.accountLinks.create({
    account: accountId,
    return_url: returnUrl,
    refresh_url: refreshUrl,
    type: "account_onboarding",
  });
}

export async function getConnectAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId);
  return {
    detailsSubmitted: account.details_submitted,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    requirementsCurrentlyDue: account.requirements?.currently_due ?? [],
  };
}

export async function createTransfer(
  amount: number, // in cents
  destinationAccountId: string,
  description: string,
  metadata: Record<string, string> = {}
) {
  return stripe.transfers.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    destination: destinationAccountId,
    description,
    metadata,
  });
}

// ─── Webhook verification ─────────────────────────────────────────────────────

export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

// ─── Checkout session for direct purchases ────────────────────────────────────

export async function createCheckoutSession({
  email,
  affiliateCode,
  successUrl,
  cancelUrl,
}: {
  email?: string;
  affiliateCode?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: STRIPE_PRICES.setupFee,
        quantity: 1,
      },
      {
        price: STRIPE_PRICES.maintenance,
        quantity: 1,
      },
    ],
    customer_email: email,
    metadata: {
      affiliateCode: affiliateCode ?? "",
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: false,
  });
}

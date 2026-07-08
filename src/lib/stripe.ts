import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2024-11-20.acacia",
      typescript: true,
    });
  }
  return stripeClient;
}

export function getStripePrices() {
  return {
    setupFee: process.env.STRIPE_SETUP_FEE_PRICE_ID!,
    maintenance: process.env.STRIPE_MAINTENANCE_PRICE_ID!,
  };
}

// ─── Stripe Connect helpers ───────────────────────────────────────────────────

export async function createConnectAccount(email: string, name: string) {
  // Canonical Express recipient account. We don't pre-fill individual details —
  // Stripe collects those in its hosted onboarding, and the partner may be an
  // individual or an entity. Manual payout schedule so we control the weekly run.
  return getStripeClient().accounts.create({
    type: "express",
    email,
    capabilities: {
      transfers: { requested: true },
    },
    settings: {
      payouts: {
        schedule: { interval: "manual" },
      },
    },
    metadata: { partner_name: name },
  });
}

export async function createConnectOnboardingLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
) {
  return getStripeClient().accountLinks.create({
    account: accountId,
    return_url: returnUrl,
    refresh_url: refreshUrl,
    type: "account_onboarding",
  });
}

export async function getConnectAccountStatus(accountId: string) {
  const account = await getStripeClient().accounts.retrieve(accountId);
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
  return getStripeClient().transfers.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    destination: destinationAccountId,
    description,
    metadata,
  });
}

// ─── Webhook verification ─────────────────────────────────────────────────────

export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  return getStripeClient().webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

// ─── Checkout session for direct purchases ────────────────────────────────────

export async function createCheckoutSession({
  email,
  affiliateCode,
  partnerCode,
  successUrl,
  cancelUrl,
}: {
  email?: string;
  affiliateCode?: string;
  partnerCode?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const prices = getStripePrices();
  return getStripeClient().checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: prices.setupFee,
        quantity: 1,
      },
      {
        price: prices.maintenance,
        quantity: 1,
      },
    ],
    customer_email: email,
    // The Stripe webhook reads both codes for attribution (affiliate first,
    // else partner — one sale, one owner).
    metadata: {
      affiliateCode: affiliateCode ?? "",
      partnerCode: partnerCode ?? "",
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: false,
  });
}

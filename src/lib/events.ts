/**
 * Outbound event bus — flexible integrations with n8n, Zapier, or custom endpoints.
 *
 * Admin-configured OutboundWebhook rows are matched by event type. Legacy env URLs
 * (N8N_FRAUD_ALERT_WEBHOOK_URL, etc.) are still honored for backward compatibility.
 */

import crypto from "crypto";
import db from "./db";

export const WEBHOOK_EVENTS = [
  "click.recorded",
  "lead.attributed",
  "lead.registered",
  "conversion.created",
  "commission.created",
  "commission.approved",
  "commission.clawback",
  "payout.completed",
  "fraud.flagged",
  "partner.registered",
  "affiliate.registered",
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENTS)[number];

const LEGACY_ENV_MAP: Partial<Record<WebhookEventType, string>> = {
  "fraud.flagged": "N8N_FRAUD_ALERT_WEBHOOK_URL",
  "commission.clawback": "N8N_CLAWBACK_WEBHOOK_URL",
  "payout.completed": "N8N_PAYOUT_WEBHOOK_URL",
};

const MAX_ATTEMPTS = 3;

function signPayload(secret: string, body: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

async function deliverOnce(
  url: string,
  eventType: string,
  payload: Record<string, unknown>,
  secret?: string | null,
  webhookId?: string | null
) {
  const body = JSON.stringify({
    event: eventType,
    timestamp: new Date().toISOString(),
    data: payload,
  });

  const delivery = await db.webhookDelivery.create({
    data: {
      webhookId: webhookId ?? undefined,
      eventType,
      payload: payload as object,
      url,
      status: "pending",
    },
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-WeShare-Event": eventType,
  };
  if (secret) {
    headers["X-WeShare-Signature"] = signPayload(secret, body);
  }

  let lastError: string | null = null;
  let responseCode: number | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, { method: "POST", headers, body });
      responseCode = res.status;
      if (res.ok) {
        await db.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: "success",
            attempts: attempt,
            responseCode,
            deliveredAt: new Date(),
          },
        });
        return;
      }
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Delivery failed";
    }
    if (attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, attempt * 500));
    }
  }

  await db.webhookDelivery.update({
    where: { id: delivery.id },
    data: {
      status: "failed",
      attempts: MAX_ATTEMPTS,
      responseCode,
      lastError,
    },
  });
}

/**
 * Emit an event to all subscribed webhooks. Non-blocking — errors are logged only.
 */
export function emitEvent(eventType: WebhookEventType, payload: Record<string, unknown>) {
  void (async () => {
    try {
      const hooks = await db.outboundWebhook.findMany({
        where: { isActive: true, events: { has: eventType } },
      });

      await Promise.all(
        hooks.map((h) => deliverOnce(h.url, eventType, payload, h.secret, h.id))
      );

      const legacyKey = LEGACY_ENV_MAP[eventType];
      const legacyUrl = legacyKey ? process.env[legacyKey] : undefined;
      if (legacyUrl && !hooks.some((h) => h.url === legacyUrl)) {
        await deliverOnce(legacyUrl, eventType, payload);
      }
    } catch (err) {
      console.error("[events] emit failed", eventType, err);
    }
  })();
}

export function verifyApiKey(req: Request): boolean {
  const expected = process.env.WESHARE_API_KEY;
  if (!expected) return false;
  const key = req.headers.get("x-weshare-api-key");
  return key === expected;
}

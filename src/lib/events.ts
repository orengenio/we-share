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
  "client.cancelled",
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

/** Catch-all n8n inbox — receives every event when set (Coolify-friendly bootstrap). */
const N8N_CATCH_ALL_ENV = "N8N_WEBHOOK_URL";
const N8N_CATCH_ALL_SECRET_ENV = "N8N_WEBHOOK_SECRET";

export const TEST_WEBHOOK_EVENT = "webhook.test" as const;

const MAX_ATTEMPTS = 3;
const DELIVERY_TIMEOUT_MS = 10_000;

function signPayload(secret: string, body: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

/**
 * Admin-configured webhook URLs must point at the outside world — never at
 * loopback, link-local metadata, or private ranges, where a delivery could be
 * used to poke internal services. Legacy env-configured URLs are exempt (they
 * may legitimately target an internal n8n).
 */
export function isSafeWebhookUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return false;
    // IPv4 literal checks
    const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (m) {
      const [a, b] = [parseInt(m[1], 10), parseInt(m[2], 10)];
      if (a === 127 || a === 10 || a === 0) return false;
      if (a === 172 && b >= 16 && b <= 31) return false;
      if (a === 192 && b === 168) return false;
      if (a === 169 && b === 254) return false; // link-local / cloud metadata
    }
    if (host === "::1" || host.startsWith("fd") || host.startsWith("fe80")) return false;
    return true;
  } catch {
    return false;
  }
}

function buildWebhookBody(eventType: string, payload: Record<string, unknown>) {
  return JSON.stringify({
    event: eventType,
    timestamp: new Date().toISOString(),
    data: payload,
  });
}

async function deliverOnce(
  url: string,
  eventType: string,
  payload: Record<string, unknown>,
  secret?: string | null,
  webhookId?: string | null
) {
  const body = buildWebhookBody(eventType, payload);

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
      const res = await fetch(url, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
      });
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

function collectEnvFallbackUrls(
  eventType: WebhookEventType,
  subscribedUrls: Set<string>
): Array<{ url: string; secret?: string | null }> {
  const fallbacks: Array<{ url: string; secret?: string | null }> = [];

  const catchAll = process.env[N8N_CATCH_ALL_ENV];
  if (catchAll && !subscribedUrls.has(catchAll)) {
    fallbacks.push({
      url: catchAll,
      secret: process.env[N8N_CATCH_ALL_SECRET_ENV] ?? null,
    });
    subscribedUrls.add(catchAll);
  }

  const legacyKey = LEGACY_ENV_MAP[eventType];
  const legacyUrl = legacyKey ? process.env[legacyKey] : undefined;
  if (legacyUrl && !subscribedUrls.has(legacyUrl)) {
    fallbacks.push({ url: legacyUrl });
    subscribedUrls.add(legacyUrl);
  }

  return fallbacks;
}

export type WebhookDeliveryResult = {
  ok: boolean;
  statusCode: number | null;
  error?: string;
  deliveryId: string;
};

/**
 * Send a single test ping (one attempt, awaited). Used by admin diagnostics.
 */
export async function sendTestWebhook(
  url: string,
  options?: { secret?: string | null; webhookId?: string | null }
): Promise<WebhookDeliveryResult> {
  const payload = {
    message: "WeShare webhook test — ignore in production automations",
    source: "admin-test",
  };

  const body = buildWebhookBody(TEST_WEBHOOK_EVENT, payload);
  const delivery = await db.webhookDelivery.create({
    data: {
      webhookId: options?.webhookId ?? undefined,
      eventType: TEST_WEBHOOK_EVENT,
      payload: payload as object,
      url,
      status: "pending",
    },
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-WeShare-Event": TEST_WEBHOOK_EVENT,
  };
  if (options?.secret) {
    headers["X-WeShare-Signature"] = signPayload(options.secret, body);
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
    });
    const statusCode = res.status;
    if (res.ok) {
      await db.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: "success",
          attempts: 1,
          responseCode: statusCode,
          deliveredAt: new Date(),
        },
      });
      return { ok: true, statusCode, deliveryId: delivery.id };
    }

    const error = `HTTP ${statusCode}`;
    await db.webhookDelivery.update({
      where: { id: delivery.id },
      data: { status: "failed", attempts: 1, responseCode: statusCode, lastError: error },
    });
    return { ok: false, statusCode, error, deliveryId: delivery.id };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Delivery failed";
    await db.webhookDelivery.update({
      where: { id: delivery.id },
      data: { status: "failed", attempts: 1, lastError: error },
    });
    return { ok: false, statusCode: null, error, deliveryId: delivery.id };
  }
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

      const seenUrls = new Set<string>();
      const safeHooks = hooks.filter((h) => {
        if (!isSafeWebhookUrl(h.url)) return false;
        seenUrls.add(h.url);
        return true;
      });

      await Promise.all(
        safeHooks.map((h) => deliverOnce(h.url, eventType, payload, h.secret, h.id))
      );

      const fallbacks = collectEnvFallbackUrls(eventType, seenUrls);
      await Promise.all(
        fallbacks.map((f) => deliverOnce(f.url, eventType, payload, f.secret))
      );
    } catch (err) {
      console.error("[events] emit failed", eventType, err);
    }
  })();
}

export function verifyApiKey(req: Request): boolean {
  const expected = process.env.WESHARE_API_KEY;
  if (!expected) return false;
  const key = req.headers.get("x-weshare-api-key");
  if (!key) return false;
  // Compare digests so the check is constant-time even for wrong-length keys.
  const a = crypto.createHash("sha256").update(key).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

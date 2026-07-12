import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { isSafeWebhookUrl, sendTestWebhook } from "@/lib/events";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils";

const schema = z
  .object({
    webhookId: z.string().min(1).optional(),
    url: z.string().url().optional(),
    secret: z.string().max(200).optional(),
    useCatchAll: z.boolean().optional(),
  })
  .refine((d) => d.webhookId || d.url || d.useCatchAll, {
    message: "webhookId, url, or useCatchAll required",
  });

// POST /api/admin/outbound-webhooks/test — fire a single test event to n8n or any hook.
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 400);

  let url = parsed.data.url;
  let secret = parsed.data.secret;
  let webhookId: string | undefined;

  if (parsed.data.useCatchAll) {
    url = process.env.N8N_WEBHOOK_URL;
    secret = process.env.N8N_WEBHOOK_SECRET;
    if (!url) {
      return apiError("N8N_WEBHOOK_URL is not configured in environment", 400);
    }
  } else if (parsed.data.webhookId) {
    const hook = await db.outboundWebhook.findUnique({ where: { id: parsed.data.webhookId } });
    if (!hook) return apiError("Webhook not found", 404);
    url = hook.url;
    secret = hook.secret ?? undefined;
    webhookId = hook.id;
  }

  if (!url) return apiError("url required", 400);
  if (!isSafeWebhookUrl(url)) {
    return apiError("Webhook URL must be a public https/http endpoint (no localhost or private ranges)", 400);
  }

  const result = await sendTestWebhook(url, { secret, webhookId });

  if (!result.ok) {
    const detail = result.statusCode ? `HTTP ${result.statusCode}` : result.error;
    return Response.json(
      {
        success: false,
        error: `Webhook test failed: ${detail}`,
        statusCode: result.statusCode,
        deliveryId: result.deliveryId,
      },
      { status: 502 }
    );
  }

  return apiSuccess({
    sent: true,
    statusCode: result.statusCode,
    deliveryId: result.deliveryId,
    url,
  });
}

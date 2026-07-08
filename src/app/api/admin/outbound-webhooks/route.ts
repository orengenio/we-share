import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { parsePagination, apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  secret: z.string().max(200).optional(),
  events: z.array(z.string()).min(1),
  description: z.string().max(500).optional(),
});

const updateSchema = createSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  const hooks = await db.outboundWebhook.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { deliveries: true } } },
  });

  return apiSuccess(hooks);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  try {
    const data = createSchema.parse(await req.json());
    const { isSafeWebhookUrl } = await import("@/lib/events");
    if (!isSafeWebhookUrl(data.url)) {
      return apiError("Webhook URL must be a public https/http endpoint (no localhost or private ranges)", 400);
    }
    const hook = await db.outboundWebhook.create({ data });
    return apiSuccess(hook, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    return apiError("Failed to create webhook", 500);
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  try {
    const body = await req.json();
    const { id, ...data } = body as { id: string } & z.infer<typeof updateSchema>;
    if (!id) return apiError("id required", 400);
    const parsed = updateSchema.parse(data);
    if (parsed.url) {
      const { isSafeWebhookUrl } = await import("@/lib/events");
      if (!isSafeWebhookUrl(parsed.url)) {
        return apiError("Webhook URL must be a public https/http endpoint (no localhost or private ranges)", 400);
      }
    }
    const hook = await db.outboundWebhook.update({ where: { id }, data: parsed });
    return apiSuccess(hook);
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    return apiError("Failed to update webhook", 500);
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return apiError("id required", 400);
  await db.outboundWebhook.delete({ where: { id } });
  return apiSuccess({ deleted: true });
}

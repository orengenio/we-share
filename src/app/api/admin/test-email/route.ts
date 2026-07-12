import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { sendTestEmail, getActiveEmailProvider } from "@/lib/email";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils";

const schema = z.object({ to: z.string().email().optional() });

// POST /api/admin/test-email — admin-only mail deliverability check.
// Awaits the send and returns the real SMTP result so a misconfiguration
// (bad auth, unreachable host, unverified sender domain) surfaces immediately
// instead of failing silently the way the fire-and-forget notification emails do.
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 400);

  const to = parsed.data.to ?? session.email;

  try {
    const info = (await sendTestEmail(to)) as {
      messageId?: string;
      response?: string;
      accepted?: string[];
    } | void;

    return apiSuccess({
      sent: true,
      to,
      provider: getActiveEmailProvider(),
      messageId: info?.messageId ?? null,
      response: info?.response ?? "queued",
    });
  } catch (err) {
    // Surface the underlying SMTP error verbatim — this is a diagnostic tool.
    const message = err instanceof Error ? err.message : "Unknown mail error";
    return apiError(`Send failed: ${message}`, 502);
  }
}

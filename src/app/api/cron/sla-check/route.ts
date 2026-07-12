import { NextRequest } from "next/server";
import { runSlaCheck } from "@/lib/sla-monitor";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils";

/**
 * POST /api/cron/sla-check
 * Run every 15 minutes via Coolify cron or n8n HTTP Request.
 *
 * Auth: Authorization: Bearer <CRON_SECRET>
 *    or header X-Cron-Secret: <CRON_SECRET>
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return apiError("CRON_SECRET is not configured", 503);
  }

  const authHeader = req.headers.get("authorization");
  const headerSecret = req.headers.get("x-cron-secret");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : headerSecret;

  if (!token || token !== secret) {
    return apiUnauthorized();
  }

  const result = await runSlaCheck();
  return apiSuccess(result);
}

// Allow GET for simple uptime-monitor pings (still requires secret as query param)
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return apiError("CRON_SECRET is not configured", 503);

  const token = new URL(req.url).searchParams.get("secret");
  if (token !== secret) return apiUnauthorized();

  const result = await runSlaCheck();
  return apiSuccess(result);
}

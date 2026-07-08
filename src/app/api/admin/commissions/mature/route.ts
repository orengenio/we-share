import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { matureEligibleCommissions } from "@/lib/commissions";
import { apiSuccess, apiUnauthorized, apiForbidden } from "@/lib/utils";

/**
 * Auto-approve PENDING commissions whose maturity date has passed and whose
 * conversion is not refunded. Payout generation also runs this automatically —
 * this endpoint exists for an explicit admin sweep between payout runs.
 */
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  const result = await matureEligibleCommissions(session.userId);
  return apiSuccess(result);
}

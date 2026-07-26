/**
 * Public state-pool availability.
 *
 * GET /api/public/state-pools
 *   → { pools: [{code, name, capacity, taken, available}], defaultCapacity }
 *   Drives the signup state selector (full states render disabled) and any
 *   external availability display.
 *
 * GET /api/public/state-pools?verify=<partnerCode>
 *   → { partnerCode, assignedState }
 *   Used by the n8n Rep Provisioner as its pre-purchase gate: it confirms the
 *   partner actually holds a claimed state BEFORE any VoIP number is bought.
 *   Exposes only the state claim for a known partner code — nothing else.
 */

import { NextRequest } from "next/server";
import db from "@/lib/db";
import { getStatePools } from "@/lib/state-pools";
import { apiSuccess, apiError } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const verify = new URL(req.url).searchParams.get("verify");

  if (verify) {
    const partner = await db.partnerProfile.findUnique({
      where: { partnerCode: verify },
      select: { partnerCode: true, assignedState: true, isActive: true },
    });
    if (!partner || !partner.isActive) return apiError("Unknown or inactive partner code", 404);
    return apiSuccess({ partnerCode: partner.partnerCode, assignedState: partner.assignedState });
  }

  const pools = await getStatePools();
  return apiSuccess({ pools });
}

/**
 * Master-admin account deletion.
 *
 * Guards: ADMIN only · cannot delete yourself · cannot delete another ADMIN.
 * The transaction clears the relations that would otherwise block deletion:
 * overrides + fraud flags (required FKs) and clicks whose ONLY attribution
 * owner is the deleted profile (the Click_attribution_owner_check constraint
 * forbids orphaning them via SET NULL). Financial history survives: leads,
 * conversions, commissions, and payout items keep their rows with the owner
 * reference nulled — the ledger stays intact for tax/audit retention.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, getClientIP } from "@/lib/utils";

const schema = z.object({ userId: z.string().min(1) });

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  try {
    const { userId } = schema.parse(await req.json());

    if (userId === session.userId) {
      return apiError("You cannot delete your own account.", 400);
    }

    const target = await db.user.findUnique({
      where: { id: userId },
      include: {
        affiliateProfile: { select: { id: true } },
        partnerProfile: { select: { id: true } },
      },
    });
    if (!target) return apiError("User not found", 404);
    if (target.role === "ADMIN") {
      return apiError("Admin accounts cannot be deleted from the dashboard.", 400);
    }

    const affId = target.affiliateProfile?.id;
    const pId = target.partnerProfile?.id;

    await db.$transaction([
      // Required-FK dependents that would block the cascade:
      ...(affId
        ? [
            db.override.deleteMany({ where: { OR: [{ earnerId: affId }, { sourceId: affId }] } }),
            db.fraudFlag.deleteMany({ where: { affiliateId: affId } }),
            // Clicks solely owned by this profile violate the attribution-owner
            // check if SET NULL — remove them (they're raw traffic records).
            db.click.deleteMany({ where: { affiliateId: affId, partnerId: null } }),
          ]
        : []),
      ...(pId
        ? [db.click.deleteMany({ where: { partnerId: pId, affiliateId: null } })]
        : []),
      // User delete cascades profiles, sessions, links; optional relations
      // (leads, conversions, commissions, payout items, disputes) SET NULL.
      db.user.delete({ where: { id: userId } }),
    ]);

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: "USER_DELETED",
        resource: "User",
        resourceId: userId,
        details: {
          email: target.email,
          role: target.role,
          affiliateProfileId: affId ?? null,
          partnerProfileId: pId ?? null,
        },
        ipAddress: getClientIP(req.headers),
      },
    });

    return apiSuccess({ deleted: true });
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error("user delete failed:", err);
    return apiError(
      "Could not delete this account — it may have linked records that require review. Suspend it instead, or contact support.",
      500
    );
  }
}

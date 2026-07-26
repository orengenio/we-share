import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { sendPartnerCertified, sendPartnerLeadsUnlocked, sendNumberAssigned, sendPartnerGHLAccessReady } from "@/lib/email";
import { syncPartnerMilestoneToGHL } from "@/lib/ghl-milestones";
import { emitEvent } from "@/lib/events";
import { claimState } from "@/lib/state-pools";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils";

const certifySchema = z.object({
  partnerId: z.string(),
  action: z.enum(["certify", "unlock_leads", "grant_crm_seat", "suspend", "reinstate", "promote_leader", "demote_leader", "assign_number", "assign_state"]),
  reason: z.string().optional(),
  phoneNumber: z.string().min(7).max(30).optional(),
  state: z.string().length(2).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  try {
    const body = await req.json();
    const { partnerId, action, reason, phoneNumber, state } = certifySchema.parse(body);

    const now = new Date();

    const updates: Record<string, unknown> = {};

    if (action === "assign_number" && !phoneNumber) {
      return apiError("phoneNumber is required for assign_number", 400);
    }

    // State reassignment goes through the transactional pool claim so admin
    // overrides obey the same capacity rules as signup.
    if (action === "assign_state") {
      if (!state) return apiError("state is required for assign_state", 400);
      try {
        await claimState(partnerId, state);
      } catch (e) {
        return apiError(e instanceof Error ? e.message : "State claim failed", 409);
      }
      await db.auditLog.create({
        data: {
          userId: session.userId,
          action: "PARTNER_STATE_ASSIGNED",
          resource: "PartnerProfile",
          resourceId: partnerId,
          details: { state: state.toUpperCase() },
        },
      });
      return apiSuccess({ updated: true, assignedState: state.toUpperCase() });
    }

    if (action === "certify") {
      updates.isCertified = true;
      updates.certifiedAt = now;
    } else if (action === "unlock_leads") {
      updates.leadsUnlocked = true;
      updates.leadsUnlockedAt = now;
    } else if (action === "grant_crm_seat") {
      updates.crmSeatGrantedAt = now;
    } else if (action === "suspend") {
      updates.isActive = false;
      updates.suspendedAt = now;
      updates.suspendedReason = reason ?? "Admin suspension";
    } else if (action === "reinstate") {
      updates.isActive = true;
      updates.suspendedAt = null;
      updates.suspendedReason = null;
    } else if (action === "promote_leader") {
      updates.isLeader = true;
      updates.promotedLeaderAt = now;
    } else if (action === "demote_leader") {
      updates.isLeader = false;
      updates.promotedLeaderAt = null;
    } else if (action === "assign_number") {
      updates.assignedPhoneNumber = phoneNumber;
    }

    const before = await db.partnerProfile.findUnique({
      where: { id: partnerId },
      select: {
        isCertified: true,
        leadsUnlocked: true,
        crmSeatGrantedAt: true,
        assignedPhoneNumber: true,
        partnerCode: true,
        assignedState: true,
        user: { select: { email: true, name: true } },
      },
    });
    if (!before) return apiError("Partner not found", 404);

    await db.partnerProfile.update({ where: { id: partnerId }, data: updates });

    // Onboarding-sequence emails — only on the actual state flip, so repeat
    // clicks never re-send. Non-blocking: a mail failure never fails the action.
    if (action === "certify" && !before.isCertified) {
      sendPartnerCertified(before.user.email, before.user.name ?? "there").catch(console.error);
      syncPartnerMilestoneToGHL(before.user.email, "certified").catch(console.error);
      // Payload carries everything the n8n Rep Provisioner needs to run
      // (name split, state pool, partner code) — no extra lookups downstream.
      emitEvent("partner.certified", {
        partnerId,
        email: before.user.email,
        partner_code: before.partnerCode,
        first_name: (before.user.name ?? "").split(/\s+/)[0] || "Partner",
        last_name: (before.user.name ?? "").split(/\s+/).slice(1).join(" "),
        state: before.assignedState,
      });
    } else if (action === "unlock_leads" && !before.leadsUnlocked) {
      sendPartnerLeadsUnlocked(before.user.email, before.user.name ?? "there").catch(console.error);
      syncPartnerMilestoneToGHL(before.user.email, "leads_unlocked").catch(console.error);
      emitEvent("partner.leads_unlocked", { partnerId, email: before.user.email });
    } else if (action === "assign_number" && phoneNumber && before.assignedPhoneNumber !== phoneNumber) {
      sendNumberAssigned(before.user.email, before.user.name ?? "there", phoneNumber).catch(console.error);
      syncPartnerMilestoneToGHL(before.user.email, "phone_assigned").catch(console.error);
    } else if (action === "grant_crm_seat" && !before.crmSeatGrantedAt) {
      sendPartnerGHLAccessReady(before.user.email, before.user.name ?? "there").catch(console.error);
      syncPartnerMilestoneToGHL(before.user.email, "crm_seat_granted").catch(console.error);
      emitEvent("partner.crm_seat_granted", { partnerId, email: before.user.email });
    }

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: `PARTNER_${action.toUpperCase()}`,
        resource: "PartnerProfile",
        resourceId: partnerId,
        details: { reason },
      },
    });

    return apiSuccess({ updated: true, action });
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error(err);
    return apiError("Update failed", 500);
  }
}

/**
 * Sync partner lifecycle milestones to GHL contact tags.
 * Keeps GHL automations in sync with WeShare state without duplicate emails.
 */

import {
  isGHLConfigured,
  lookupContactByEmail,
  addContactTag,
  upsertContact,
} from "@/lib/ghl";

export type PartnerMilestone =
  | "registered"
  | "payouts_connected"
  | "certified"
  | "leads_unlocked"
  | "phone_assigned"
  | "crm_seat_granted";

const MILESTONE_TAGS: Record<PartnerMilestone, string> = {
  registered: "WS Partner Registered",
  payouts_connected: "WS Payouts Connected",
  certified: "WS Rep Certified",
  leads_unlocked: "WS Leads Active",
  phone_assigned: "WS Company Number",
  crm_seat_granted: "WS CRM Seat Granted",
};

/**
 * Add the milestone tag to the partner's GHL contact. Creates the contact if missing.
 * Non-blocking — callers should .catch(console.error).
 */
export async function syncPartnerMilestoneToGHL(
  email: string,
  milestone: PartnerMilestone,
  profile?: { firstName?: string; lastName?: string; partnerCode?: string }
): Promise<void> {
  if (!isGHLConfigured()) return;

  const tag = MILESTONE_TAGS[milestone];
  const customFields = profile?.partnerCode
    ? [{ key: "ws_partner_code", field_value: profile.partnerCode }]
    : undefined;

  try {
    const lookup = await lookupContactByEmail(email);
    const existingId = lookup.contacts?.[0]?.id;

    if (existingId) {
      await addContactTag(existingId, [tag]);
      return;
    }

    const local = email.split("@")[0] || "Partner";
    await upsertContact({
      firstName: profile?.firstName || local,
      lastName: profile?.lastName || "",
      email,
      source: "WeShare",
      tags: ["WeShare Partner", "Sales Partner", tag],
      customFields,
    });
  } catch (err) {
    console.error("[ghl-milestones] sync failed", milestone, email, err);
  }
}

export function milestoneTagName(milestone: PartnerMilestone): string {
  return MILESTONE_TAGS[milestone];
}

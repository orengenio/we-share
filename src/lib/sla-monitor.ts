/**
 * 4-Hour Rule SLA monitor — marks breaches and alerts partners.
 */

import db from "@/lib/db";
import { sendSLABreachAlert } from "@/lib/email";
import { emitEvent } from "@/lib/events";

export async function runSlaCheck(): Promise<{
  checked: number;
  newlyBreached: number;
  alertsSent: number;
}> {
  const now = new Date();

  const overdue = await db.lead.findMany({
    where: {
      partnerId: { not: null },
      firstTouchAt: null,
      slaBreached: false,
      isRecycled: false,
      firstTouchDeadline: { lt: now },
    },
    include: {
      partner: {
        include: { user: { select: { id: true, email: true, name: true } } },
      },
    },
  });

  let alertsSent = 0;

  for (const lead of overdue) {
    await db.lead.update({
      where: { id: lead.id },
      data: { slaBreached: true },
    });

    const partner = lead.partner;
    if (partner?.user) {
      const leadName = `${lead.firstName} ${lead.lastName}`.trim();
      sendSLABreachAlert(
        partner.user.email,
        partner.user.name ?? "there",
        lead.email,
        leadName
      ).catch(console.error);
      alertsSent++;

      emitEvent("lead.sla_breached", {
        leadId: lead.id,
        leadEmail: lead.email,
        leadName,
        partnerId: partner.id,
        partnerUserId: partner.user.id,
        assignedAt: lead.assignedAt?.toISOString(),
        deadline: lead.firstTouchDeadline?.toISOString(),
      });
    }
  }

  return {
    checked: overdue.length,
    newlyBreached: overdue.length,
    alertsSent,
  };
}

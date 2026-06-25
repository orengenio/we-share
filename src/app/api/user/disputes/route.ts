import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { sendDisputeConfirmation } from "@/lib/email";
import { addDays } from "date-fns";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils";

const schema = z.object({
  subject: z.string().min(5).max(200),
  description: z.string().min(20),
  evidence: z.string().optional(),
  statementDate: z.string(), // ISO date of the statement being disputed
  commissionId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();

  const disputes = await db.dispute.findMany({
    where: {
      ...(session.affiliateId ? { affiliateId: session.affiliateId } : {}),
      ...(session.partnerId ? { partnerId: session.partnerId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(disputes);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const statementDate = new Date(data.statementDate);
    const fileDeadline = addDays(statementDate, 30);

    if (new Date() > fileDeadline) {
      return apiError("The 30-day dispute window for this statement has closed", 400);
    }

    const dispute = await db.dispute.create({
      data: {
        affiliateId: session.affiliateId,
        partnerId: session.partnerId,
        commissionId: data.commissionId,
        subject: data.subject,
        description: data.description,
        evidence: data.evidence,
        statementDate,
        fileDeadline,
        status: "OPEN",
      },
    });

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (user?.email) {
      sendDisputeConfirmation(user.email, user.name ?? "Member", dispute.id).catch(console.error);
    }

    return apiSuccess({ disputeId: dispute.id }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error(err);
    return apiError("Failed to file dispute", 500);
  }
}

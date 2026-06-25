import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { apiSuccess, apiUnauthorized } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      affiliateProfile: {
        select: {
          id: true,
          affiliateCode: true,
          rank: true,
          lifetimeSales: true,
          totalClicks: true,
          totalLeads: true,
          totalConversions: true,
          totalEarned: true,
          totalPaid: true,
          pendingBalance: true,
          stripeConnectId: true,
          stripeAccountStatus: true,
          w9Submitted: true,
          isActive: true,
          strikeCount: true,
          fastStartBonusEarned: true,
          uplineId: true,
        },
      },
      partnerProfile: {
        select: {
          id: true,
          partnerCode: true,
          isCertified: true,
          leadsUnlocked: true,
          totalLeadsAssigned: true,
          totalDealsWon: true,
          totalEarned: true,
          totalPaid: true,
          pendingBalance: true,
          stripeConnectId: true,
          stripeAccountStatus: true,
          w9Submitted: true,
          isActive: true,
          ghlContactId: true,
        },
      },
    },
  });

  if (!user) return apiUnauthorized();

  return apiSuccess({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    timezone: user.timezone,
    affiliateProfile: user.affiliateProfile,
    partnerProfile: user.partnerProfile,
  });
}

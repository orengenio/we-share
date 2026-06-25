import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { startOfMonth } from "date-fns";
import { apiSuccess, apiUnauthorized, apiForbidden } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (!session.affiliateId) return apiForbidden();

  const downlines = await db.affiliateProfile.findMany({
    where: { uplineId: session.affiliateId },
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      _count: { select: { conversions: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const thisMonth = startOfMonth(new Date());

  const enriched = await Promise.all(
    downlines.map(async (d) => {
      const [overridesEarned, salesThisMonth] = await Promise.all([
        db.override.aggregate({
          where: { sourceId: d.id, earnerId: session.affiliateId },
          _sum: { amount: true },
        }),
        db.conversion.count({
          where: { affiliateId: d.id, createdAt: { gte: thisMonth } },
        }),
      ]);

      return {
        id: d.id,
        name: d.user.name,
        email: d.user.email,
        affiliateCode: d.affiliateCode,
        rank: d.rank,
        lifetimeSales: d.lifetimeSales,
        salesThisMonth,
        joinedAt: d.user.createdAt,
        overridesEarned: overridesEarned._sum.amount ?? 0,
        isActive: d.isActive,
      };
    })
  );

  const totalOverrides = enriched.reduce((s, d) => s + d.overridesEarned, 0);

  return apiSuccess({
    army: enriched,
    totalMembers: enriched.length,
    activeThisMonth: enriched.filter((d) => d.salesThisMonth > 0).length,
    totalOverridesEarned: totalOverrides,
  });
}

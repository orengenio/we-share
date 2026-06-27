import { NextRequest } from "next/server";
import db from "@/lib/db";
import { apiSuccess, apiServerError } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const [topAffiliates, topPartners, topLeaders] = await Promise.all([
      // Top 25 affiliates by total earned
      db.affiliateProfile.findMany({
        where: { isActive: true, totalEarned: { gt: 0 } },
        orderBy: { totalEarned: "desc" },
        take: 25,
        select: {
          affiliateCode: true,
          rank: true,
          lifetimeSales: true,
          totalEarned: true,
          totalConversions: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      }),

      // Top 25 partners by total earned
      db.partnerProfile.findMany({
        where: { isActive: true, totalDealsWon: { gt: 0 } },
        orderBy: { totalEarned: "desc" },
        take: 25,
        select: {
          partnerCode: true,
          totalDealsWon: true,
          totalEarned: true,
          isLeader: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      }),

      // Top 10 leaders by team override earnings
      db.partnerProfile.findMany({
        where: { isLeader: true, isActive: true },
        orderBy: { totalLeaderOverrides: "desc" },
        take: 10,
        select: {
          partnerCode: true,
          totalDealsWon: true,
          totalEarned: true,
          totalLeaderOverrides: true,
          createdAt: true,
          user: { select: { name: true } },
          teamMembers: { select: { id: true } },
        },
      }),
    ]);

    return apiSuccess({
      affiliates: topAffiliates.map((a, i) => ({
        rank: i + 1,
        displayName: a.user.name ? formatDisplayName(a.user.name) : `${a.affiliateCode}`,
        affiliateRank: a.rank,
        lifetimeSales: a.lifetimeSales,
        totalEarned: a.totalEarned,
        memberSince: a.createdAt,
      })),
      partners: topPartners.map((p, i) => ({
        rank: i + 1,
        displayName: p.user.name ? formatDisplayName(p.user.name) : `${p.partnerCode}`,
        dealsWon: p.totalDealsWon,
        totalEarned: p.totalEarned,
        isLeader: p.isLeader,
        memberSince: p.createdAt,
      })),
      leaders: topLeaders.map((l, i) => ({
        rank: i + 1,
        displayName: l.user.name ? formatDisplayName(l.user.name) : `${l.partnerCode}`,
        teamSize: l.teamMembers.length,
        personalDealsWon: l.totalDealsWon,
        leaderOverrides: l.totalLeaderOverrides,
        totalEarned: l.totalEarned,
        memberSince: l.createdAt,
      })),
    });
  } catch (err) {
    console.error("[GET /api/public/leaderboard]", err);
    return apiServerError(err);
  }
}

function formatDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

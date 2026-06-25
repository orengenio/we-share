import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { parsePagination, apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  const { searchParams } = new URL(req.url);
  const { page, pageSize, skip } = parsePagination(searchParams);
  const search = searchParams.get("search") ?? "";
  const rank = searchParams.get("rank") ?? "";
  const status = searchParams.get("status") ?? "active";

  const where = {
    ...(search
      ? {
          OR: [
            { affiliateCode: { contains: search, mode: "insensitive" as const } },
            { user: { email: { contains: search, mode: "insensitive" as const } } },
            { user: { name: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...(rank ? { rank: rank as "CATALYST" | "BUILDER" | "ARCHITECT" | "SOVEREIGN" } : {}),
    ...(status === "active" ? { isActive: true } : {}),
    ...(status === "suspended" ? { isActive: false } : {}),
  };

  const [items, total] = await Promise.all([
    db.affiliateProfile.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        user: { select: { id: true, email: true, name: true, createdAt: true } },
        _count: {
          select: { downlineProfiles: true, leads: true, conversions: true },
        },
      },
      orderBy: { totalEarned: "desc" },
    }),
    db.affiliateProfile.count({ where }),
  ]);

  return apiSuccess({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { parsePagination, apiSuccess, apiUnauthorized, apiForbidden } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  const { searchParams } = new URL(req.url);
  const { page, pageSize, skip } = parsePagination(searchParams);
  const search = searchParams.get("search") ?? "";

  const where = search
    ? {
        OR: [
          { partnerCode: { contains: search, mode: "insensitive" as const } },
          { user: { email: { contains: search, mode: "insensitive" as const } } },
          { user: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    db.partnerProfile.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        user: { select: { id: true, email: true, name: true, createdAt: true } },
        _count: { select: { leads: true, commissions: true } },
      },
      orderBy: { totalEarned: "desc" },
    }),
    db.partnerProfile.count({ where }),
  ]);

  return apiSuccess({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

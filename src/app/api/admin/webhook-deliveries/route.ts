import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { parsePagination, apiSuccess, apiUnauthorized, apiForbidden } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  const { searchParams } = new URL(req.url);
  const { page, pageSize, skip } = parsePagination(searchParams, 50);
  const eventType = searchParams.get("eventType") ?? "";
  const status = searchParams.get("status") ?? "";

  const where = {
    ...(eventType ? { eventType } : {}),
    ...(status ? { status } : {}),
  };

  const [items, total] = await Promise.all([
    db.webhookDelivery.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { webhook: { select: { name: true } } },
    }),
    db.webhookDelivery.count({ where }),
  ]);

  return apiSuccess({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

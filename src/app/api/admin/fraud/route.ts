import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { parsePagination, apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  const { searchParams } = new URL(req.url);
  const { page, pageSize, skip } = parsePagination(searchParams);
  const unreviewed = searchParams.get("unreviewed") === "true";

  const where = unreviewed ? { reviewedAt: null } : {};

  const [items, total] = await Promise.all([
    db.fraudFlag.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        affiliate: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    }),
    db.fraudFlag.count({ where }),
  ]);

  return apiSuccess({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

const resolveSchema = z.object({
  flagId: z.string(),
  resolution: z.enum(["DISMISSED", "WARNED", "SUSPENDED", "TERMINATED"]),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  try {
    const body = await req.json();
    const { flagId, resolution, notes } = resolveSchema.parse(body);

    const flag = await db.fraudFlag.findUniqueOrThrow({ where: { id: flagId } });

    await db.fraudFlag.update({
      where: { id: flagId },
      data: {
        reviewedAt: new Date(),
        reviewedById: session.userId,
        resolution,
        resolutionNotes: notes,
      },
    });

    // Apply suspension/termination
    if (resolution === "SUSPENDED") {
      await db.affiliateProfile.update({
        where: { id: flag.affiliateId },
        data: { isActive: false, suspendedAt: new Date(), suspendedReason: notes ?? `Fraud: ${flag.type}` },
      });
    }

    if (resolution === "TERMINATED") {
      await db.affiliateProfile.update({
        where: { id: flag.affiliateId },
        data: {
          isActive: false,
          terminatedAt: new Date(),
          suspendedReason: notes ?? `Terminated: ${flag.type}`,
        },
      });
      // Void all pending commissions
      await db.commission.updateMany({
        where: { affiliateId: flag.affiliateId, status: "PENDING" },
        data: { status: "VOID", voidMemo: `Account terminated: ${flag.type}` },
      });
    }

    if (resolution === "WARNED") {
      await db.affiliateProfile.update({
        where: { id: flag.affiliateId },
        data: { strikeCount: { increment: 1 } },
      });
      // Auto-terminate at 3 strikes
      const updated = await db.affiliateProfile.findUnique({
        where: { id: flag.affiliateId },
      });
      if ((updated?.strikeCount ?? 0) >= 3) {
        await db.affiliateProfile.update({
          where: { id: flag.affiliateId },
          data: { isActive: false, terminatedAt: new Date(), suspendedReason: "3 strikes — auto-terminated" },
        });
      }
    }

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: "FRAUD_FLAG_RESOLVED",
        resource: "FraudFlag",
        resourceId: flagId,
        details: { resolution, notes },
      },
    });

    return apiSuccess({ resolved: true, resolution });
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error(err);
    return apiError("Failed to resolve flag", 500);
  }
}

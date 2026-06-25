import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils";

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const user = await db.user.update({
      where: { id: session.userId },
      data,
      select: { id: true, email: true, name: true, phone: true, timezone: true },
    });

    return apiSuccess(user);
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error(err);
    return apiError("Update failed", 500);
  }
}

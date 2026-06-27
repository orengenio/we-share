import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = schema.parse(body);

    const user = await db.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return apiError("Reset link is invalid or has expired.", 400);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    // Invalidate all existing sessions
    await db.session.deleteMany({ where: { userId: user.id } });

    return apiSuccess({ message: "Password updated. Please sign in with your new password." });
  } catch (err) {
    if (err instanceof z.ZodError) return apiError("Password must be at least 8 characters.", 400);
    console.error("[POST /api/auth/reset-password]", err);
    return apiError("Something went wrong. Please try again.", 500);
  }
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import db from "@/lib/db";
import { sendPasswordReset } from "@/lib/email";
import { apiSuccess, apiError } from "@/lib/utils";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const normalizedEmail = email.toLowerCase().trim();
    const user = await db.user.findUnique({ where: { email: normalizedEmail } });

    // Always return success to avoid user enumeration
    if (!user) {
      return apiSuccess({ message: "If an account exists, a reset link has been sent." });
    }

    const token = randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpiry: expiry },
    });

    // Send the email but never let a mail-provider failure surface as a 500 —
    // that would both break the UX and reveal that the account exists.
    try {
      await sendPasswordReset(normalizedEmail, token);
    } catch (mailErr) {
      console.error("[forgot-password] reset email failed to send", mailErr);
    }

    return apiSuccess({ message: "If an account exists, a reset link has been sent." });
  } catch (err) {
    if (err instanceof z.ZodError) return apiError("Invalid email address", 400);
    console.error("[POST /api/auth/forgot-password]", err);
    return apiError("Something went wrong. Please try again.", 500);
  }
}

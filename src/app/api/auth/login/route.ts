import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import db from "@/lib/db";
import { createSessionToken, setSessionCookie, isAdminEmail } from "@/lib/auth";
import { apiSuccess, apiError, getClientIP } from "@/lib/utils";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = schema.parse(body);

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        affiliateProfile: true,
        partnerProfile: true,
      },
    });

    if (!user || !user.passwordHash) {
      return apiError("Invalid email or password", 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return apiError("Invalid email or password", 401);
    }

    // Admin bootstrap: elevate an existing account whose email is in
    // ADMIN_EMAILS but whose stored role hasn't caught up yet.
    let role = user.role;
    if (isAdminEmail(user.email) && role !== "ADMIN") {
      await db.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
      role = "ADMIN";
    }

    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      role,
      name: user.name ?? undefined,
      affiliateId: user.affiliateProfile?.id,
      partnerId: user.partnerProfile?.id,
      affiliateCode: user.affiliateProfile?.affiliateCode,
      partnerCode: user.partnerProfile?.partnerCode,
    } as Parameters<typeof createSessionToken>[0]);

    await db.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userAgent: req.headers.get("user-agent") ?? undefined,
        ipAddress: getClientIP(req.headers),
      },
    });

    await setSessionCookie(token);

    return apiSuccess({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
        affiliateCode: user.affiliateProfile?.affiliateCode,
        partnerCode: user.partnerProfile?.partnerCode,
      },
      token,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError(err.errors[0].message, 400);
    }
    console.error(err);
    return apiError("Login failed", 500);
  }
}

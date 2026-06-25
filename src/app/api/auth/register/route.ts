import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import db from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { generateAffiliateCode } from "@/lib/utils";
import { sendAffiliateWelcome } from "@/lib/email";
import { apiSuccess, apiError } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  type: z.enum(["AFFILIATE", "PARTNER"]).default("AFFILIATE"),
  referralCode: z.string().optional(), // upline affiliate code (army builder)
  leaderCode: z.string().optional(),   // partner leader code (partner program only)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, type, referralCode, leaderCode } = schema.parse(body);

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return apiError("An account with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Resolve upline for army builder (affiliates)
    let uplineId: string | null = null;
    if (referralCode && type === "AFFILIATE") {
      const upline = await db.affiliateProfile.findUnique({
        where: { affiliateCode: referralCode },
      });
      if (upline) uplineId = upline.id;
    }

    // Resolve upline leader for partner program
    let uplineLeaderId: string | null = null;
    if (leaderCode && type === "PARTNER") {
      const leader = await db.partnerProfile.findUnique({
        where: { partnerCode: leaderCode },
        select: { id: true, isLeader: true, isActive: true },
      });
      if (leader?.isLeader && leader.isActive) uplineLeaderId = leader.id;
    }

    const affiliateCode = generateAffiliateCode(name);

    const user = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role: type,
        ...(type === "AFFILIATE"
          ? {
              affiliateProfile: {
                create: {
                  affiliateCode,
                  rank: "CATALYST",
                  uplineId,
                },
              },
            }
          : {
              partnerProfile: {
                create: {
                  partnerCode: `P${affiliateCode}`,
                  ...(uplineLeaderId ? { uplineLeaderId } : {}),
                },
              },
            }),
      },
      include: {
        affiliateProfile: true,
        partnerProfile: true,
      },
    });

    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name ?? undefined,
      affiliateId: user.affiliateProfile?.id,
      partnerId: user.partnerProfile?.id,
      affiliateCode: user.affiliateProfile?.affiliateCode,
      partnerCode: user.partnerProfile?.partnerCode,
    } as Parameters<typeof createSessionToken>[0]);

    await setSessionCookie(token);

    // Send welcome email (non-blocking)
    if (type === "AFFILIATE" && user.affiliateProfile) {
      sendAffiliateWelcome(normalizedEmail, name, user.affiliateProfile.affiliateCode).catch(
        console.error
      );
    }

    return apiSuccess(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          affiliateCode: user.affiliateProfile?.affiliateCode,
          partnerCode: user.partnerProfile?.partnerCode,
        },
        token,
      },
      201
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError(err.errors[0].message, 400);
    }
    console.error(err);
    return apiError("Registration failed", 500);
  }
}

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import db from "@/lib/db";
import { createSessionToken, setSessionCookie, isAdminEmail } from "@/lib/auth";
import { generateAffiliateCode } from "@/lib/utils";
import { sendAffiliateWelcome, sendPartnerWelcome } from "@/lib/email";
import { syncPartnerToGHL } from "@/lib/ghl";
import { syncPartnerMilestoneToGHL } from "@/lib/ghl-milestones";
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

    // Admin bootstrap: an email listed in ADMIN_EMAILS registers as a platform
    // admin with no referral/sales profile.
    const isAdmin = isAdminEmail(normalizedEmail);

    const user = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role: isAdmin ? "ADMIN" : type,
        ...(isAdmin
          ? {}
          : type === "AFFILIATE"
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

    // Send welcome email (non-blocking — a mail failure never blocks signup)
    if (type === "AFFILIATE" && user.affiliateProfile) {
      sendAffiliateWelcome(normalizedEmail, name, user.affiliateProfile.affiliateCode).catch(
        console.error
      );
    } else if (type === "PARTNER" && user.partnerProfile) {
      sendPartnerWelcome(normalizedEmail, name, user.partnerProfile.partnerCode).catch(
        console.error
      );
    }

    if (!isAdmin) {
      const { emitEvent } = await import("@/lib/events");
      if (type === "AFFILIATE" && user.affiliateProfile) {
        emitEvent("affiliate.registered", {
          userId: user.id,
          affiliateId: user.affiliateProfile.id,
          affiliateCode: user.affiliateProfile.affiliateCode,
          uplineId,
        });
      } else if (type === "PARTNER" && user.partnerProfile) {
        emitEvent("partner.registered", {
          userId: user.id,
          partnerId: user.partnerProfile.id,
          partnerCode: user.partnerProfile.partnerCode,
          uplineLeaderId,
        });
      }
    }

    // Sync the new partner into GoHighLevel as a tagged contact (non-blocking;
    // no-ops until GHL creds are configured). Admins are not synced.
    if (!isAdmin && process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID) {
      const [firstName, ...rest] = name.trim().split(/\s+/);
      syncPartnerToGHL({
        firstName: firstName || name,
        lastName: rest.join(" "),
        email: normalizedEmail,
        role: type,
        code: user.affiliateProfile?.affiliateCode ?? user.partnerProfile?.partnerCode,
      }).catch(console.error);

      if (type === "PARTNER" && user.partnerProfile) {
        syncPartnerMilestoneToGHL(normalizedEmail, "registered", {
          firstName: firstName || name,
          lastName: rest.join(" "),
          partnerCode: user.partnerProfile.partnerCode,
        }).catch(console.error);
      }
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

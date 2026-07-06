import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils";

// Avatar is stored as a data: URL. The client resizes to a small square before
// upload, so cap the payload well under a Postgres row limit (~150KB of base64
// ≈ a ~110KB image, plenty for a profile photo).
const MAX_AVATAR_CHARS = 200_000;

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  // Opt in/out of public leaderboard display of your name + earnings.
  showOnLeaderboard: z.boolean().optional(),
  avatarUrl: z
    .string()
    .max(MAX_AVATAR_CHARS, "Image is too large — please use a smaller photo")
    .refine((v) => v === "" || v.startsWith("data:image/"), "Invalid image")
    .optional(),
  // Onboarding flags.
  docsAcknowledged: z.boolean().optional(),
  onboardingTourDone: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();

  try {
    const body = await req.json();
    const { showOnLeaderboard, docsAcknowledged, onboardingTourDone, ...userData } =
      updateSchema.parse(body);

    const user = await db.user.update({
      where: { id: session.userId },
      data: {
        ...userData,
        ...(docsAcknowledged !== undefined
          ? { docsAcknowledgedAt: docsAcknowledged ? new Date() : null }
          : {}),
        ...(onboardingTourDone !== undefined ? { onboardingTourDone } : {}),
      },
      select: { id: true, email: true, name: true, phone: true, timezone: true, avatarUrl: true },
    });

    // Leaderboard consent lives on the profile, not the user record.
    if (showOnLeaderboard !== undefined) {
      if (session.affiliateId) {
        await db.affiliateProfile.update({
          where: { id: session.affiliateId },
          data: { showOnLeaderboard },
        });
      }
      if (session.partnerId) {
        await db.partnerProfile.update({
          where: { id: session.partnerId },
          data: { showOnLeaderboard },
        });
      }
    }

    return apiSuccess(user);
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error(err);
    return apiError("Update failed", 500);
  }
}

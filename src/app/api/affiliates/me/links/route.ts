import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { v4 as uuid } from "uuid";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils";

const createSchema = z.object({
  label: z.string().min(1).max(100),
  destinationUrl: z.string().url().optional().default("/"),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (!session.affiliateId) return apiForbidden();

  const links = await db.affiliateLink.findMany({
    where: { affiliateId: session.affiliateId },
    orderBy: { createdAt: "desc" },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://weshare.orengen.io";

  return apiSuccess(
    links.map((l) => ({
      ...l,
      trackingUrl: `${appUrl}/r/${l.code}`,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (!session.affiliateId) return apiForbidden();

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    // Custom slug uniqueness check
    if (data.slug) {
      const slugTaken = await db.affiliateLink.findFirst({
        where: { code: data.slug },
      });
      if (slugTaken) return apiError("This custom URL is already taken", 409);
    }

    const code = data.slug ?? uuid().slice(0, 8);

    const link = await db.affiliateLink.create({
      data: {
        affiliateId: session.affiliateId,
        code,
        slug: data.slug,
        destinationUrl: data.destinationUrl,
        label: data.label,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://weshare.orengen.io";

    return apiSuccess(
      { ...link, trackingUrl: `${appUrl}/r/${code}` },
      201
    );
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error(err);
    return apiError("Failed to create link", 500);
  }
}

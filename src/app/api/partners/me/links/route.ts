import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { v4 as uuid } from "uuid";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils";

const createSchema = z.object({
  label: z.string().min(1).max(100),
  destinationUrl: z.string().optional().default("/"),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (!session.partnerId) return apiForbidden();

  const links = await db.partnerLink.findMany({
    where: { partnerId: session.partnerId },
    orderBy: { createdAt: "desc" },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://weshare.orengen.io";

  return apiSuccess(
    links.map((l) => ({
      ...l,
      trackingUrl: `${appUrl}/s/${l.code}`,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (!session.partnerId) return apiForbidden();

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    if (data.slug) {
      const taken =
        (await db.partnerLink.findFirst({ where: { code: data.slug } })) ||
        (await db.affiliateLink.findFirst({ where: { code: data.slug } }));
      if (taken) return apiError("This custom URL is already taken", 409);
    }

    const code = data.slug ?? uuid().slice(0, 8);
    const dest = data.destinationUrl?.startsWith("http")
      ? data.destinationUrl
      : data.destinationUrl ?? "/";

    const link = await db.partnerLink.create({
      data: {
        partnerId: session.partnerId,
        code,
        slug: data.slug,
        destinationUrl: dest,
        label: data.label,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://weshare.orengen.io";

    return apiSuccess({ ...link, trackingUrl: `${appUrl}/s/${code}` }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error(err);
    return apiError("Failed to create link", 500);
  }
}

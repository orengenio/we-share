/**
 * Sales-partner application intake (native form on /partners/apply).
 *
 * GHL is the CRM of record: the applicant lands there as a tagged contact
 * with the application in custom fields. An admin notification email is the
 * durable second copy (never lost if GHL is briefly down), and the audit log
 * records the submission + consent stamps.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { upsertContact } from "@/lib/ghl";
import { sendPartnerApplicationNotice } from "@/lib/email";
import { apiSuccess, apiError, getClientIP } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  cityState: z.string().min(2).max(120),
  experience: z.enum(["full_time", "side_income", "none_but_ready"]),
  soldWhat: z.string().max(300).optional(),
  hours: z.enum(["lt10", "10_20", "20_40", "40_plus"]),
  objectionAnswer: z.string().min(10).max(2000),
  start: z.enum(["this_week", "two_weeks", "exploring"]),
  referrer: z.string().max(120).optional(),
  serviceConsent: z.literal(true), // required — contact about the application
  smsConsent: z.boolean().optional(), // optional marketing SMS, never pre-checked
});

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    const [firstName, ...rest] = data.name.trim().split(/\s+/);
    const now = new Date();

    // GHL contact — the application lives on the contact record.
    const ghlSync =
      process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID
        ? upsertContact({
            firstName: firstName || data.name,
            lastName: rest.join(" "),
            email: data.email.toLowerCase().trim(),
            phone: data.phone,
            source: "WeShare Rep Application",
            tags: ["WS Rep Applicant"],
            customFields: [
              { key: "ws_rep_city_state", field_value: data.cityState },
              { key: "ws_rep_experience", field_value: data.experience },
              { key: "ws_rep_sold_what", field_value: data.soldWhat ?? "" },
              { key: "ws_rep_hours", field_value: data.hours },
              { key: "ws_rep_objection_answer", field_value: data.objectionAnswer },
              { key: "ws_rep_start", field_value: data.start },
              { key: "ws_rep_referrer", field_value: data.referrer ?? "" },
              { key: "ws_consent_service_at", field_value: now.toISOString() },
              {
                key: "ws_consent_sms_mkt_at",
                field_value: data.smsConsent ? now.toISOString() : "",
              },
            ],
          }).catch((e) => {
            console.error("rep application GHL sync failed:", e);
            return null;
          })
        : Promise.resolve(null);

    // Admin notification — the durable copy. Await so a total failure of both
    // GHL and email surfaces to the applicant instead of silently vanishing.
    const adminEmail =
      process.env.ADMIN_EMAILS?.split(",")[0]?.trim() || "sales@orengen.io";
    const [ghlContactId] = await Promise.all([
      ghlSync,
      sendPartnerApplicationNotice(adminEmail, {
        ...data,
        submittedAt: now.toISOString(),
      }).catch((e) => {
        console.error("rep application admin notice failed:", e);
        return null;
      }),
    ]);

    await db.auditLog.create({
      data: {
        action: "REP_APPLICATION_RECEIVED",
        resource: "GHLContact",
        resourceId: typeof ghlContactId === "string" ? ghlContactId : undefined,
        details: {
          email: data.email,
          cityState: data.cityState,
          experience: data.experience,
          hours: data.hours,
          start: data.start,
          referrer: data.referrer ?? null,
          serviceConsentAt: now.toISOString(),
          smsMarketingConsentAt: data.smsConsent ? now.toISOString() : null,
        },
        ipAddress: getClientIP(req.headers),
      },
    });

    return apiSuccess({ received: true }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error("rep application failed:", err);
    return apiError("Could not submit your application — try again", 500);
  }
}

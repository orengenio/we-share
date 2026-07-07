/**
 * Bulk prospect import — a rep uploads a CSV (parsed client-side into rows)
 * and every row runs through the same claim/dedup path as single registration
 * (src/lib/prospects.ts). Rows are processed sequentially so duplicates inside
 * the file collide on the DB check exactly like duplicates across reps.
 *
 * GHL sync for created leads runs in the background, paced ~1.3s apart —
 * GHL rate-limits burst creation.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import {
  registerProspect,
  syncProspectToGHL,
  type RepContext,
} from "@/lib/prospects";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils";
import type { Lead } from "@prisma/client";

const MAX_ROWS = 500;

const rowSchema = z.object({
  company: z.string().min(1).max(200),
  contactName: z.string().max(160).optional(),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  notes: z.string().max(2000).optional(),
});

const importSchema = z.object({
  rows: z.array(z.record(z.unknown())).min(1).max(MAX_ROWS),
});

interface RowResult {
  row: number; // 1-based position in the uploaded file
  company: string;
  outcome: "created" | "already_yours" | "claimed" | "owned_by_other" | "invalid";
  error?: string;
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (!session.partnerId) return apiForbidden();

  try {
    const body = await req.json();
    const { rows } = importSchema.parse(body);

    const ctx: RepContext = {
      userId: session.userId,
      partnerId: session.partnerId,
      partnerCode: session.partnerCode,
    };

    const results: RowResult[] = [];
    const toSync: Array<{ lead: Lead; rawPhone: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const parsed = rowSchema.safeParse(rows[i]);
      const company = String((rows[i] as { company?: unknown }).company ?? "").trim();

      if (!parsed.success) {
        results.push({
          row: i + 1,
          company: company || "(unknown)",
          outcome: "invalid",
          error: parsed.error.errors[0]?.message,
        });
        continue;
      }

      try {
        const result = await registerProspect(ctx, parsed.data, "import");
        results.push({ row: i + 1, company: parsed.data.company, outcome: result.outcome });
        if (result.outcome === "created") {
          toSync.push({ lead: result.lead, rawPhone: parsed.data.phone });
        }
      } catch (e) {
        console.error(`prospect import row ${i + 1} failed:`, e);
        results.push({
          row: i + 1,
          company: parsed.data.company,
          outcome: "invalid",
          error: "Could not save this row",
        });
      }
    }

    // Background GHL sync, paced to stay under GHL's rate limits. A sync
    // failure never affects the import result — leads are already saved.
    if (toSync.length > 0) {
      (async () => {
        for (const { lead, rawPhone } of toSync) {
          try {
            await syncProspectToGHL(ctx, lead, rawPhone);
          } catch (e) {
            console.error(`prospect import GHL sync failed for lead ${lead.id}:`, e);
          }
          await new Promise((r) => setTimeout(r, 1300));
        }
      })().catch(console.error);
    }

    const count = (o: RowResult["outcome"]) => results.filter((r) => r.outcome === o).length;
    return apiSuccess({
      total: rows.length,
      created: count("created"),
      alreadyYours: count("already_yours"),
      claimed: count("claimed"),
      ownedByOther: count("owned_by_other"),
      invalid: count("invalid"),
      results,
    });
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error("prospect import failed:", err);
    return apiError("Import failed", 500);
  }
}

/**
 * Admin AI email composer — Gemini drafts, a human reviews and sends.
 * (Nothing ships without a human: this returns a draft, it never sends.)
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { generateText, isGeminiConfigured } from "@/lib/gemini";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils";

const schema = z.object({
  brief: z.string().min(5).max(2000),
  audience: z.enum(["rep", "customer", "applicant"]).default("rep"),
});

const SYSTEM = `You write emails for OrenGen Worldwide LLC (WeShare partner platform).
Voice: Trusted Counselor — consultative, warm, direct, plain-language. Never pushy, never hype.
HARD RULES:
- Never use: "AI-powered solutions", "cutting-edge", "best-in-class", "leverage synergies", "we're passionate about", "one-stop shop", "game-changer", "unlock", "elevate", "seamless".
- No income claims or earnings promises, ever. Commission structure facts allowed for reps only: 25% of setup + 25% of monthly for the life of the client, 72-hour rescission lock (commissions lock 72 hours after the client's payment clears), weekly Friday payouts.
- Product facts (customer-facing): professional business website, $997 setup + $247/month covering hosting, maintenance, updates, support; most sites live in five days or less; no surprise fees. Claim nothing else.
- Say "Referral Partner", never "Affiliate".
- Sign off "— The OrenGen Team".
Output format: first line "SUBJECT: <subject>", blank line, then the email body as simple HTML paragraphs (<p>, <ul>/<li>, <strong> only).`;

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiUnauthorized();
  if (session.role !== "ADMIN") return apiForbidden();

  if (!isGeminiConfigured()) {
    return apiError("GEMINI_API_KEY is not configured in the environment.", 503);
  }

  try {
    const { brief, audience } = schema.parse(await req.json());
    const draft = await generateText(
      `Audience: ${audience === "rep" ? "an OrenGen sales partner (internal)" : audience === "applicant" ? "a sales-partner applicant" : "a small-business customer"}.\nWrite the email for this brief:\n${brief}`,
      { system: SYSTEM, temperature: 0.6, maxOutputTokens: 1200 }
    );
    return apiSuccess({ draft });
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message, 400);
    console.error("ai compose failed:", err);
    return apiError("Draft generation failed — check the Gemini key/model.", 502);
  }
}

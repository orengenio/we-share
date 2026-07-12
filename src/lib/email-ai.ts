/**
 * Optional Gemini polish for transactional emails.
 * When EMAIL_USE_GEMINI=true (default when GEMINI_API_KEY is set), body copy
 * is refined for voice and formatting — layout shell stays consistent.
 * Always falls back to the static HTML on timeout or API error.
 */

import { generateText, isGeminiConfigured } from "@/lib/gemini";
import { wrapEmailLayout, type EmailLayoutOptions } from "@/lib/email-layout";

const BRAND_SYSTEM = `You polish HTML email body fragments for OrenGen Worldwide LLC (WeShare).
Voice: Trusted Counselor — warm, direct, plain language. Never pushy or hypey.
HARD RULES:
- Output ONLY the inner body HTML (no <html>, <head>, layout tables, or footer).
- Allowed tags: <p>, <ul>, <li>, <ol>, <strong>, <em>, <a href="...">, <br>.
- Keep ALL factual content: names, codes, URLs, dollar amounts, deadlines — do not invent facts.
- Never use: "AI-powered", "cutting-edge", "game-changer", "unlock", "elevate", "seamless", "leverage synergies".
- No income claims. Commission facts for reps only: 25% setup + 25% monthly residual, NET-15.
- Say "Sales Partner" or "Referral Partner", never "Affiliate".
- Do not add a sign-off — the layout template handles that.
- Improve readability with short paragraphs and clear structure. Add subtle <strong> for key actions.`;

function useGeminiPolish(): boolean {
  if (process.env.EMAIL_USE_GEMINI === "false") return false;
  if (process.env.EMAIL_USE_GEMINI === "true") return isGeminiConfigured();
  // Default: polish when key is present
  return isGeminiConfigured();
}

async function polishBodyHtml(templateKey: string, staticBodyHtml: string): Promise<string> {
  if (!useGeminiPolish()) return staticBodyHtml;

  try {
    const polished = await Promise.race([
      generateText(
        `Template: ${templateKey}\nPolish this email body HTML. Keep every fact and link exactly as-is:\n\n${staticBodyHtml}`,
        { system: BRAND_SYSTEM, temperature: 0.4, maxOutputTokens: 1500 }
      ),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini polish timeout")), 12_000)
      ),
    ]);

    const trimmed = polished.trim();
    // Basic sanity: must still look like HTML fragments, not markdown
    if (trimmed.includes("<p") || trimmed.includes("<ul") || trimmed.includes("<ol")) {
      return trimmed;
    }
  } catch (err) {
    console.warn("[email-ai] polish failed, using static template:", templateKey, err);
  }
  return staticBodyHtml;
}

/**
 * Build final send-ready HTML: optional Gemini polish → branded layout wrap.
 */
export async function buildBrandedEmail(
  templateKey: string,
  layout: EmailLayoutOptions
): Promise<string> {
  const bodyHtml = await polishBodyHtml(templateKey, layout.bodyHtml);
  return wrapEmailLayout({ ...layout, bodyHtml });
}

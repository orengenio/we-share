/**
 * Google Gemini client. Reads GEMINI_API_KEY from the environment so the key
 * lives only in Coolify config, never in the repo. Built lazily so a missing
 * key never crashes at import — callers get a clear error only when they try
 * to use it.
 *
 * Usage:
 *   import { generateText, isGeminiConfigured } from "@/lib/gemini";
 *   const copy = await generateText("Write a 1-line promo for a $997 website.");
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  system?: string;
}

/**
 * Generate text from a prompt. Returns the model's text output.
 * Throws if GEMINI_API_KEY is not configured or the API call fails.
 */
export async function generateText(prompt: string, opts: GenerateOptions = {}): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");

  const model = opts.model || GEMINI_MODEL;
  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxOutputTokens ?? 1024,
    },
  };
  if (opts.system) {
    body.systemInstruction = { parts: [{ text: opts.system }] };
  }

  const res = await fetch(`${API_BASE}/models/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

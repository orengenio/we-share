/**
 * WeShare ⨯ OrenGen brand — single source of truth.
 *
 * WeShare is the OrenGen partner portal ("Powered by WeShare", weshare.orengen.io),
 * so its look is derived directly from the OrenGen campaign brand: near-black navy
 * canvases, a single vivid-orange master accent, and heavy Public Sans display type.
 *
 * These constants centralize the brand asset URLs and palette that were previously
 * hardcoded across headers, auth, and marketing pages.
 */

/** Official OrenGen wordmark (white, for dark surfaces) — hosted on the brand CDN. */
export const ORENGEN_WORDMARK_WHITE =
  "https://cdn.content360.io/ea2381f4-12e0-4efd-b95b-6012c981eae0/uploads/05-2026/wJb1wZczjrrxwoRKmtjrspq1IJwjW00FtCsIfdn6.png";

/** Official OrenGen wordmark (navy, for light surfaces). */
export const ORENGEN_WORDMARK_NAVY =
  "https://cdn.content360.io/ea2381f4-12e0-4efd-b95b-6012c981eae0/uploads/05-2026/bmeUUijIh8dkwmEIWUWDktHNGX2nMZ0HewKw9Q0e.png";

export const ORENGEN_URL = "https://orengen.io";

/** Core brand palette — mirrors the --ws-* CSS tokens in globals.css. */
export const BRAND = {
  bg: "#05070d",
  bg2: "#0a1120",
  panel: "#0c1728",
  navy: "#00254B",
  orange: "#CC5500",
  orangeBright: "#E8762B",
  text: "#f2f6fc",
  muted: "rgba(210,225,245,0.66)",
  tier: {
    standard: "#3b82f6",
    professional: "#22c55e",
    premium: "#CC5500",
  },
} as const;

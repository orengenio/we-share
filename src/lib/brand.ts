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

/**
 * Official OrenGen brand marks — self-hosted in /public/brand so WeShare stays in
 * lock-step with orengen.io (these are the exact asset files committed there) and
 * doesn't depend on a third-party CDN for its core identity.
 */

/** Full wordmark, "GEN" in white — for dark surfaces (headers, hero, footer). */
export const ORENGEN_WORDMARK_WHITE = "/brand/logo-orengen-white.png";

/** Full wordmark, "GEN" in navy — for light surfaces. */
export const ORENGEN_WORDMARK_NAVY = "/brand/logo-orengen-navy.png";

/** Navy "W" monogram on transparent — for light surfaces. */
export const ORENGEN_MARK = "/brand/orengen-mark.png";

/** Navy square app icon (white "W" + orange dot) — favicon / compact mark on dark. */
export const ORENGEN_ICON = "/brand/orengen-icon.svg";

/** Brushed-metal "OrenGen Worldwide" seal. */
export const ORENGEN_SEAL = "/brand/orengen-seal.png";

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

/** Parse a free-form numeric input — no upper cap. */
export function parseCalcNumber(
  raw: string,
  fallback: number,
  min = 0
): number {
  const n = parseFloat(raw.replace(/,/g, ""));
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, n);
}

export function parseCalcInt(raw: string, fallback: number, min = 0): number {
  return Math.floor(parseCalcNumber(raw, fallback, min));
}

/** Format large counts (e.g. 2.5M followers) for display */
export function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

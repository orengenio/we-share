import Image from "next/image";
import { ORENGEN_URL, ORENGEN_WORDMARK_WHITE } from "@/lib/brand";

/**
 * Official OrenGen wordmark (white variant) rendered at a fixed height.
 * Single source of truth so the logo is no longer copy-pasted across files.
 */
export function OrenGenWordmark({
  height = 32,
  className = "",
  link = true,
}: {
  height?: number;
  className?: string;
  link?: boolean;
}) {
  const img = (
    <Image
      src={ORENGEN_WORDMARK_WHITE}
      alt="OrenGen Worldwide"
      width={Math.round(height * 4.1)}
      height={height}
      style={{ height, width: "auto" }}
      unoptimized
      priority
    />
  );
  if (!link) return <span className={className}>{img}</span>;
  return (
    <a
      href={ORENGEN_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label="OrenGen Worldwide"
    >
      {img}
    </a>
  );
}

/**
 * WeShare "W" monogram — a CSS/SVG rendition of the OrenGen mark (white W with an
 * orange accent). Intended for compact placements (favicon, seal core, avatars).
 * Drop in the official vector here when available.
 */
export function WsMonogram({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="OrenGen"
      className={className}
    >
      <polyline
        points="10,16 30,86 50,40 70,86 90,16"
        fill="none"
        stroke="#ffffff"
        strokeWidth="15"
        strokeLinejoin="miter"
        strokeLinecap="butt"
      />
      <circle cx="50" cy="20" r="8.5" fill="#E8762B" />
    </svg>
  );
}

import Image from "next/image";
import { ORENGEN_ICON, ORENGEN_URL, ORENGEN_WORDMARK_WHITE } from "@/lib/brand";

/**
 * Official OrenGen wordmark (white "GEN" variant, for dark surfaces) at a fixed
 * height. Single source of truth so the logo is no longer copy-pasted across files.
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
 * Official OrenGen "W" monogram — the navy-square app icon (white W + orange dot),
 * which reads correctly on both light and dark surfaces. Use for compact placements
 * (header lockup, sidebar, avatars).
 */
export function WsMonogram({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src={ORENGEN_ICON}
      alt="OrenGen"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.16) }}
    />
  );
}

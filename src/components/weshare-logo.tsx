import Link from "next/link";

/**
 * The WeShare brand lockup — mark + wordmark, always a link back to the
 * home page. `height` should match whatever the adjacent OrenGen logo
 * renders at (32 in the public header, 40 on auth pages) so the two brands
 * always sit at equal visual weight.
 */
export default function WeShareLogo({
  height = 32,
  variant = "dark",
  className = "",
}: {
  height?: number;
  variant?: "dark" | "light";
  className?: string;
}) {
  const text = variant === "dark" ? "#ffffff" : "#00254B";
  const sub =
    variant === "dark" ? "rgba(255,255,255,0.55)" : "rgba(0,37,75,0.55)";
  const wordmarkSize = Math.round(height * 0.56);
  const subSize = Math.max(8, Math.round(height * 0.26));

  return (
    <Link
      href="/"
      aria-label="WeShare — back to home"
      className={`inline-flex items-center flex-shrink-0 ${className}`}
      style={{ gap: Math.round(height * 0.25), lineHeight: 1 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/favicon.svg"
        alt=""
        width={height}
        height={height}
        style={{ width: height, height, borderRadius: height * 0.22 }}
      />
      <span className="flex flex-col justify-center">
        <span
          style={{
            fontSize: wordmarkSize,
            fontWeight: 800,
            color: text,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          WeShare
        </span>
        <span
          style={{
            fontSize: subSize,
            fontWeight: 700,
            color: sub,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            marginTop: Math.max(2, Math.round(height * 0.08)),
            lineHeight: 1,
          }}
        >
          by OrenGen
        </span>
      </span>
    </Link>
  );
}

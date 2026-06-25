import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number; // percentage change: positive = green, negative = red, 0/undefined = neutral
  icon?: React.ReactNode;
  highlight?: boolean; // uses orange accent
}

export default function StatsCard({
  title,
  value,
  subtitle,
  change,
  icon,
  highlight = false,
}: StatsCardProps) {
  const hasChange = change !== undefined && change !== null;
  const isPositive = hasChange && change > 0;
  const isNegative = hasChange && change < 0;
  const isNeutral = hasChange && change === 0;

  const changeColor = isPositive
    ? "text-emerald-600"
    : isNegative
    ? "text-red-500"
    : "text-gray-400";

  const changeBg = isPositive
    ? "bg-emerald-50"
    : isNegative
    ? "bg-red-50"
    : "bg-gray-50";

  const ChangeIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div
      className={[
        "relative flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md overflow-hidden",
        highlight ? "border-orange-200" : "border-gray-200",
      ].join(" ")}
    >
      {/* Orange accent strip on highlight cards */}
      {highlight && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
          style={{ backgroundColor: "#CC5500" }}
        />
      )}

      {/* Header: title + icon */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 leading-none">{title}</p>
        {icon && (
          <span
            className={[
              "flex items-center justify-center w-9 h-9 rounded-lg",
              highlight ? "text-orange-600" : "text-navy-700",
            ].join(" ")}
            style={
              highlight
                ? { backgroundColor: "rgba(204,85,0,0.1)" }
                : { backgroundColor: "rgba(0,51,102,0.08)", color: "#003366" }
            }
          >
            {icon}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="space-y-1">
        <p
          className="text-2xl font-bold tracking-tight leading-none"
          style={{ color: highlight ? "#CC5500" : "#003366" }}
        >
          {value}
        </p>

        {/* Subtitle and/or change badge */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasChange && (
            <span
              className={[
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold",
                changeColor,
                changeBg,
              ].join(" ")}
            >
              <ChangeIcon size={11} strokeWidth={2.5} />
              {isPositive ? "+" : ""}
              {change!.toFixed(1)}%
            </span>
          )}
          {subtitle && (
            <p className="text-xs text-gray-400 leading-none">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EarningsDataPoint {
  month: string; // e.g. "Jan", "Feb", or "2026-01"
  commissions: number;
}

interface EarningsChartProps {
  data: EarningsDataPoint[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format "2026-01" → "Jan '26" for display, pass-through short labels unchanged */
function formatMonthLabel(raw: string): string {
  if (/^\d{4}-\d{2}$/.test(raw)) {
    const [year, month] = raw.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
  return raw;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3.5 py-2.5 text-sm">
      <p className="text-gray-500 font-medium mb-1">
        {label ? formatMonthLabel(label) : ""}
      </p>
      <p className="font-bold" style={{ color: "#00254B" }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EarningsChart({ data }: EarningsChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    monthLabel: formatMonthLabel(d.month),
  }));

  const maxValue = Math.max(...data.map((d) => d.commissions), 0);
  const yAxisMax = maxValue === 0 ? 1000 : Math.ceil((maxValue * 1.25) / 100) * 100;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-900">Monthly Commissions</h3>
        <p className="text-xs text-gray-400 mt-0.5">Earned commissions over the last 12 months</p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00254B" stopOpacity={0.18} />
              <stop offset="75%" stopColor="#00254B" stopOpacity={0.04} />
              <stop offset="100%" stopColor="#00254B" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
            vertical={false}
          />

          <XAxis
            dataKey="monthLabel"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            dy={6}
          />

          <YAxis
            tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            width={48}
            domain={[0, yAxisMax]}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: "#00254B",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
          />

          <Area
            type="monotone"
            dataKey="commissions"
            stroke="#00254B"
            strokeWidth={2}
            fill="url(#earningsGradient)"
            dot={false}
            activeDot={{
              r: 4,
              fill: "#CC5500",
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Summary row */}
      {data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>
            Total:{" "}
            <span className="font-semibold text-gray-700">
              {formatCurrency(data.reduce((sum, d) => sum + d.commissions, 0))}
            </span>
          </span>
          <span>
            Avg / mo:{" "}
            <span className="font-semibold text-gray-700">
              {formatCurrency(
                data.reduce((sum, d) => sum + d.commissions, 0) / (data.length || 1)
              )}
            </span>
          </span>
          <span>
            Best month:{" "}
            <span className="font-semibold text-gray-700">
              {formatCurrency(maxValue)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

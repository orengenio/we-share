"use client";

import { parseCalcNumber } from "@/lib/calculator-utils";

const LINE = "rgba(148,163,184,0.18)";

interface Props {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  step?: number | "any";
  hint?: string;
}

export default function CalculatorNumberInput({
  label,
  value,
  onChange,
  min = 0,
  step = "any",
  hint,
}: Props) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: "rgba(148,163,184,0.7)" }}>
        {label}
      </label>
      <input
        type="number"
        min={min}
        step={step}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(parseCalcNumber(e.target.value, value, min))}
        className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40"
        style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${LINE}` }}
      />
      {hint && (
        <p className="text-[11px] mt-1" style={{ color: "rgba(148,163,184,0.45)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

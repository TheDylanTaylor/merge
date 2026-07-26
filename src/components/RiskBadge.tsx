"use client";

import type { Risk } from "@/types/changeset";
import { RISK_META } from "@/types/changeset";

// Concrete hues that match the CSS tokens (--safe/--review/--danger) so we can
// build translucent fills/borders with color-mix without reading the vars.
const TINT: Record<Risk, string> = {
  safe: "#3fb950",
  review: "#e0a32e",
  danger: "#f85149",
};

export default function RiskBadge({
  risk,
  className = "",
}: {
  risk: Risk;
  className?: string;
}) {
  const meta = RISK_META[risk];
  const tint = TINT[risk];

  return (
    <span
      className={`inline-flex select-none items-center gap-1.5 rounded-full border px-2 py-[3px] font-mono text-[10.5px] font-medium uppercase leading-none tracking-[0.12em] ${className}`}
      style={{
        color: tint,
        borderColor: `color-mix(in srgb, ${tint} 42%, transparent)`,
        background: `color-mix(in srgb, ${tint} 12%, transparent)`,
      }}
    >
      <span className="text-[12px] leading-none" aria-hidden>
        {meta.sign}
      </span>
      {meta.label}
    </span>
  );
}

"use client";

import type { System } from "@/types/changeset";
import type { ComponentType, SVGProps } from "react";

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

const svgBase: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const Diamond: Glyph = (p) => (
  <svg {...svgBase} {...p}>
    <path d="M12 3 21 12 12 21 3 12Z" />
  </svg>
);

const Envelope: Glyph = (p) => (
  <svg {...svgBase} {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.2" />
    <path d="M3.5 7 12 12.7 20.5 7" />
  </svg>
);

const Hash: Glyph = (p) => (
  <svg {...svgBase} {...p}>
    <path d="M9.5 4 8 20M16 4 14.5 20M4 9h16M3.5 15h16" />
  </svg>
);

const Card: Glyph = (p) => (
  <svg {...svgBase} {...p}>
    <rect x="3" y="6" width="18" height="12" rx="2.2" />
    <path d="M3 10h18M7 14.5h3" />
  </svg>
);

const Lock: Glyph = (p) => (
  <svg {...svgBase} {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    <path d="M12 14.5v2" />
  </svg>
);

const Person: Glyph = (p) => (
  <svg {...svgBase} {...p}>
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
  </svg>
);

const Bag: Glyph = (p) => (
  <svg {...svgBase} {...p}>
    <path d="M6 8h12l-1 11.5H7L6 8Z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </svg>
);

export const SYSTEM_META: Record<
  System,
  { label: string; tint: string; Glyph: Glyph }
> = {
  linear: { label: "Linear", tint: "#8b7cf6", Glyph: Diamond },
  gmail: { label: "Gmail", tint: "#e0655b", Glyph: Envelope },
  slack: { label: "Slack", tint: "#c264cf", Glyph: Hash },
  stripe: { label: "Stripe", tint: "#6f76f5", Glyph: Card },
  permissions: { label: "Permissions", tint: "#e0a32e", Glyph: Lock },
  crm: { label: "CRM", tint: "#3fb6c9", Glyph: Person },
  shopping: { label: "Shopping", tint: "#3fb950", Glyph: Bag },
};

export function systemLabel(system: System): string {
  return SYSTEM_META[system].label;
}

export function systemTint(system: System): string {
  return SYSTEM_META[system].tint;
}

export default function SystemIcon({
  system,
  size = 28,
  showLabel = false,
  className = "",
}: {
  system: System;
  size?: number;
  showLabel?: boolean;
  className?: string;
}) {
  const { label, tint, Glyph } = SYSTEM_META[system];
  const inner = Math.round(size * 0.56);

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="grid shrink-0 place-items-center rounded-[9px] border"
        style={{
          width: size,
          height: size,
          color: tint,
          borderColor: `color-mix(in srgb, ${tint} 30%, transparent)`,
          background: `color-mix(in srgb, ${tint} 11%, transparent)`,
        }}
      >
        <Glyph width={inner} height={inner} />
      </span>
      {showLabel && (
        <span className="font-mono text-xs uppercase tracking-wider text-muted">
          {label}
        </span>
      )}
    </span>
  );
}

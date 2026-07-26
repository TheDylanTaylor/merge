"use client";

import type { Role } from "@/types/changeset";
import { roleLabel } from "@/lib/permissions";

const TINT: Record<Role, string> = {
  ceo: "#8b7cf6",
  finance: "#3fb950",
  legal: "#e0a32e",
  engineering: "#3fb6c9",
  marketing: "#e0655b",
};

export default function RoleAvatar({
  role,
  size = 22,
  withLabel = false,
  className = "",
}: {
  role: Role;
  size?: number;
  withLabel?: boolean;
  className?: string;
}) {
  const tint = TINT[role];
  const label = roleLabel(role);

  return (
    <span
      className={`inline-flex items-center gap-2 ${className}`}
      title={`Requires ${label}`}
    >
      <span
        className="grid shrink-0 place-items-center rounded-full border font-mono font-semibold uppercase"
        style={{
          width: size,
          height: size,
          fontSize: Math.round(size * 0.42),
          color: tint,
          borderColor: `color-mix(in srgb, ${tint} 48%, transparent)`,
          background: `color-mix(in srgb, ${tint} 15%, transparent)`,
        }}
      >
        {label.charAt(0)}
      </span>
      {withLabel && <span className="text-xs text-muted">{label}</span>}
    </span>
  );
}

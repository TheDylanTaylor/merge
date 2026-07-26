"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LiveBadge } from "@/components/ui/Badge";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface Integration {
  id: string;
  name: string;
  category: string;
  live: boolean;
  detail: string;
}

// On-brand tints per integration (violet reserved for intelligence/brand).
const TINT: Record<string, string> = {
  anthropic: "#7c6cf6",
  resend: "#e0655b",
  linear: "#8b7cf6",
  slack: "#c264cf",
  channel3: "#3fb950",
  crustdata: "#3fb6c9",
  hexclave: "#e0a32e",
};

function LogoTile({ id, name }: { id: string; name: string }) {
  const tint = TINT[id] ?? "var(--accent)";
  return (
    <span
      className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border font-mono text-[13px] font-semibold uppercase"
      style={{
        color: tint,
        borderColor: `color-mix(in srgb, ${tint} 30%, transparent)`,
        background: `color-mix(in srgb, ${tint} 11%, transparent)`,
      }}
      aria-hidden
    >
      {name.charAt(0)}
    </span>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="h-8 w-8 shrink-0 rounded-[9px] bg-surface-2" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-1/2 rounded bg-surface-2" />
        <div className="h-2.5 w-2/3 rounded bg-surface-2" />
      </div>
      <span className="h-4 w-12 rounded-full bg-surface-2" />
    </div>
  );
}

export default function IntegrationsStrip({
  integrations,
  liveCount,
  total,
}: {
  integrations: Integration[] | null;
  liveCount: number;
  total: number;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-[15px] font-semibold text-text">Integrations</h2>
        {integrations && (
          <span className="font-mono text-[11.5px] text-muted">
            <span className="text-safe">{liveCount}</span> / {total} live
          </span>
        )}
      </div>

      {!integrations ? (
        <div className="divide-y divide-border">
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {integrations.map((it, i) => (
            <motion.li
              key={it.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: EASE, delay: 0.04 + i * 0.04 }}
              className="flex items-center gap-3 px-4 py-3"
              style={{ opacity: it.live ? 1 : 0.92 }}
            >
              <LogoTile id={it.id} name={it.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-text">
                  {it.name}
                </p>
                <p className="truncate text-[11.5px] text-faint">{it.detail}</p>
              </div>
              <LiveBadge live={it.live} />
            </motion.li>
          ))}
        </ul>
      )}

      <div className="border-t border-border px-4 py-3">
        <Link
          href="/app/integrations"
          className="font-mono text-[11.5px] text-muted transition-colors hover:text-text"
        >
          Manage integrations →
        </Link>
      </div>
    </div>
  );
}

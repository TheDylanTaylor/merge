"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MotionConfig, motion } from "framer-motion";
import { useLedger, type ActivityEvent, type EventType } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import DayGroup from "@/components/app/activity/DayGroup";
import { downloadCsv, eventsToCsv, groupByDay } from "@/components/app/activity/util";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Filter = "all" | EventType;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "merged", label: "Merged" },
  { id: "reverted", label: "Reverted" },
  { id: "proposed", label: "Proposed" },
];

function DownloadGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LedgerGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 3h9l3 3v15H6zM6 3v18M9.5 8.5h5M9.5 12h5M9.5 15.5h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FilterChip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors"
      style={{
        color: active ? "var(--text)" : "var(--muted)",
        borderColor: active
          ? "color-mix(in srgb, var(--accent) 45%, transparent)"
          : "var(--border)",
        background: active
          ? "color-mix(in srgb, var(--accent) 12%, transparent)"
          : "transparent",
      }}
    >
      {label}
      <span
        className="font-mono text-[11px] tabular-nums"
        style={{ color: active ? "var(--accent)" : "var(--faint)" }}
      >
        {count}
      </span>
    </button>
  );
}

function RowSkeleton() {
  return (
    <div className="flex min-h-[64px] items-center gap-4 border-b border-border px-4 py-3 last:border-b-0">
      <div className="h-7 w-[68px] shrink-0 rounded bg-surface-2" />
      <div className="h-7 w-7 shrink-0 rounded-[9px] bg-surface-2" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-1/2 rounded bg-surface-2" />
        <div className="h-2.5 w-1/3 rounded bg-surface-2" />
      </div>
      <div className="h-5 w-20 shrink-0 rounded-full bg-surface-2" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto flex max-w-[400px] flex-col items-center py-24 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-xl border border-border bg-surface-2 text-muted">
        <LedgerGlyph />
      </div>
      <h2 className="mt-5 text-[15px] font-semibold text-text">No activity yet</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        Every merge and revert is recorded here with a full audit trail —
        timestamps, systems touched, and who approved.
      </p>
      <Link
        href="/app"
        className="mt-6 inline-flex items-center gap-1.5 font-mono text-[12.5px] text-accent transition-opacity hover:opacity-80"
      >
        Propose a changeset
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 12h13M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
}

export default function ActivityPage() {
  const { hydrated, events, stats } = useLedger();
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: events.length,
      merged: 0,
      reverted: 0,
      proposed: 0,
    };
    for (const e of events) c[e.type] += 1;
    return c;
  }, [events]);

  const filtered = useMemo<ActivityEvent[]>(
    () => (filter === "all" ? events : events.filter((e) => e.type === filter)),
    [events, filter],
  );

  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  const handleExport = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`merge-activity-${stamp}.csv`, eventsToCsv(filtered));
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-6">
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text">
              Activity
            </h1>
            <p className="mt-1 max-w-xl text-[13.5px] text-muted">
              An immutable record of every changeset proposed, merged, and
              reverted.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-mono text-[13px] tabular-nums text-text">
                {hydrated ? events.length : "—"}
                <span className="text-faint"> events</span>
              </div>
              <div className="font-mono text-[11.5px] tabular-nums text-faint">
                {hydrated ? stats.landminesCaught : "—"} landmines caught
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              disabled={!hydrated || filtered.length === 0}
            >
              <DownloadGlyph />
              Export CSV
            </Button>
          </div>
        </div>

        {/* filters */}
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <FilterChip
              key={f.id}
              label={f.label}
              count={counts[f.id]}
              active={filter === f.id}
              onClick={() => setFilter(f.id)}
            />
          ))}
        </div>

        {/* ledger */}
        {!hydrated ? (
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            {Array.from({ length: 5 }).map((_, i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="rounded-lg border border-border bg-surface px-4 py-16 text-center font-mono text-[12.5px] text-faint"
          >
            No {filter} events yet.
          </motion.div>
        ) : (
          <div className="space-y-6">
            {(() => {
              let running = 0;
              return groups.map((bucket) => {
                const start = running;
                running += bucket.events.length;
                return (
                  <DayGroup key={bucket.key} bucket={bucket} startIndex={start} />
                );
              });
            })()}
          </div>
        )}
      </div>
    </MotionConfig>
  );
}

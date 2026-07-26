"use client";

import type { DayBucket } from "./util";
import ActivityRow from "./ActivityRow";

/**
 * One day's worth of ledger entries: a sticky day header + its rows.
 * `startIndex` seeds the entrance-stagger so rows cascade across the whole
 * ledger, not just within a group.
 */
export default function DayGroup({
  bucket,
  startIndex,
}: {
  bucket: DayBucket;
  startIndex: number;
}) {
  return (
    <section>
      <div
        className="sticky top-[52px] z-10 flex items-center gap-3 py-2 backdrop-blur-sm"
        style={{ background: "color-mix(in srgb, var(--bg) 88%, transparent)" }}
      >
        <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
          {bucket.label}
        </h2>
        <div className="h-px flex-1 bg-border" />
        <span className="font-mono text-[11px] tabular-nums text-faint">
          {bucket.events.length}
        </span>
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        {bucket.events.map((ev, i) => (
          <ActivityRow key={ev.id} event={ev} index={startIndex + i} />
        ))}
      </div>
    </section>
  );
}

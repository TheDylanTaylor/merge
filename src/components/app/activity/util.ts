// ============================================================================
// Merge — Activity log helpers (pure functions; no JSX).
// Relative/absolute time, day grouping, sublines, and a real CSV builder used
// by the /app/activity ledger. Everything derives from ActivityEvent — the
// same shape the store persists on every propose / merge / revert.
// ============================================================================

import type { ActivityEvent, EventType } from "@/lib/store";
import { systemLabel } from "@/components/SystemIcon";
import { roleLabel } from "@/lib/permissions";

// ---- time formatting -------------------------------------------------------

/** "2:14 PM" — precise wall-clock, used as the primary timestamp line. */
export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "just now" · "3m ago" · "5h ago" · "2d ago" · "Jul 24" for older. */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/** Full timestamp for the hover tooltip — the audit-precise form. */
export function formatFull(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ---- day grouping ----------------------------------------------------------

export interface DayBucket {
  key: string;
  label: string;
  events: ActivityEvent[];
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Group events into day buckets (newest first), with human day labels. */
export function groupByDay(
  events: ActivityEvent[],
  now: Date = new Date(),
): DayBucket[] {
  const todayKey = dayKey(now);
  const yd = new Date(now);
  yd.setDate(yd.getDate() - 1);
  const yesterdayKey = dayKey(yd);

  const buckets: DayBucket[] = [];
  const byKey = new Map<string, DayBucket>();

  const sorted = [...events].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );

  for (const ev of sorted) {
    const d = new Date(ev.at);
    const k = dayKey(d);
    let bucket = byKey.get(k);
    if (!bucket) {
      const short = d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      let label: string;
      if (k === todayKey) label = `Today · ${short}`;
      else if (k === yesterdayKey) label = `Yesterday · ${short}`;
      else
        label = d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      bucket = { key: k, label, events: [] };
      byKey.set(k, bucket);
      buckets.push(bucket);
    }
    bucket.events.push(ev);
  }
  return buckets;
}

// ---- semantic copy ---------------------------------------------------------

function plural(n: number, one: string): string {
  return `${n} ${one}${n === 1 ? "" : "s"}`;
}

export const EVENT_VERB: Record<EventType, string> = {
  proposed: "Proposed",
  merged: "Merged",
  reverted: "Reverted",
};

/** The metadata subline under an event's goal title. */
export function eventSubline(e: ActivityEvent): string {
  if (e.type === "proposed") {
    return `Proposed for review · ${plural(e.systems.length, "system")} in scope`;
  }
  if (e.type === "reverted") {
    const n = e.results?.length ?? e.systems.length;
    return `${plural(n, "side effect")} rolled back`;
  }
  // merged
  const parts: string[] = [`${plural(e.applied, "hunk")} applied`];
  if (e.mocked > 0) parts.push(`${e.mocked} mocked`);
  if (e.blocked > 0) parts.push(`${e.blocked} blocked`);
  if (e.landminesCaught > 0)
    parts.push(`${plural(e.landminesCaught, "landmine")} caught`);
  return parts.join(" · ");
}

/** Short changeset id shown in mono (e.g. "seed-onbo…" → keep full, it's short). */
export function shortId(id: string): string {
  return id.length > 18 ? `${id.slice(0, 17)}…` : id;
}

// ---- CSV export ------------------------------------------------------------

const CSV_HEADERS = [
  "Timestamp (ISO)",
  "Type",
  "Changeset",
  "Goal",
  "Systems",
  "Applied",
  "Mocked",
  "Blocked",
  "Landmines caught",
  "Approver",
];

function csvCell(v: string | number | null | undefined): string {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Build a RFC-4180-ish CSV of the ledger — real audit export, not a stub. */
export function eventsToCsv(events: ActivityEvent[]): string {
  const rows = events.map((e) =>
    [
      e.at,
      e.type,
      e.changesetId,
      e.goal,
      e.systems.map(systemLabel).join(" | "),
      e.applied,
      e.mocked,
      e.blocked,
      e.landminesCaught,
      e.actorRole ? roleLabel(e.actorRole) : "",
    ]
      .map(csvCell)
      .join(","),
  );
  return [CSV_HEADERS.join(","), ...rows].join("\r\n");
}

/** Trigger a real client-side download of a CSV blob. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

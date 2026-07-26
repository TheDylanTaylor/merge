"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import type { StoredChangeset } from "@/lib/store";
import type { System } from "@/types/changeset";
import { Badge } from "@/components/ui/Badge";
import SystemIcon from "@/components/SystemIcon";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Compact human-relative timestamp: "just now", "5m ago", "yesterday", "Jul 12". */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const s = Math.round(diff / 1000);
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d === 1) return "yesterday";
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.round(d / 7)}w ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

const STATUS_META: Record<
  StoredChangeset["status"],
  { dot: string; tone: "review" | "merged" | "reverted"; label: string }
> = {
  proposed: { dot: "var(--review)", tone: "review", label: "Proposed" },
  merged: { dot: "var(--safe)", tone: "merged", label: "Merged" },
  reverted: { dot: "var(--muted)", tone: "reverted", label: "Reverted" },
};

function SystemStack({ systems }: { systems: System[] }) {
  const shown = systems.slice(0, 4);
  const extra = systems.length - shown.length;
  return (
    <div className="flex items-center" aria-hidden>
      {shown.map((sys, i) => (
        <span
          key={sys}
          className="rounded-[9px]"
          style={{
            marginLeft: i === 0 ? 0 : -6,
            boxShadow: "0 0 0 2px var(--surface)",
            borderRadius: 9,
          }}
        >
          <SystemIcon system={sys} size={22} />
        </span>
      ))}
      {extra > 0 && (
        <span
          className="grid h-[22px] min-w-[22px] place-items-center rounded-[9px] border border-border bg-surface-2 px-1 font-mono text-[10px] text-muted"
          style={{ marginLeft: -6, boxShadow: "0 0 0 2px var(--surface)" }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}

function Row({
  cs,
  navigable,
  onOpen,
  index,
}: {
  cs: StoredChangeset;
  navigable: boolean;
  onOpen: (id: string) => void;
  index: number;
}) {
  const meta = STATUS_META[cs.status];

  const inner = (
    <>
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: meta.dot }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-text">{cs.goal}</p>
        <p className="mt-0.5 truncate font-mono text-[11.5px] text-faint">
          {relativeTime(cs.createdAt)} · {cs.systems.length} system
          {cs.systems.length === 1 ? "" : "s"} · {cs.totalHunks} hunk
          {cs.totalHunks === 1 ? "" : "s"}
          {cs.dangerHunks > 0 ? (
            <span className="text-danger"> · {cs.dangerHunks} flagged</span>
          ) : null}
        </p>
      </div>
      <div className="hidden shrink-0 sm:block">
        <SystemStack systems={cs.systems} />
      </div>
      <div className="shrink-0">
        <Badge tone={meta.tone} dot={cs.status === "merged"}>
          {meta.label}
        </Badge>
      </div>
      <span
        className="grid h-5 w-5 shrink-0 place-items-center text-faint"
        aria-hidden
      >
        {navigable && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </>
  );

  const rowClass =
    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors";

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: EASE, delay: 0.04 + index * 0.04 }}
    >
      {navigable ? (
        <button
          type="button"
          onClick={() => onOpen(cs.id)}
          className={`${rowClass} hover:bg-surface-2`}
          aria-label={`Open changeset: ${cs.goal}`}
        >
          {inner}
        </button>
      ) : (
        <div
          className={rowClass}
          title="Archived — this changeset is no longer loaded for review"
        >
          {inner}
        </div>
      )}
    </motion.li>
  );
}

function Skeleton() {
  return (
    <ul>
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="flex items-center gap-3 border-t border-border px-4 py-3 first:border-t-0"
        >
          <span className="h-2 w-2 rounded-full bg-surface-3" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-1/2 rounded bg-surface-2" />
            <div className="h-2.5 w-1/3 rounded bg-surface-2" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function RecentChangesets({
  changesets,
  hydrated,
}: {
  changesets: StoredChangeset[];
  hydrated: boolean;
}) {
  const router = useRouter();
  const [live, setLive] = useState<Set<string>>(new Set());

  // A changeset is navigable only when its full object is still in
  // sessionStorage (the review screen hydrates from that key). Seeded /
  // historical rows are shown but not clickable.
  useEffect(() => {
    if (!hydrated) return;
    const s = new Set<string>();
    for (const cs of changesets) {
      if (sessionStorage.getItem(`changeset:${cs.id}`)) s.add(cs.id);
    }
    setLive(s);
  }, [changesets, hydrated]);

  const open = (id: string) => router.push(`/review/${id}`);
  const rows = changesets.slice(0, 6);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-[15px] font-semibold text-text">Recent changesets</h2>
        <Link
          href="/app/activity"
          className="font-mono text-[11.5px] text-muted transition-colors hover:text-text"
        >
          View activity →
        </Link>
      </div>

      {!hydrated ? (
        <Skeleton />
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <span
            className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface-2 text-muted"
            aria-hidden
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 3v12a3 3 0 0 0 3 3h9M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <p className="mt-3 text-[15px] font-semibold text-text">
            No changesets yet
          </p>
          <p className="mt-1 max-w-[280px] text-[13px] text-muted">
            Give an agent a goal above. It drafts a coordinated diff across your
            tools and you decide what merges.
          </p>
          <Link
            href="#compose"
            className="mt-4 font-mono text-[12px] text-accent transition-opacity hover:opacity-80"
          >
            Propose a changeset →
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((cs, i) => (
            <Row
              key={cs.id}
              cs={cs}
              navigable={live.has(cs.id)}
              onOpen={open}
              index={i}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

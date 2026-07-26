"use client";

import { useEffect, useMemo, useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import { useLedger } from "@/lib/store";
import Composer from "@/components/app/Composer";
import StatTile from "@/components/app/StatTile";
import RecentChangesets from "@/components/app/RecentChangesets";
import IntegrationsStrip, {
  type Integration,
} from "@/components/app/IntegrationsStrip";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface StatusResponse {
  mode: "mock" | "hybrid" | "live";
  liveCount: number;
  total: number;
  integrations: Integration[];
}

function Icon({ d }: { d: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const MODE_META: Record<
  StatusResponse["mode"],
  { label: string; color: string }
> = {
  live: { label: "Live", color: "var(--safe)" },
  hybrid: { label: "Hybrid", color: "var(--review)" },
  mock: { label: "Mock", color: "var(--muted)" },
};

function ModePill({ status }: { status: StatusResponse | null }) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-faint">
        <span className="h-1.5 w-1.5 rounded-full bg-faint" aria-hidden />
        Checking…
      </span>
    );
  }
  const m = MODE_META[status.mode];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em]"
      style={{
        color: m.color,
        borderColor: `color-mix(in srgb, ${m.color} 40%, transparent)`,
        background: `color-mix(in srgb, ${m.color} 11%, transparent)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: m.color }}
        aria-hidden
      />
      {m.label} · {status.liveCount}/{status.total} live
    </span>
  );
}

export default function AppHome() {
  const { hydrated, changesets, events, stats } = useLedger();
  const [status, setStatus] = useState<StatusResponse | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/status")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: StatusResponse) => {
        if (alive) setStatus(data);
      })
      .catch(() => {
        /* status strip falls back to its loading skeleton */
      });
    return () => {
      alive = false;
    };
  }, []);

  // Honest, derived context lines — no fabricated trends.
  const derived = useMemo(() => {
    const pending = changesets.filter((c) => c.status === "proposed").length;
    const mergedCount = events.filter((e) => e.type === "merged").length;
    return {
      proposedSub:
        pending > 0
          ? `${pending} awaiting review`
          : changesets.length > 0
            ? "all reviewed"
            : "none yet",
      mergedSub:
        mergedCount > 0
          ? `across ${mergedCount} changeset${mergedCount === 1 ? "" : "s"}`
          : "none merged yet",
      landmineSub:
        stats.landminesCaught > 0 ? "blocked before merge" : "all merges clean",
    };
  }, [changesets, events, stats.landminesCaught]);

  const liveCount = status?.liveCount ?? 0;
  const total = status?.total ?? 7;
  const systemsTint =
    status && status.liveCount === status.total ? "var(--safe)" : "var(--accent)";

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-7">
        {/* 1 — page header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
          className="flex flex-wrap items-start justify-between gap-3"
        >
          <div>
            <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-text">
              Overview
            </h1>
            <p className="mt-1 text-[14px] text-muted">
              Every change your agents propose, reviewed as a diff before it
              touches a real system.
            </p>
          </div>
          <div className="pt-1">
            <ModePill status={status} />
          </div>
        </motion.div>

        {/* 2 — stat tiles */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile
            index={0}
            label="Changesets proposed"
            value={stats.changesets}
            tint="var(--accent)"
            countUp={hydrated}
            sublabel={derived.proposedSub}
            icon={<Icon d="M6 3v12M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 9c0 6-6 3-6 9" />}
          />
          <StatTile
            index={1}
            label="Hunks merged"
            value={stats.hunksMerged}
            tint="var(--safe)"
            countUp={hydrated}
            sublabel={derived.mergedSub}
            icon={<Icon d="M6 3v6M6 21v-6M6 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM18 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 9c0 6-6 3-6 6" />}
          />
          <StatTile
            index={2}
            label="Landmines caught"
            value={stats.landminesCaught}
            tint="var(--danger)"
            countUp={hydrated}
            sublabel={derived.landmineSub}
            icon={<Icon d="M12 3l7.5 3v5c0 4.5-3 8.3-7.5 10-4.5-1.7-7.5-5.5-7.5-10V6L12 3ZM12 8v4M12 15.5v.5" />}
          />
          <StatTile
            index={3}
            label="Systems connected"
            value={liveCount}
            tint={systemsTint}
            dots={{ filled: liveCount, total }}
            sublabel={status ? `${MODE_META[status.mode].label.toLowerCase()} mode` : "checking…"}
            icon={<Icon d="M9 3v4M15 3v4M6 7h12l-1 6a5 5 0 0 1-10 0L6 7ZM12 18v3" />}
          />
        </div>

        {/* 3 — composer */}
        <Composer id="compose" />

        {/* 4 — two-column split */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <RecentChangesets changesets={changesets} hydrated={hydrated} />
          </div>
          <div className="lg:col-span-4">
            <IntegrationsStrip
              integrations={status?.integrations ?? null}
              liveCount={liveCount}
              total={total}
            />
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

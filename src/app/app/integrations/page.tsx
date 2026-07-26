"use client";

import { useEffect, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import IntegrationCard, {
  type StatusIntegration,
} from "@/components/app/integrations/IntegrationCard";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type StatusResponse = {
  mode: "mock" | "hybrid" | "live";
  liveCount: number;
  total: number;
  integrations: StatusIntegration[];
};

// Category grouping — ordered from "understands the goal" → "makes it real" →
// "governs it" → "roadmap". Labels mirror the /api/status `category` values.
const CATEGORY_ORDER = ["intelligence", "execution", "governance", "stretch"] as const;
const CATEGORY_META: Record<string, { label: string; blurb: string }> = {
  intelligence: {
    label: "Intelligence",
    blurb: "Understands the goal and drafts the diff.",
  },
  execution: {
    label: "Execution",
    blurb: "Where an approved hunk becomes a real side effect.",
  },
  governance: {
    label: "Governance",
    blurb: "Who is allowed to approve, and how it is enforced.",
  },
  stretch: {
    label: "Stretch",
    blurb: "Wired for the roadmap — not on the demo path yet.",
  },
};

const MODE_META: Record<StatusResponse["mode"], { label: string; color: string }> = {
  mock: { label: "Mock mode", color: "var(--muted)" },
  hybrid: { label: "Hybrid", color: "var(--review)" },
  live: { label: "Live", color: "var(--safe)" },
};

function ModePill({ mode }: { mode: StatusResponse["mode"] }) {
  const m = MODE_META[mode];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em]"
      style={{
        color: m.color,
        borderColor: `color-mix(in srgb, ${m.color} 40%, transparent)`,
        background: `color-mix(in srgb, ${m.color} 11%, transparent)`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} aria-hidden />
      {m.label}
    </span>
  );
}

function HeaderSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-7 w-48 rounded-md bg-surface-2" />
      <div className="h-4 w-96 max-w-full rounded bg-surface-2" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="card p-[18px]">
      <div className="flex items-start gap-3">
        <div className="h-[38px] w-[38px] rounded-[9px] bg-surface-2" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-2/3 rounded bg-surface-2" />
          <div className="h-3 w-1/3 rounded bg-surface-2" />
        </div>
      </div>
      <div className="mt-4 h-3 w-full rounded bg-surface-2" />
      <div className="mt-2 h-3 w-4/5 rounded bg-surface-2" />
      <div className="mt-4 flex gap-1.5">
        <div className="h-5 w-24 rounded bg-surface-2" />
        <div className="h-5 w-20 rounded bg-surface-2" />
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const json = (await res.json()) as StatusResponse;
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const grouped = data
    ? CATEGORY_ORDER.map((cat) => ({
        cat,
        items: data.integrations.filter((i) => i.category === cat),
      })).filter((g) => g.items.length > 0)
    : [];

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-8">
        {/* header */}
        {loading ? (
          <HeaderSkeleton />
        ) : (
          <motion.header
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <p className="eyebrow mb-2">Environment</p>
              <h1 className="text-h1 font-semibold tracking-tight text-text">
                Integrations
              </h1>
              <p className="mt-2 max-w-prose text-[14px] leading-relaxed text-muted">
                The exact APIs Merge can touch, and whether each one is wired to a real
                side effect right now. Live vs mock is read straight from your
                environment — never faked.
              </p>
            </div>
            {data && (
              <div className="flex items-center gap-3">
                <span className="font-mono text-[12px] text-muted">
                  <span className="text-text">{data.liveCount}</span> / {data.total} live
                </span>
                <ModePill mode={data.mode} />
              </div>
            )}
          </motion.header>
        )}

        {/* honest note */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE, delay: 0.05 }}
            className="card flex items-start gap-3 p-4"
          >
            <span
              className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md"
              style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 8h.01M11 12h1v4h1"
                  stroke="var(--accent)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="9" stroke="var(--accent)" strokeWidth="1.6" />
              </svg>
            </span>
            <p className="text-[13px] leading-relaxed text-muted">
              Merge runs fully in <span className="text-text">mock mode with zero keys</span>{" "}
              — every scenario and merge works, simulated. Adding a key flips exactly one
              adapter to a real side effect, with no other changes.
            </p>
          </motion.div>
        )}

        {/* error state */}
        {error && (
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <p className="text-[14px] text-text">Couldn&apos;t reach the status endpoint.</p>
            <p className="max-w-sm text-[13px] text-muted">
              The integrations list is served by <code className="font-mono text-[12px] text-text-2">/api/status</code>.
              Check that the app server is running.
            </p>
            <button
              type="button"
              onClick={load}
              className="mt-1 rounded-lg border border-border-strong bg-surface-2 px-4 py-2 text-[13px] text-text transition-colors hover:bg-surface-3"
            >
              Try again
            </button>
          </div>
        )}

        {/* loading grid */}
        {loading && (
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* grouped integration cards */}
        {!loading &&
          !error &&
          grouped.map((group) => {
            const cm = CATEGORY_META[group.cat] ?? { label: group.cat, blurb: "" };
            const liveInGroup = group.items.filter((i) => i.live).length;
            return (
              <section key={group.cat} className="space-y-4">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <h2 className="text-[16px] font-semibold text-text">{cm.label}</h2>
                    <p className="mt-0.5 text-[12.5px] text-muted">{cm.blurb}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-faint">
                    {liveInGroup}/{group.items.length} live
                  </span>
                </div>
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
                >
                  {group.items.map((i, idx) => (
                    <IntegrationCard key={i.id} integration={i} index={idx} />
                  ))}
                </div>
              </section>
            );
          })}
      </div>
    </MotionConfig>
  );
}

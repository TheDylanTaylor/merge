"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import type {
  Changeset,
  Change,
  HunkStatus,
  MergeResult,
  Role,
  System,
} from "@/types/changeset";
import { ROLES, canApprove, roleLabel } from "@/lib/permissions";
import HunkCard from "./HunkCard";
import MergeBar from "./MergeBar";
import MergeReceipt from "./MergeReceipt";
import RoleAvatar from "./RoleAvatar";
import { systemLabel } from "./SystemIcon";

type Phase = "review" | "merging" | "merged" | "reverting" | "reverted";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const REAL_KINDS = new Set(["email", "linear", "slack", "shopping"]);

export default function ReviewClient({ id }: { id: string }) {
  const router = useRouter();

  const [changeset, setChangeset] = useState<Changeset | null>(null);
  const [ready, setReady] = useState(false);
  const [statusMap, setStatusMap] = useState<Record<string, HunkStatus>>({});
  const [actorRole, setActorRole] = useState<Role>("ceo");
  const [phase, setPhase] = useState<Phase>("review");
  const [results, setResults] = useState<MergeResult[]>([]);

  // Hydrate from sessionStorage (the generator handed the changeset off here).
  useEffect(() => {
    const raw = sessionStorage.getItem(`changeset:${id}`);
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      const cs = JSON.parse(raw) as Changeset;
      const initial: Record<string, HunkStatus> = {};
      // Default: everything approved except danger hunks, which start pending.
      cs.changes.forEach((c) => {
        initial[c.id] = c.risk === "danger" ? "pending" : "approved";
      });
      setChangeset(cs);
      setStatusMap(initial);
      setReady(true);
    } catch {
      router.replace("/");
    }
  }, [id, router]);

  const setStatus = (hunkId: string, status: HunkStatus) =>
    setStatusMap((m) => ({
      ...m,
      [hunkId]: m[hunkId] === status ? "pending" : status,
    }));

  // Effective per-hunk classification, gated by the actor's role.
  const classify = (
    c: Change,
  ): "approved" | "rejected" | "review" => {
    const s = statusMap[c.id] ?? "pending";
    if (s === "rejected") return "rejected";
    if (s === "approved" && canApprove(actorRole, c)) return "approved";
    return "review"; // pending, or approved-but-not-permitted (locked)
  };

  const counts = useMemo(() => {
    if (!changeset)
      return { approved: 0, rejected: 0, review: 0, real: 0, total: 0 };
    let approved = 0,
      rejected = 0,
      review = 0,
      real = 0;
    for (const c of changeset.changes) {
      const k = classify(c);
      if (k === "approved") {
        approved += 1;
        if (REAL_KINDS.has(c.execution.kind)) real += 1;
      } else if (k === "rejected") rejected += 1;
      else review += 1;
    }
    return {
      approved,
      rejected,
      review,
      real,
      total: changeset.changes.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeset, statusMap, actorRole]);

  // Group changes by system, preserving first-seen order.
  const groups = useMemo(() => {
    if (!changeset) return [] as { system: System; changes: Change[] }[];
    const order: System[] = [];
    const map = new Map<System, Change[]>();
    for (const c of changeset.changes) {
      if (!map.has(c.system)) {
        map.set(c.system, []);
        order.push(c.system);
      }
      map.get(c.system)!.push(c);
    }
    return order.map((system) => ({ system, changes: map.get(system)! }));
  }, [changeset]);

  async function handleMerge() {
    if (!changeset || phase === "merging") return;
    const approvedHunkIds = changeset.changes
      .filter((c) => classify(c) === "approved")
      .map((c) => c.id);
    if (approvedHunkIds.length === 0) return;

    setPhase("merging");
    try {
      const res = await fetch("/api/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changeset, approvedHunkIds, actorRole }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { results: MergeResult[] };
      setResults(data.results);
      setPhase("merged");
    } catch {
      setPhase("review");
    }
  }

  async function handleRevert() {
    if (phase === "reverting" || results.length === 0) return;
    setPhase("reverting");
    try {
      const res = await fetch("/api/revert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { results: MergeResult[] };
      setResults(data.results);
      setPhase("reverted");
    } catch {
      setPhase("merged");
    }
  }

  // ---- loading / guard states ----
  if (!ready || !changeset) {
    return (
      <main className="grid min-h-screen place-items-center">
        <motion.p
          className="font-mono text-sm text-muted"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          Loading changeset…
        </motion.p>
      </main>
    );
  }

  const showReceipt = phase === "merged" || phase === "reverting" || phase === "reverted";

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-screen flex-col">
        <div className="grid-bg pointer-events-none fixed inset-0 opacity-50" />

        {/* header */}
        <header className="relative z-10 border-b border-border/80 bg-bg/70 backdrop-blur-md">
          <div className="mx-auto max-w-4xl px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="mb-2 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-text"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M15 6l-6 6 6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Merge
                </button>
                <h1 className="truncate text-xl font-semibold tracking-tight">
                  {changeset.goal}
                </h1>
                <p className="mt-1 line-clamp-2 text-[13.5px] text-muted">
                  {changeset.summary}
                </p>
              </div>

              {/* role switcher */}
              <div className="shrink-0">
                <p className="mb-1.5 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  Acting as
                </p>
                <div className="flex gap-1 rounded-lg border bg-panel p-1">
                  {ROLES.map((r) => {
                    const active = actorRole === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setActorRole(r.id)}
                        disabled={showReceipt}
                        title={r.label}
                        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] font-medium transition-colors disabled:opacity-50"
                        style={{
                          background: active
                            ? "color-mix(in srgb, var(--accent) 16%, transparent)"
                            : "transparent",
                          color: active ? "var(--text)" : "var(--muted)",
                        }}
                      >
                        <RoleAvatar role={r.id} size={18} />
                        <span className="hidden sm:inline">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* body */}
        <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-6 py-8">
          <AnimatePresence mode="wait">
            {showReceipt ? (
              <motion.div
                key="receipt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <MergeReceipt
                  changeset={changeset}
                  results={results}
                  phase={phase}
                  onRevert={handleRevert}
                  onHome={() => router.push("/")}
                />
              </motion.div>
            ) : (
              <motion.div
                key="diff"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === "merging" ? 0.5 : 1 }}
                exit={{ opacity: 0 }}
                className="space-y-9"
              >
                {groups.map((g, gi) => (
                  <motion.section
                    key={g.system}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: gi * 0.05 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <h2 className="font-mono text-[12px] uppercase tracking-[0.16em] text-muted">
                        {systemLabel(g.system)}
                      </h2>
                      <span className="rounded-full border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted">
                        {g.changes.length}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    <motion.div className="space-y-3">
                      {g.changes.map((c) => (
                        <HunkCard
                          key={c.id}
                          change={c}
                          status={statusMap[c.id] ?? "pending"}
                          canApproveIt={canApprove(actorRole, c)}
                          onApprove={() => setStatus(c.id, "approved")}
                          onReject={() => setStatus(c.id, "rejected")}
                        />
                      ))}
                    </motion.div>
                  </motion.section>
                ))}

                <p className="pt-2 text-center font-mono text-[11px] text-muted">
                  Acting as {roleLabel(actorRole)} — you can approve{" "}
                  {
                    changeset.changes.filter((c) => canApprove(actorRole, c))
                      .length
                  }{" "}
                  of {changeset.changes.length} hunks.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* merge bar */}
        {!showReceipt && (
          <MergeBar
            approvedCount={counts.approved}
            rejectedCount={counts.rejected}
            reviewNeeded={counts.review}
            total={counts.total}
            realCount={counts.real}
            merging={phase === "merging"}
            onMerge={handleMerge}
          />
        )}
      </div>
    </MotionConfig>
  );
}

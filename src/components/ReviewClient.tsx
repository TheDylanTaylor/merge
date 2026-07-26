"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "framer-motion";
import type {
  Changeset,
  Change,
  HunkStatus,
  MergeResult,
  Role,
  System,
} from "@/types/changeset";
import { canApprove, roleLabel } from "@/lib/permissions";
import { recordMerge, recordRevert } from "@/lib/store";
import HunkCard, { type MergePhase } from "./HunkCard";
import MergeBar from "./MergeBar";
import MergeReceipt from "./MergeReceipt";
import ReviewHeader from "./review/ReviewHeader";
import { systemLabel } from "./SystemIcon";

type Phase = "review" | "merging" | "merged" | "reverting" | "reverted";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Execution kinds that fire genuine external side effects (vs. noop mock systems).
const REAL_KINDS = new Set(["email", "linear", "slack", "shopping"]);

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function ReviewClient({ id }: { id: string }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [changeset, setChangeset] = useState<Changeset | null>(null);
  const [ready, setReady] = useState(false);
  const [statusMap, setStatusMap] = useState<Record<string, HunkStatus>>({});
  const [actorRole, setActorRole] = useState<Role>("ceo");
  const [phase, setPhase] = useState<Phase>("review");
  const [results, setResults] = useState<MergeResult[]>([]);
  // Ids that have visually "landed" during the merge apply-sweep.
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  // Hydrate from sessionStorage (the composer handed the changeset off here).
  useEffect(() => {
    const raw = sessionStorage.getItem(`changeset:${id}`);
    if (!raw) {
      router.replace("/app");
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
      router.replace("/app");
    }
  }, [id, router]);

  const setStatus = (hunkId: string, status: HunkStatus) =>
    setStatusMap((m) => ({
      ...m,
      [hunkId]: m[hunkId] === status ? "pending" : status,
    }));

  // Effective per-hunk classification, gated by the actor's role.
  const classify = (c: Change): "approved" | "rejected" | "review" => {
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
    return { approved, rejected, review, real, total: changeset.changes.length };
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

  const approvableCount = useMemo(
    () =>
      changeset
        ? changeset.changes.filter((c) => canApprove(actorRole, c)).length
        : 0,
    [changeset, actorRole],
  );

  // Per-hunk display state while merging (drives the apply-sweep).
  const mergePhaseFor = (c: Change): MergePhase => {
    if (phase !== "merging") return "idle";
    if (classify(c) !== "approved") return "muted";
    return appliedIds.has(c.id) ? "applied" : "queued";
  };

  async function handleMerge() {
    if (!changeset || phase === "merging") return;
    // Approved hunks in visual (grouped) order so the sweep cascades top→bottom.
    const orderedApproved = groups
      .flatMap((g) => g.changes)
      .filter((c) => classify(c) === "approved")
      .map((c) => c.id);
    if (orderedApproved.length === 0) return;

    setPhase("merging");
    setAppliedIds(new Set());

    // Fire the real merge in parallel with the apply-sweep.
    const apiPromise = (async () => {
      const res = await fetch("/api/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changeset, approvedHunkIds: orderedApproved, actorRole }),
      });
      if (!res.ok) throw new Error("merge failed");
      return (await res.json()) as { results: MergeResult[] };
    })();

    // Sequential apply-sweep — each hunk "lands" one after another.
    const stagger = reduceMotion ? 0 : 95;
    for (const hunkId of orderedApproved) {
      if (stagger) await wait(stagger);
      setAppliedIds((prev) => {
        const next = new Set(prev);
        next.add(hunkId);
        return next;
      });
    }
    if (!reduceMotion) await wait(340);

    try {
      const data = await apiPromise;
      recordMerge(changeset, data.results, actorRole); // → ledger
      setResults(data.results);
      setPhase("merged");
    } catch {
      setPhase("review");
      setAppliedIds(new Set());
    }
  }

  async function handleRevert() {
    if (!changeset || phase === "reverting" || results.length === 0) return;
    setPhase("reverting");

    const apiPromise = (async () => {
      const res = await fetch("/api/revert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results }),
      });
      if (!res.ok) throw new Error("revert failed");
      return (await res.json()) as { results: MergeResult[] };
    })();

    // Let the amber reverse-sweep play before flipping to the reverted state.
    if (!reduceMotion) {
      const okCount = results.filter((r) => r.ok).length;
      await wait(Math.min(okCount, 7) * 70 + 380);
    }

    try {
      const data = await apiPromise;
      recordRevert(changeset.id, changeset.goal, data.results); // → ledger
      setResults(data.results);
      setPhase("reverted");
    } catch {
      setPhase("merged");
    }
  }

  // ---- loading / guard state ----
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

  const receiptPhase =
    phase === "merged" || phase === "reverting" || phase === "reverted";
  const switcherLocked = phase !== "review";

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-screen flex-col">
        <div className="grid-bg pointer-events-none fixed inset-0 opacity-40" />
        <div className="aurora pointer-events-none fixed inset-x-0 top-0 h-64 opacity-60" />

        <ReviewHeader
          id={changeset.id}
          goal={changeset.goal}
          summary={changeset.summary}
          hunkCount={changeset.changes.length}
          systemCount={groups.length}
          dangerCount={changeset.changes.filter((c) => c.risk === "danger").length}
          createdAt={changeset.createdAt}
          actorRole={actorRole}
          onRole={setActorRole}
          disabled={switcherLocked}
        />

        {/* body */}
        <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-6 py-8">
          <AnimatePresence mode="wait">
            {receiptPhase ? (
              <motion.div
                key="receipt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24 }}
              >
                <MergeReceipt
                  changeset={changeset}
                  results={results}
                  phase={phase as "merged" | "reverting" | "reverted"}
                  onRevert={handleRevert}
                />
              </motion.div>
            ) : (
              <motion.div
                key="diff"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24 }}
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
                      <span className="rounded-full border border-border px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-muted">
                        {g.changes.length}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    <div className="space-y-3">
                      {g.changes.map((c) => (
                        <HunkCard
                          key={c.id}
                          change={c}
                          status={statusMap[c.id] ?? "pending"}
                          canApproveIt={canApprove(actorRole, c)}
                          onApprove={() => setStatus(c.id, "approved")}
                          onReject={() => setStatus(c.id, "rejected")}
                          mergePhase={mergePhaseFor(c)}
                        />
                      ))}
                    </div>
                  </motion.section>
                ))}

                <p className="pt-2 text-center font-mono text-[11px] text-muted">
                  Acting as {roleLabel(actorRole)} — you can approve{" "}
                  <span className="tabular-nums text-text-2">
                    {approvableCount}
                  </span>{" "}
                  of{" "}
                  <span className="tabular-nums text-text-2">
                    {changeset.changes.length}
                  </span>{" "}
                  hunks.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* merge bar */}
        {!receiptPhase && (
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

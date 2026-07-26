"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Changeset, ScenarioId } from "@/types/changeset";
import { SCENARIOS } from "@/types/changeset";
import { recordProposed } from "@/lib/store";
import GeneratingOverlay from "@/components/GeneratingOverlay";

/**
 * The reusable changeset composer that lives on the dashboard home.
 *
 * The handoff is the critical path: on submit it POSTs the goal (a preset
 * scenario or free text) to /api/changeset, records the returned changeset in
 * the persistent ledger, stashes the full object in sessionStorage under the
 * key the review screen reads, then routes to /review/[id]. The
 * GeneratingOverlay covers the request so the transition feels deliberate.
 */
export default function Composer({ id = "compose" }: { id?: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState<ScenarioId | null>(null);
  const [goalText, setGoalText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeGoal =
    goalText.trim() || SCENARIOS.find((s) => s.id === selected)?.goal || "";

  // When the shell's "New changeset" action anchors to #compose, scroll the
  // composer into view and focus the goal field.
  useEffect(() => {
    const focusIfTargeted = () => {
      if (window.location.hash !== `#${id}`) return;
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => inputRef.current?.focus(), 320);
    };
    focusIfTargeted();
    window.addEventListener("hashchange", focusIfTargeted);
    return () => window.removeEventListener("hashchange", focusIfTargeted);
  }, [id]);

  async function submit(override?: { scenarioId?: ScenarioId; goal?: string }) {
    if (loading) return;
    const text = (override?.goal ?? goalText).trim();
    const body = override?.scenarioId
      ? { scenarioId: override.scenarioId }
      : text
        ? { goal: text }
        : selected
          ? { scenarioId: selected }
          : null;

    if (!body) {
      setError("Pick a scenario or describe a goal for your agent.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/changeset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = (await res.json()) as { changeset: Changeset };
      const cs = data.changeset;
      recordProposed(cs);
      sessionStorage.setItem(`changeset:${cs.id}`, JSON.stringify(cs));
      router.push(`/review/${cs.id}`);
    } catch {
      setError("The agent couldn't reach your tools. Try again.");
      setLoading(false);
    }
  }

  return (
    <section
      ref={sectionRef}
      id={id}
      style={{ scrollMarginTop: 72 }}
      className="relative overflow-hidden rounded-lg border border-border bg-surface p-5 transition-shadow focus-within:shadow-glow"
    >
      {/* subtle single violet glow at the top — the one allowed flourish */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{
          background:
            "radial-gradient(80% 100% at 50% 0%, color-mix(in srgb, var(--accent) 9%, transparent), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative">
        <p className="eyebrow !text-[11px]">Propose a changeset</p>

        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
          {SCENARIOS.map((s) => {
            const active = selected === s.id && !goalText.trim();
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSelected(s.id);
                  setGoalText("");
                  setError(null);
                  // One click on a scenario generates immediately — the demo
                  // path should feel instant, not select-then-confirm.
                  submit({ scenarioId: s.id });
                }}
                className="group flex flex-col rounded-md border p-3.5 text-left transition-colors"
                style={{
                  borderColor: active
                    ? "color-mix(in srgb, var(--accent) 60%, transparent)"
                    : "var(--border)",
                  background: active
                    ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                    : "var(--surface-2)",
                }}
              >
                <span className="text-[13.5px] font-medium text-text">
                  {s.label}
                </span>
                <span className="mt-1.5 text-[11.5px] leading-snug text-muted">
                  {s.blurb}
                </span>
              </button>
            );
          })}
        </div>

        <div className="my-3.5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            or
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex items-center gap-2 rounded-md border bg-surface-2 pl-4 pr-2 transition-colors focus-within:border-accent/60">
          <span className="font-mono text-sm text-accent">›</span>
          <input
            ref={inputRef}
            value={goalText}
            onChange={(e) => {
              setGoalText(e.target.value);
              if (e.target.value.trim()) setSelected(null);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="Give your agent a goal…"
            aria-label="Describe a goal for your agent"
            className="flex-1 bg-transparent py-3 text-[14px] text-text placeholder:text-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={() => submit()}
            disabled={loading}
            aria-label="Generate changeset"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white transition-transform active:scale-95 disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 12h13M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="mt-2.5 h-4">
          <motion.p
            key={error ?? "hint"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`font-mono text-[11.5px] ${error ? "text-danger" : "text-faint"}`}
          >
            {error ??
              "The agent drafts a coordinated diff across your tools. You review and merge what's safe."}
          </motion.p>
        </div>
      </div>

      <AnimatePresence>
        {loading && <GeneratingOverlay goal={activeGoal} />}
      </AnimatePresence>
    </section>
  );
}

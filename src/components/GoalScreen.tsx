"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, MotionConfig, type Variants } from "framer-motion";
import type { Changeset, ScenarioId } from "@/types/changeset";
import { SCENARIOS } from "@/types/changeset";
import GeneratingOverlay from "./GeneratingOverlay";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export default function GoalScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<ScenarioId | null>(null);
  const [goalText, setGoalText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeGoal =
    goalText.trim() ||
    SCENARIOS.find((s) => s.id === selected)?.goal ||
    "";

  async function submit() {
    if (loading) return;
    const text = goalText.trim();
    const body = text
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
      sessionStorage.setItem(`changeset:${cs.id}`, JSON.stringify(cs));
      router.push(`/review/${cs.id}`);
    } catch {
      setError("The agent couldn't reach your tools. Try again.");
      setLoading(false);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-screen overflow-hidden">
        {/* backdrop */}
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 60%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-64"
          style={{
            background:
              "linear-gradient(to top, color-mix(in srgb, var(--accent) 8%, transparent), transparent)",
          }}
        />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16"
        >
          {/* wordmark + tagline */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }} className="text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted">
              Agents propose · Humans merge
            </p>
            <h1 className="mt-4 text-6xl font-semibold tracking-tight sm:text-7xl">
              Merge<span className="text-accent">.</span>
            </h1>
            <p className="mt-4 text-lg text-muted">
              The pull request for reality.
            </p>
          </motion.div>

          {/* console */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }}
            className="mt-12 rounded-2xl border bg-panel/70 p-5 backdrop-blur-sm"
          >
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              Choose a scenario
            </p>

            <div className="grid gap-2.5 sm:grid-cols-3">
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
                    }}
                    className="group flex flex-col rounded-xl border p-3.5 text-left transition-colors"
                    style={{
                      borderColor: active
                        ? "color-mix(in srgb, var(--accent) 60%, transparent)"
                        : "var(--border)",
                      background: active
                        ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                        : "var(--panel-2)",
                    }}
                  >
                    <span
                      className="text-[13.5px] font-medium"
                      style={{ color: active ? "var(--text)" : "var(--text)" }}
                    >
                      {s.label}
                    </span>
                    <span className="mt-1.5 text-[11.5px] leading-snug text-muted">
                      {s.blurb}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* divider */}
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                or
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* free text */}
            <div
              className="flex items-center gap-2 rounded-xl border bg-panel-2 pl-4 pr-2 transition-colors focus-within:border-accent/60"
            >
              <span className="font-mono text-sm text-accent">›</span>
              <input
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
                className="flex-1 bg-transparent py-3 text-[14px] text-text placeholder:text-muted focus:outline-none"
              />
              <button
                type="button"
                onClick={submit}
                aria-label="Generate changeset"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white transition-transform active:scale-95"
                style={{ background: "var(--accent)" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
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

            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="mt-4 w-full rounded-xl px-5 py-3 text-[14px] font-semibold text-white transition-opacity disabled:opacity-50"
              style={{
                background: "var(--accent)",
                boxShadow:
                  "0 0 30px -8px color-mix(in srgb, var(--accent) 85%, transparent)",
              }}
            >
              Generate changeset
            </button>

            <div className="mt-2.5 h-4 text-center">
              <AnimatePresence mode="wait">
                {error ? (
                  <motion.p
                    key="err"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-mono text-[11.5px] text-danger"
                  >
                    {error}
                  </motion.p>
                ) : (
                  <motion.p
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-mono text-[11.5px] text-muted"
                  >
                    The agent drafts a diff across 7 tools. You decide what merges.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {loading && <GeneratingOverlay goal={activeGoal} />}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import SystemIcon from "@/components/SystemIcon";
import { ArrowRight } from "@/components/ui/Button";
import type { System } from "@/types/changeset";

type Hunk = {
  system: System;
  op: "+" | "~";
  title: string;
  detail: string;
  tone: "safe" | "review";
  landmine?: string;
};

const HUNKS: Hunk[] = [
  {
    system: "slack",
    op: "+",
    title: "Post apology to #support-eng",
    detail: "Notifies 8 on-call engineers",
    tone: "safe",
  },
  {
    system: "linear",
    op: "+",
    title: "Close ENG-482 “duplicate charge”",
    detail: "Marks the incident resolved",
    tone: "safe",
  },
  {
    system: "stripe",
    op: "~",
    title: "Refund $2,400 to 3 customers",
    detail: "Exceeds the $500 auto-approval policy",
    tone: "review",
    landmine: "Over-budget: a $2,400 refund needs Finance sign-off.",
  },
  {
    system: "gmail",
    op: "+",
    title: "Send receipt correction",
    detail: "Emails 3 overcharged customers",
    tone: "safe",
  },
];

// safe hunks that auto-check, in reveal order
const CHECK_AT: Record<number, number> = { 0: 1, 1: 2, 3: 4 };
const APPROVED = 3;

function Check() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Warn() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3.2 22 20H2L12 3.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 9.5v4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.15" fill="currentColor" />
    </svg>
  );
}

export default function HeroChangeset() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reduce) {
      setPhase(4);
      return;
    }
    const timers = [
      setTimeout(() => setPhase(1), 550),
      setTimeout(() => setPhase(2), 950),
      setTimeout(() => setPhase(3), 1350),
      setTimeout(() => setPhase(4), 1800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  const ready = phase >= 4;

  return (
    <div
      className="relative mx-auto w-full max-w-[720px] overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
      style={{ boxShadow: "0 30px 80px -30px rgba(0,0,0,0.9), 0 0 0 1px var(--border)" }}
    >
      {/* header */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-bg-subtle px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="text-accent">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="6" cy="18" r="2" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="18" cy="12" r="2" fill="currentColor" stroke="currentColor" strokeWidth="1.8" />
              <path d="M6 8v8M8 6c6 0 2 6 8 6M8 18c6 0 2-6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <span className="truncate font-mono text-[12.5px] text-text-2">
            agent/refund-overcharged-customers
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-[11px] text-faint">4 hunks</span>
          <span
            className="rounded-full border px-2 py-0.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em]"
            style={{
              color: "var(--accent)",
              borderColor: "color-mix(in srgb, var(--accent) 42%, transparent)",
              background: "color-mix(in srgb, var(--accent) 12%, transparent)",
            }}
          >
            Proposed
          </span>
        </div>
      </div>

      {/* hunks */}
      <div className="divide-y divide-border">
        {HUNKS.map((h, i) => {
          const isLandmine = h.tone === "review";
          const checked = !isLandmine && phase >= (CHECK_AT[i] ?? 99);
          const rail = isLandmine ? "var(--review)" : checked ? "var(--safe)" : "var(--border-strong)";
          return (
            <div
              key={h.title}
              className="hunk-rise relative flex items-start gap-3 px-4 py-3"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: rail }} aria-hidden />

              {/* checkbox / landmine marker */}
              <span className="mt-0.5 shrink-0">
                {isLandmine ? (
                  <motion.span
                    className="grid h-[18px] w-[18px] place-items-center rounded-[5px] border"
                    style={{
                      color: "var(--review)",
                      borderColor: "color-mix(in srgb, var(--review) 55%, transparent)",
                      background: "color-mix(in srgb, var(--review) 14%, transparent)",
                    }}
                    animate={phase >= 3 && !reduce ? { scale: [1, 1.14, 1] } : undefined}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Warn />
                  </motion.span>
                ) : (
                  <span
                    className="grid h-[18px] w-[18px] place-items-center rounded-[5px] border transition-all duration-200"
                    style={
                      checked
                        ? { color: "#fff", borderColor: "var(--safe)", background: "var(--safe)" }
                        : { color: "transparent", borderColor: "var(--border-strong)", background: "transparent" }
                    }
                  >
                    {checked && <Check />}
                  </span>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <SystemIcon system={h.system} size={22} />
                  <span className="truncate text-[13.5px] font-medium text-text">{h.title}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 font-mono text-[12px]">
                  <span style={{ color: isLandmine ? "var(--review)" : "var(--safe)" }}>{h.op}</span>
                  <span className="truncate text-muted">{h.detail}</span>
                </div>
                {isLandmine && (
                  <div
                    className="mt-2 flex items-center gap-2 rounded-md border px-2.5 py-1.5"
                    style={{
                      borderColor: "color-mix(in srgb, var(--review) 45%, transparent)",
                      background: "color-mix(in srgb, var(--review) 9%, transparent)",
                    }}
                  >
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-review">
                      ⚠ Landmine
                    </span>
                    <span className="truncate text-[12px] text-text-2">{h.landmine}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* footer / merge bar */}
      <div className="flex items-center justify-between gap-3 border-t border-border bg-bg-subtle px-4 py-3">
        <span className="font-mono text-[11.5px] text-muted transition-opacity duration-300">
          {ready ? (
            <>
              <span className="text-safe">{APPROVED} approved</span>
              <span className="text-faint"> · </span>
              <span className="text-review">1 held for review</span>
            </>
          ) : (
            "Reviewing 4 hunks…"
          )}
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-all duration-300"
          style={
            ready
              ? {
                  background: "var(--accent)",
                  color: "#fff",
                  boxShadow: "0 0 0 1px var(--accent), 0 8px 24px -8px rgba(124,108,246,0.55)",
                }
              : {
                  background: "transparent",
                  color: "var(--faint)",
                  boxShadow: "inset 0 0 0 1px var(--border)",
                }
          }
        >
          Merge {APPROVED} of 4
          <ArrowRight size={13} />
        </span>
      </div>
    </div>
  );
}

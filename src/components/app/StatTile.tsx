"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Counts a number up from its last displayed value to `target` over ~700ms
 * with an ease-out curve. Snaps instantly when reduced-motion is requested or
 * when count-up is disabled. Tabular figures keep the width stable so the
 * animation never jitters the layout.
 */
function useCountUp(target: number, enabled: boolean): number {
  const reduce = useReducedMotion();
  const [val, setVal] = useState(() => (enabled && !reduce ? 0 : target));
  const last = useRef(enabled && !reduce ? 0 : target);

  useEffect(() => {
    if (!enabled || reduce) {
      last.current = target;
      setVal(target);
      return;
    }
    const from = last.current;
    if (from === target) return;
    const dur = 700;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = Math.round(from + (target - from) * eased);
      last.current = cur;
      setVal(cur);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled, reduce]);

  return val;
}

export interface StatTileProps {
  label: string;
  value: number;
  icon: ReactNode;
  /** Icon tint (a color token or literal). Defaults to the violet accent. */
  tint?: string;
  /** Honest, derived context line — never a fabricated trend. */
  sublabel?: string;
  /** Animate the number from 0 on mount / on change. */
  countUp?: boolean;
  /** "Systems connected" variant: renders filled/hollow status dots. */
  dots?: { filled: number; total: number };
  /** Stagger index — drives the entrance delay. */
  index?: number;
}

export default function StatTile({
  label,
  value,
  icon,
  tint = "var(--accent)",
  sublabel,
  countUp = true,
  dots,
  index = 0,
}: StatTileProps) {
  const isDots = !!dots;
  const animated = useCountUp(value, countUp && !isDots);
  const display = isDots ? `${dots!.filled} / ${dots!.total}` : animated.toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: EASE, delay: index * 0.05 }}
      className="flex min-h-[104px] flex-col rounded-md border border-border bg-surface p-[18px] transition-colors hover:border-border-strong"
    >
      <div className="flex items-center gap-2">
        <span
          className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[7px]"
          style={{
            color: tint,
            background: `color-mix(in srgb, ${tint} 12%, transparent)`,
          }}
          aria-hidden
        >
          {icon}
        </span>
        <span className="font-mono text-[11.5px] uppercase tracking-[0.08em] text-muted">
          {label}
        </span>
      </div>

      <div className="mt-auto pt-3">
        <span
          className="font-mono text-[32px] font-semibold leading-none tracking-[-0.02em] text-text"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {display}
        </span>

        {isDots && (
          <div className="mt-2.5 flex items-center gap-[5px]" aria-hidden>
            {Array.from({ length: dots!.total }).map((_, i) => {
              const on = i < dots!.filled;
              return (
                <span
                  key={i}
                  className="h-[6px] w-[6px] rounded-full"
                  style={
                    on
                      ? { background: "var(--safe)" }
                      : {
                          background: "transparent",
                          boxShadow: "inset 0 0 0 1px var(--faint)",
                        }
                  }
                />
              );
            })}
          </div>
        )}

        {sublabel && (
          <p className="mt-2 text-[11px] text-faint">{sublabel}</p>
        )}
      </div>
    </motion.div>
  );
}

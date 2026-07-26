"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { System } from "@/types/changeset";
import { SYSTEM_META } from "./SystemIcon";

const RING: System[] = [
  "linear",
  "gmail",
  "slack",
  "stripe",
  "crm",
  "shopping",
  "permissions",
];

const STATUS = [
  "Reading company state",
  "Drafting changes across tools",
  "Checking permissions & policy",
  "Scanning for conflicts",
  "Assembling the diff",
];

const BOX = 360;
const CENTER = BOX / 2;
const RADIUS = 138;

function nodePos(i: number, total: number) {
  const angle = (-90 + (360 / total) * i) * (Math.PI / 180);
  return {
    x: CENTER + RADIUS * Math.cos(angle),
    y: CENTER + RADIUS * Math.sin(angle),
  };
}

export default function GeneratingOverlay({ goal }: { goal?: string }) {
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setStatusIdx((i) => (i + 1) % STATUS.length),
      1400,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 grid place-items-center bg-bg/95 backdrop-blur-sm"
    >
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 55%)",
        }}
      />

      <div className="relative flex flex-col items-center">
        <div
          className="relative"
          style={{ width: BOX, height: BOX }}
          aria-hidden
        >
          {/* connective lines */}
          <svg
            className="absolute inset-0"
            width={BOX}
            height={BOX}
            viewBox={`0 0 ${BOX} ${BOX}`}
          >
            {RING.map((sys, i) => {
              const p = nodePos(i, RING.length);
              return (
                <motion.line
                  key={sys}
                  x1={CENTER}
                  y1={CENTER}
                  x2={p.x}
                  y2={p.y}
                  stroke={SYSTEM_META[sys].tint}
                  strokeWidth={1}
                  strokeDasharray="4 7"
                  initial={{ opacity: 0.15, strokeDashoffset: 0 }}
                  animate={{
                    opacity: [0.12, 0.5, 0.12],
                    strokeDashoffset: [0, -44],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.16,
                  }}
                />
              );
            })}
          </svg>

          {/* system nodes */}
          {RING.map((sys, i) => {
            const p = nodePos(i, RING.length);
            const { tint, Glyph } = SYSTEM_META[sys];
            return (
              <motion.div
                key={sys}
                className="absolute grid h-12 w-12 place-items-center rounded-xl border"
                style={{
                  left: p.x,
                  top: p.y,
                  x: "-50%",
                  y: "-50%",
                  color: tint,
                  borderColor: `color-mix(in srgb, ${tint} 40%, transparent)`,
                  background: `color-mix(in srgb, ${tint} 10%, var(--panel))`,
                }}
                animate={{
                  scale: [1, 1.12, 1],
                  boxShadow: [
                    `0 0 0 0 ${tint}00`,
                    `0 0 20px -2px ${tint}`,
                    `0 0 0 0 ${tint}00`,
                  ],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.16,
                }}
              >
                <Glyph width={22} height={22} />
              </motion.div>
            );
          })}

          {/* pulsing agent core */}
          <div
            className="absolute grid place-items-center"
            style={{
              left: CENTER,
              top: CENTER,
              transform: "translate(-50%, -50%)",
            }}
          >
            {[0, 1].map((r) => (
              <motion.span
                key={r}
                className="absolute rounded-full border"
                style={{ borderColor: "var(--accent)" }}
                initial={{ width: 56, height: 56, opacity: 0.5 }}
                animate={{ width: 150, height: 150, opacity: 0 }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: r * 1.1,
                }}
              />
            ))}
            <motion.div
              className="relative grid h-16 w-16 place-items-center rounded-full text-white"
              style={{
                background: "var(--accent)",
                boxShadow:
                  "0 0 40px -6px color-mix(in srgb, var(--accent) 90%, transparent)",
              }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <circle cx="6" cy="6" r="2.4" stroke="currentColor" strokeWidth="1.9" />
                <circle cx="6" cy="18" r="2.4" stroke="currentColor" strokeWidth="1.9" />
                <circle cx="18" cy="15" r="2.4" stroke="currentColor" strokeWidth="1.9" />
                <path
                  d="M6 8.5v7M6 12a6 6 0 0 0 6 6h3.6"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
          </div>
        </div>

        {/* caption */}
        <div className="mt-2 flex flex-col items-center text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            Agent working
          </p>
          <h3 className="mt-2 text-lg font-medium tracking-tight text-text">
            Fanning out across your tools
          </h3>
          {goal && (
            <p className="mt-1 max-w-sm truncate text-[13px] text-muted">
              “{goal}”
            </p>
          )}
          <div className="mt-3 h-5 overflow-hidden">
            <motion.p
              key={statusIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="font-mono text-[12px] text-muted"
            >
              {STATUS[statusIdx]}
              <motion.span
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                …
              </motion.span>
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

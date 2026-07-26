"use client";

import { motion, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";

const STEPS = [
  {
    n: "01",
    title: "Propose",
    body: "An agent drafts a coordinated changeset across your tools — one goal, many hunks.",
  },
  {
    n: "02",
    title: "Review",
    body: "You read a git-style diff. Landmines are flagged. Approve the hunks you trust.",
  },
  {
    n: "03",
    title: "Merge",
    body: "Approved hunks execute for real — Slack sends, Linear moves, Stripe refunds.",
  },
  {
    n: "04",
    title: "Revert",
    body: "Changed your mind? One click replays every side effect in reverse.",
  },
];

export default function HowItWorks() {
  const reduce = useReducedMotion();

  return (
    <section className="relative border-y border-border bg-bg-subtle">
      <div className="mx-auto max-w-content px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Reveal className="mx-auto max-w-[680px] text-center">
          <p className="eyebrow">The loop</p>
          <h2 className="mt-4 text-h1 font-semibold text-text">
            A review layer between intent and reality.
          </h2>
        </Reveal>

        <div className="relative mt-14">
          {/* connective rail + traveling signal (desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-[26px] hidden md:block">
            <div className="relative mx-auto h-px w-[75%] bg-border">
              {!reduce && (
                <motion.span
                  className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
                  style={{ background: "var(--accent)", boxShadow: "0 0 12px 2px color-mix(in srgb, var(--accent) 70%, transparent)" }}
                  initial={{ left: "0%", opacity: 0 }}
                  whileInView={{ left: "100%", opacity: [0, 1, 1, 0] }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 1.4, ease: "linear" }}
                  aria-hidden
                />
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-4 md:gap-6">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div className="relative h-full">
                  <div
                    className="relative z-10 grid h-[52px] w-[52px] place-items-center rounded-full border bg-surface font-mono text-[13px] font-medium text-accent"
                    style={{ borderColor: "color-mix(in srgb, var(--accent) 35%, var(--border))" }}
                  >
                    {s.n}
                  </div>
                  <h3 className="mt-5 text-[18px] font-semibold text-text">{s.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

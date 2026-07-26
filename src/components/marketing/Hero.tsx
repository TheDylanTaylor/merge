"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import HeroChangeset from "./HeroChangeset";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Hero() {
  const reduce = useReducedMotion();

  const textIn = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, ease: EASE, delay },
        };

  return (
    <section className="relative overflow-hidden">
      {/* dotted grid backdrop, fading out below the fold */}
      <div
        className="grid-bg pointer-events-none absolute inset-0"
        style={{ maskImage: "linear-gradient(to bottom, black, transparent 78%)", WebkitMaskImage: "linear-gradient(to bottom, black, transparent 78%)" }}
        aria-hidden
      />
      {/* flat accent hairline under the nav (no gradients) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-16 h-px"
        style={{ background: "color-mix(in srgb, var(--accent) 28%, transparent)" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-content px-4 pb-24 pt-36 sm:px-6 md:pt-40 lg:px-8">
        <div className="mx-auto max-w-[840px] text-center">
          <motion.p className="eyebrow" style={{ color: "var(--accent)" }} {...textIn(0)}>
            Software for agents
          </motion.p>

          <motion.h1
            className="mt-5 text-balance text-display-lg font-semibold text-text"
            {...textIn(0.06)}
          >
            The pull request<br className="hidden sm:block" /> for{" "}
            <span style={{ color: "var(--accent)" }}>reality.</span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-[640px] text-lead text-muted"
            {...textIn(0.12)}
          >
            Your agents propose a changeset across Linear, Gmail, Slack, and
            Stripe. You review the diff, merge the hunks you trust, and revert
            anything — live.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            {...textIn(0.18)}
          >
            <ButtonLink href="/app" size="lg" className="w-full sm:w-auto">
              Review a changeset
              <ArrowRight size={16} />
            </ButtonLink>
            <ButtonLink href="#demo" variant="secondary" size="lg" className="w-full sm:w-auto">
              Watch the demo
            </ButtonLink>
          </motion.div>
        </div>

        {/* the centerpiece */}
        <motion.div
          className="mt-16 md:mt-20 [perspective:1600px]"
          initial={reduce ? undefined : { opacity: 0, y: 22 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.24 }}
        >
          <div
            style={{
              transform: reduce ? undefined : "rotateX(11deg)",
              transformStyle: "preserve-3d",
            }}
          >
            <HeroChangeset />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

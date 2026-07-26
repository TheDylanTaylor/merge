"use client";

import type { CSSProperties } from "react";
import { MotionConfig } from "framer-motion";
import SiteNav from "@/components/marketing/SiteNav";
import SiteFooter from "@/components/marketing/SiteFooter";
import Hero from "@/components/marketing/Hero";
import LogoStrip from "@/components/marketing/LogoStrip";
import Problem from "@/components/marketing/Problem";
import Primitives from "@/components/marketing/Primitives";
import HowItWorks from "@/components/marketing/HowItWorks";
import SystemsBento from "@/components/marketing/SystemsBento";
import DemoTeaser from "@/components/marketing/DemoTeaser";
import Fundable from "@/components/marketing/Fundable";
import FinalCTA from "@/components/marketing/FinalCTA";

// Light palette: overriding the CSS vars on a wrapper cascades a light theme to
// all children (which read var(--surface)/--text/--muted/--border). Interleaving
// light wrappers with the dark sections gives the page a light/dark rhythm.
const LIGHT = {
  "--bg": "#f5f5f7",
  "--bg-subtle": "#ececf0",
  "--surface": "#ffffff",
  "--surface-2": "#f3f3f6",
  "--surface-3": "#e9e9ef",
  "--surface-hover": "#eeeef3",
  "--border": "#e4e4ea",
  "--border-strong": "#d1d1da",
  "--hairline": "rgba(0,0,0,0.06)",
  "--text": "#0b0b0d",
  "--text-2": "#3a3a44",
  "--muted": "#5b5b67",
  "--faint": "#8a8a96",
} as CSSProperties;

function Light({ children }: { children: React.ReactNode }) {
  return (
    <div style={LIGHT} className="bg-bg text-text">
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <SiteNav />
      <main>
        <Hero />
        <LogoStrip />
        <Light>
          <Problem />
        </Light>
        <Primitives />
        <Light>
          <HowItWorks />
        </Light>
        <SystemsBento />
        <Light>
          <DemoTeaser />
        </Light>
        <Fundable />
        <FinalCTA />
      </main>
      <SiteFooter />
    </MotionConfig>
  );
}

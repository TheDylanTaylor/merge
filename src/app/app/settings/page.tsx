"use client";

import { useEffect, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { ROLES } from "@/lib/permissions";
import type { Role } from "@/types/changeset";
import RoleAvatar from "@/components/RoleAvatar";
import { ButtonLink } from "@/components/ui/Button";
import { clearLedger } from "@/lib/store";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type StatusResponse = {
  mode: "mock" | "hybrid" | "live";
  liveCount: number;
  total: number;
  integrations: { id: string; live: boolean }[];
};

// What each role may approve — mirrors the canApprove policy in permissions.ts
// (CEO overrides everything; anyone may approve a `safe` hunk; otherwise the
// hunk's requiredRole must match the actor).
const ROLE_DESC: Record<Role, string> = {
  ceo: "Approves anything — the final override on every hunk.",
  finance: "Approves billing, pricing, and refund hunks.",
  legal: "Approves customer comms and compliance claims.",
  engineering: "Approves access grants and infrastructure changes.",
  marketing: "Approves announcements and public messaging.",
};

const MODE_META: Record<StatusResponse["mode"], { label: string; color: string }> = {
  mock: { label: "Mock mode", color: "var(--muted)" },
  hybrid: { label: "Hybrid", color: "var(--review)" },
  live: { label: "Live", color: "var(--safe)" },
};

function Section({
  eyebrow,
  title,
  desc,
  delay = 0,
  children,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE, delay }}
      className="card p-5 sm:p-6"
    >
      <p className="eyebrow mb-2">{eyebrow}</p>
      <h2 className="text-[16px] font-semibold text-text">{title}</h2>
      {desc && <p className="mt-1 max-w-prose text-[13px] leading-relaxed text-muted">{desc}</p>}
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}

export default function SettingsPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    fetch("/api/status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setStatus(j))
      .catch(() => setStatus(null));
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function resetDemoData() {
    if (typeof window === "undefined") return;
    const ok = window.confirm(
      "Reset demo data? This clears every changeset and activity event. The seeded demo history will be recreated the next time the app loads.",
    );
    if (!ok) return;
    clearLedger();
    // Also drop the one-time seed flag so the demo history re-seeds on reload.
    try {
      window.localStorage.removeItem("merge:seeded:v3");
    } catch {
      /* private mode — non-fatal */
    }
    setCleared(true);
    window.setTimeout(() => window.location.reload(), 400);
  }

  const hexclaveLive = status?.integrations.find((i) => i.id === "hexclave")?.live ?? false;

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-8">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <p className="eyebrow mb-2">Workspace</p>
          <h1 className="text-h1 font-semibold tracking-tight text-text">Settings</h1>
          <p className="mt-2 max-w-prose text-[14px] leading-relaxed text-muted">
            Roles, motion, and the demo data behind this workspace.
          </p>
        </motion.header>

        {/* Roles / RBAC */}
        <Section
          eyebrow="Access"
          title="Roles & approvals"
          desc="Every hunk carries a required role. The role you act as decides what you can merge — a marketing lead can't approve a pricing change."
          delay={0.04}
        >
          <ul className="divide-y divide-border">
            {ROLES.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <RoleAvatar role={r.id} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium text-text">{r.label}</p>
                  <p className="mt-0.5 text-[12.5px] leading-snug text-muted">
                    {ROLE_DESC[r.id]}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-lg border border-border bg-surface-2 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                Enforcement
              </p>
              <span
                className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em]"
                style={{ color: hexclaveLive ? "var(--safe)" : "var(--muted)" }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: hexclaveLive ? "var(--safe)" : "var(--faint)" }}
                  aria-hidden
                />
                {hexclaveLive ? "Server-side (Hexclave)" : "Local policy"}
              </span>
            </div>
            <p className="text-[12.5px] leading-relaxed text-muted">
              {hexclaveLive ? (
                <>
                  Hexclave is configured, so <code className="font-mono text-[12px] text-text-2">/api/merge</code>{" "}
                  enforces approvals server-side via{" "}
                  <code className="font-mono text-[12px] text-text-2">user.hasPermission</code> for the
                  signed-in user — the client-supplied role is ignored.
                </>
              ) : (
                <>
                  Without Hexclave keys, approvals fall back to the shared local policy in{" "}
                  <code className="font-mono text-[12px] text-text-2">permissions.ts</code>. This drives
                  the demo role-switcher but is not real security — the actor role is client-supplied.
                  Connect Hexclave for server-side enforcement.
                </>
              )}
            </p>
          </div>
        </Section>

        {/* Appearance / Motion */}
        <Section
          eyebrow="Appearance"
          title="Motion"
          desc="Merge follows your operating system's reduce-motion setting everywhere — no separate toggle to keep in sync."
          delay={0.08}
        >
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface-2 p-4">
            <div>
              <p className="text-[13.5px] font-medium text-text">Reduce motion</p>
              <p className="mt-0.5 text-[12.5px] text-muted">
                Detected from{" "}
                <code className="font-mono text-[12px] text-text-2">
                  prefers-reduced-motion
                </code>
                . Change it in your OS accessibility settings.
              </p>
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em]"
              style={{
                color: reducedMotion ? "var(--safe)" : "var(--muted)",
                borderColor: reducedMotion
                  ? "color-mix(in srgb, var(--safe) 40%, transparent)"
                  : "var(--border)",
                background: reducedMotion
                  ? "color-mix(in srgb, var(--safe) 11%, transparent)"
                  : "transparent",
              }}
            >
              {reducedMotion === null ? "Checking…" : reducedMotion ? "On" : "Off"}
            </span>
          </div>
        </Section>

        {/* Data */}
        <Section
          eyebrow="Data"
          title="Demo data"
          desc="Changesets, merges, and activity are stored locally in your browser. Nothing is sent to a server."
          delay={0.12}
        >
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13.5px] font-medium text-text">Reset demo data</p>
              <p className="mt-0.5 text-[12.5px] text-muted">
                Clears the local ledger, then re-seeds the sample history on reload.
              </p>
            </div>
            <button
              type="button"
              onClick={resetDemoData}
              disabled={cleared}
              className="shrink-0 rounded-lg border px-4 py-2 text-[13px] font-medium transition-colors disabled:opacity-60"
              style={{
                color: "var(--danger)",
                borderColor: "color-mix(in srgb, var(--danger) 45%, transparent)",
                background: "color-mix(in srgb, var(--danger) 10%, transparent)",
              }}
            >
              {cleared ? "Resetting…" : "Reset demo data"}
            </button>
          </div>
        </Section>

        {/* Environment */}
        <Section
          eyebrow="Environment"
          title="Connections"
          desc="A quick read on how many adapters are wired to real side effects."
          delay={0.16}
        >
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {status ? (
                <>
                  <span className="font-mono text-[13px] text-muted">
                    <span className="text-text">{status.liveCount}</span> / {status.total}{" "}
                    live
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em]"
                    style={{
                      color: MODE_META[status.mode].color,
                      borderColor: `color-mix(in srgb, ${MODE_META[status.mode].color} 40%, transparent)`,
                      background: `color-mix(in srgb, ${MODE_META[status.mode].color} 11%, transparent)`,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: MODE_META[status.mode].color }}
                      aria-hidden
                    />
                    {MODE_META[status.mode].label}
                  </span>
                </>
              ) : (
                <span className="font-mono text-[13px] text-faint">Loading status…</span>
              )}
            </div>
            <ButtonLink href="/app/integrations" variant="secondary" size="sm">
              Manage integrations
            </ButtonLink>
          </div>
        </Section>
      </div>
    </MotionConfig>
  );
}

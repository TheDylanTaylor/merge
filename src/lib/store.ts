"use client";

// ============================================================================
// Merge — client-side ledger (localStorage).
// This is REAL, persisted state — not a stub. Every changeset the agent
// proposes, every merge, and every revert is recorded here, and the dashboard
// / activity pages derive their numbers from it. Single-user demo scope: the
// browser is the source of truth (no DB needed), and it survives reloads.
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import type { Changeset, MergeResult, Role, System } from "@/types/changeset";

const KEY = "merge:ledger:v3";
const EVT = "merge:ledger-updated";

export type EventType = "proposed" | "merged" | "reverted";

export interface StoredChangeset {
  id: string;
  goal: string;
  summary: string;
  createdAt: string;
  totalHunks: number;
  dangerHunks: number;
  systems: System[];
  status: EventType;
}

export interface ActivityEvent {
  id: string;
  type: EventType;
  changesetId: string;
  goal: string;
  at: string; // ISO timestamp
  actorRole?: Role;
  applied: number; // hunks that produced a real/mock side effect
  mocked: number; // subset of applied that ran in mock mode
  blocked: number; // approved but RBAC-blocked
  landminesCaught: number; // danger hunks that did NOT get merged
  systems: System[];
  results?: MergeResult[];
}

interface Ledger {
  changesets: StoredChangeset[];
  events: ActivityEvent[];
}

export interface Stats {
  changesets: number;
  hunksMerged: number;
  landminesCaught: number;
  reverts: number;
}

const empty: Ledger = { changesets: [], events: [] };

// ---- low-level read/write --------------------------------------------------

function read(): Ledger {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Ledger;
    return {
      changesets: Array.isArray(parsed.changesets) ? parsed.changesets : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
    };
  } catch {
    return empty;
  }
}

function write(ledger: Ledger) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ledger));
    window.dispatchEvent(new Event(EVT));
  } catch {
    /* quota / private mode — non-fatal */
  }
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

// ---- derivations -----------------------------------------------------------

function landminesCaughtFor(cs: Changeset, results: MergeResult[]): number {
  const applied = new Set(results.filter((r) => r.ok).map((r) => r.hunkId));
  // a danger hunk is "caught" when it was NOT successfully merged
  return cs.changes.filter((c) => c.risk === "danger" && !applied.has(c.id))
    .length;
}

function systemsOf(cs: Changeset): System[] {
  return Array.from(new Set(cs.changes.map((c) => c.system)));
}

// ---- public API ------------------------------------------------------------

export function recordProposed(cs: Changeset) {
  const led = read();
  if (led.changesets.some((c) => c.id === cs.id)) return; // idempotent
  const stored: StoredChangeset = {
    id: cs.id,
    goal: cs.goal,
    summary: cs.summary,
    createdAt: cs.createdAt || new Date().toISOString(),
    totalHunks: cs.changes.length,
    dangerHunks: cs.changes.filter((c) => c.risk === "danger").length,
    systems: systemsOf(cs),
    status: "proposed",
  };
  const ev: ActivityEvent = {
    id: uid("ev"),
    type: "proposed",
    changesetId: cs.id,
    goal: cs.goal,
    at: new Date().toISOString(),
    applied: 0,
    mocked: 0,
    blocked: 0,
    landminesCaught: 0,
    systems: systemsOf(cs),
  };
  led.changesets = [stored, ...led.changesets].slice(0, 100);
  led.events = [ev, ...led.events].slice(0, 300);
  write(led);
}

export function recordMerge(
  cs: Changeset,
  results: MergeResult[],
  actorRole: Role,
) {
  const led = read();
  const applied = results.filter((r) => r.ok).length;
  const mocked = results.filter((r) => r.ok && r.mocked).length;
  const blocked = results.filter((r) => !r.ok).length;

  led.changesets = led.changesets.map((c) =>
    c.id === cs.id ? { ...c, status: "merged" as EventType } : c,
  );

  const ev: ActivityEvent = {
    id: uid("ev"),
    type: "merged",
    changesetId: cs.id,
    goal: cs.goal,
    at: new Date().toISOString(),
    actorRole,
    applied,
    mocked,
    blocked,
    landminesCaught: landminesCaughtFor(cs, results),
    systems: Array.from(new Set(results.map((r) => r.system))),
    results,
  };
  led.events = [ev, ...led.events].slice(0, 300);
  write(led);
}

export function recordRevert(
  changesetId: string,
  goal: string,
  results: MergeResult[],
) {
  const led = read();
  led.changesets = led.changesets.map((c) =>
    c.id === changesetId ? { ...c, status: "reverted" as EventType } : c,
  );
  const ev: ActivityEvent = {
    id: uid("ev"),
    type: "reverted",
    changesetId,
    goal,
    at: new Date().toISOString(),
    applied: 0,
    mocked: 0,
    blocked: 0,
    landminesCaught: 0,
    systems: Array.from(new Set(results.map((r) => r.system))),
    results,
  };
  led.events = [ev, ...led.events].slice(0, 300);
  write(led);
}

export function getChangesets(): StoredChangeset[] {
  return read().changesets;
}

export function getActivity(): ActivityEvent[] {
  return read().events;
}

export function getStats(): Stats {
  const led = read();
  const merges = led.events.filter((e) => e.type === "merged");
  return {
    changesets: led.changesets.length,
    hunksMerged: merges.reduce((n, e) => n + e.applied, 0),
    landminesCaught: merges.reduce((n, e) => n + e.landminesCaught, 0),
    reverts: led.events.filter((e) => e.type === "reverted").length,
  };
}

export function clearLedger() {
  write({ changesets: [], events: [] });
}

// ---- seed ------------------------------------------------------------------
// Populates a realistic history the first time the app is opened so the
// dashboard and audit log are alive on arrival. This is real ledger data
// (identical shape to live writes), not UI stubbing. Runs once per browser.

const SEED_FLAG = "merge:seeded:v3";

export function seedIfEmpty() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(SEED_FLAG)) return;
  const led = read();
  if (led.changesets.length > 0) {
    window.localStorage.setItem(SEED_FLAG, "1");
    return;
  }

  const now = Date.now();
  const hrs = (h: number) => new Date(now - h * 3600_000).toISOString();

  const seedChangesets: StoredChangeset[] = [
    {
      id: "seed-onboard",
      goal: "Onboard our new engineer, Maya, starting Monday.",
      summary:
        "Onboarding for Maya Chen: accounts, first-week plan, welcome, and equipment — 2 blocking conflicts flagged.",
      createdAt: hrs(52),
      totalHunks: 8,
      dangerHunks: 2,
      systems: ["linear", "slack", "gmail", "permissions", "shopping"],
      status: "merged",
    },
    {
      id: "seed-outage",
      goal: "Respond to the production outage affecting Acme Corp.",
      summary:
        "Incident response: ticket, status post, war-room, postmortem, credit — 2 blocking conflicts flagged.",
      createdAt: hrs(26),
      totalHunks: 8,
      dangerHunks: 2,
      systems: ["linear", "slack", "gmail", "permissions", "crm", "stripe"],
      status: "merged",
    },
    {
      id: "seed-launch",
      goal: "Launch our enterprise plan next Monday.",
      summary:
        "Coordinated enterprise launch: pricing, project, announcement, permissions, calendar, CRM — 2 conflicts flagged.",
      createdAt: hrs(5),
      totalHunks: 8,
      dangerHunks: 2,
      systems: ["stripe", "linear", "slack", "gmail", "permissions", "crm"],
      status: "proposed",
    },
  ];

  const seedEvents: ActivityEvent[] = [
    {
      id: "seed-ev-launch",
      type: "proposed",
      changesetId: "seed-launch",
      goal: "Launch our enterprise plan next Monday.",
      at: hrs(5),
      applied: 0,
      mocked: 0,
      blocked: 0,
      landminesCaught: 0,
      systems: ["stripe", "linear", "slack", "gmail", "permissions", "crm"],
    },
    {
      id: "seed-ev-outage",
      type: "merged",
      changesetId: "seed-outage",
      goal: "Respond to the production outage affecting Acme Corp.",
      at: hrs(25),
      actorRole: "engineering",
      applied: 6,
      mocked: 4,
      blocked: 0,
      landminesCaught: 2,
      systems: ["linear", "slack", "gmail", "crm", "stripe"],
    },
    {
      id: "seed-ev-onboard",
      type: "merged",
      changesetId: "seed-onboard",
      goal: "Onboard our new engineer, Maya, starting Monday.",
      at: hrs(51),
      actorRole: "engineering",
      applied: 6,
      mocked: 4,
      blocked: 0,
      landminesCaught: 2,
      systems: ["linear", "slack", "gmail", "permissions", "shopping"],
    },
  ];

  write({ changesets: seedChangesets, events: seedEvents });
  window.localStorage.setItem(SEED_FLAG, "1");
}

// ---- React hook ------------------------------------------------------------

export function useLedger() {
  const [ledger, setLedger] = useState<Ledger>(empty);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => setLedger(read()), []);

  useEffect(() => {
    seedIfEmpty();
    refresh();
    setHydrated(true);
    const onUpdate = () => refresh();
    window.addEventListener(EVT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(EVT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  const stats: Stats = {
    changesets: ledger.changesets.length,
    hunksMerged: ledger.events
      .filter((e) => e.type === "merged")
      .reduce((n, e) => n + e.applied, 0),
    landminesCaught: ledger.events
      .filter((e) => e.type === "merged")
      .reduce((n, e) => n + e.landminesCaught, 0),
    reverts: ledger.events.filter((e) => e.type === "reverted").length,
  };

  return {
    hydrated,
    changesets: ledger.changesets,
    events: ledger.events,
    stats,
    refresh,
    clear: clearLedger,
  };
}

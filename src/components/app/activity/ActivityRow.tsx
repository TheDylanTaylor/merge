"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ActivityEvent } from "@/lib/store";
import type { System } from "@/types/changeset";
import { Badge, type Tone } from "@/components/ui/Badge";
import SystemIcon, { systemLabel } from "@/components/SystemIcon";
import RoleAvatar from "@/components/RoleAvatar";
import { roleLabel } from "@/lib/permissions";
import {
  EVENT_VERB,
  eventSubline,
  formatClock,
  formatFull,
  relativeTime,
  shortId,
} from "./util";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ---- event-type visual metadata -------------------------------------------
// proposed = accent (violet) · merged = safe (green) · reverted = muted (gray)

type Kind = ActivityEvent["type"];

const KIND_COLOR: Record<Kind, string> = {
  proposed: "var(--accent)",
  merged: "var(--safe)",
  reverted: "var(--muted)",
};

const KIND_TONE: Record<Kind, Tone> = {
  proposed: "accent",
  merged: "merged",
  reverted: "reverted",
};

function EventGlyph({ kind }: { kind: Kind }) {
  const common = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (kind === "proposed") {
    // git-branch
    return (
      <svg {...common}>
        <circle cx="6.5" cy="6" r="2.1" />
        <circle cx="6.5" cy="18" r="2.1" />
        <circle cx="17.5" cy="7.5" r="2.1" />
        <path d="M6.5 8.1v7.8M17.5 9.6c0 4-3.5 3.4-7 4.4" />
      </svg>
    );
  }
  if (kind === "merged") {
    // git-merge
    return (
      <svg {...common}>
        <circle cx="6.5" cy="6" r="2.1" />
        <circle cx="6.5" cy="18" r="2.1" />
        <circle cx="17.5" cy="12" r="2.1" />
        <path d="M6.5 8.1v7.8M6.5 10.5c0 3.5 3.5 3.5 8.8 3.5" />
      </svg>
    );
  }
  // reverted — undo
  return (
    <svg {...common}>
      <path d="M9 7 4 12l5 5M4 12h10a5 5 0 0 1 0 10h-1.5" />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{
        transform: `rotate(${open ? 90 : 0}deg)`,
        transition: "transform 180ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FlagGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 21V4M5 4h11l-2 4 2 4H5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinkGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---- overlapping system stack ---------------------------------------------

function SystemStack({ systems }: { systems: System[] }) {
  const shown = systems.slice(0, 4);
  const extra = systems.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((s, i) => (
        <span
          key={s}
          title={systemLabel(s)}
          className="rounded-[9px]"
          style={{
            marginLeft: i === 0 ? 0 : -6,
            boxShadow: "0 0 0 2px var(--bg)",
            zIndex: shown.length - i,
          }}
        >
          <SystemIcon system={s} size={20} />
        </span>
      ))}
      {extra > 0 && (
        <span
          className="grid h-5 place-items-center rounded-[9px] border border-border bg-surface-2 px-1.5 font-mono text-[10px] text-muted"
          style={{ marginLeft: -6, boxShadow: "0 0 0 2px var(--bg)" }}
          title={systems.slice(4).map(systemLabel).join(", ")}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}

// ---- expanded detail -------------------------------------------------------

function ResultLine({
  system,
  ok,
  mocked,
  detail,
  error,
  externalUrl,
}: {
  system: System;
  ok: boolean;
  mocked: boolean;
  detail?: string;
  error?: string;
  externalUrl?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <SystemIcon system={system} size={24} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] text-text-2">
          {systemLabel(system)}
        </p>
        <p
          className="truncate font-mono text-[11.5px]"
          style={{ color: ok ? "var(--muted)" : "var(--danger)" }}
        >
          {ok ? detail ?? "Applied" : error ?? "Blocked — insufficient permission"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {ok && mocked && (
          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
            mocked
          </span>
        )}
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: ok ? "var(--safe)" : "var(--danger)" }}
          aria-hidden
        />
        {externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-mono text-[11px] text-muted transition-colors hover:text-accent"
          >
            <LinkGlyph />
            open
          </a>
        )}
      </div>
    </div>
  );
}

function MetaGrid({ e }: { e: ActivityEvent }) {
  const items: { label: string; value: string }[] = [
    { label: "Changeset", value: e.changesetId },
    { label: "Systems", value: e.systems.map(systemLabel).join(", ") },
  ];
  if (e.type === "merged") {
    items.push({
      label: "Outcome",
      value: `${e.applied} applied · ${e.mocked} mocked · ${e.blocked} blocked`,
    });
    items.push({
      label: "Landmines caught",
      value: String(e.landminesCaught),
    });
  }
  if (e.type === "proposed")
    items.push({ label: "Status", value: "Awaiting human review" });
  if (e.actorRole)
    items.push({ label: "Approved by", value: roleLabel(e.actorRole) });

  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
      {items.map((it) => (
        <div key={it.label} className="flex items-baseline justify-between gap-4">
          <dt className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.1em] text-faint">
            {it.label}
          </dt>
          <dd className="truncate text-right font-mono text-[11.5px] text-text-2">
            {it.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// ---- the row ---------------------------------------------------------------

export default function ActivityRow({
  event,
  index,
}: {
  event: ActivityEvent;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const color = KIND_COLOR[event.type];
  const results = event.results ?? [];

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduce ? 0 : 0.26,
        delay: reduce ? 0 : Math.min(index * 0.028, 0.32),
        ease: EASE,
      }}
      className="border-b border-border last:border-b-0"
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        className="flex min-h-[64px] cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-surface"
      >
        {/* timestamp */}
        <div
          className="w-[68px] shrink-0 leading-tight"
          title={formatFull(event.at)}
        >
          <div className="font-mono text-[12.5px] tabular-nums text-text">
            {formatClock(event.at)}
          </div>
          <div className="font-mono text-[11px] tabular-nums text-faint">
            {relativeTime(event.at)}
          </div>
        </div>

        {/* event-type icon */}
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] border"
          style={{
            color,
            borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
            background: `color-mix(in srgb, ${color} 12%, transparent)`,
          }}
        >
          <EventGlyph kind={event.type} />
        </span>

        {/* title + subline */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.08em] text-faint">
              {EVENT_VERB[event.type]}
            </span>
            <span className="truncate text-[13.5px] font-medium text-text">
              {event.goal}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 font-mono text-[11.5px] text-faint">
            <span className="truncate">{eventSubline(event)}</span>
            <span className="text-border-strong">·</span>
            <span className="shrink-0 tabular-nums">
              #{shortId(event.changesetId)}
            </span>
          </div>
        </div>

        {/* systems */}
        <div className="hidden shrink-0 md:block">
          <SystemStack systems={event.systems} />
        </div>

        {/* landmine chip */}
        {event.landminesCaught > 0 && (
          <span className="hidden shrink-0 lg:block">
            <Badge tone="danger">
              <FlagGlyph />
              {event.landminesCaught}
            </Badge>
          </span>
        )}

        {/* approver */}
        {event.actorRole ? (
          <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
            <RoleAvatar role={event.actorRole} size={22} />
            <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">
              {roleLabel(event.actorRole)}
            </span>
          </div>
        ) : (
          <span className="hidden w-[92px] shrink-0 text-right font-mono text-[10.5px] uppercase tracking-[0.08em] text-faint lg:block">
            agent
          </span>
        )}

        {/* lifecycle badge */}
        <span className="hidden shrink-0 sm:block">
          <Badge tone={KIND_TONE[event.type]}>{EVENT_VERB[event.type]}</Badge>
        </span>

        {/* chevron */}
        <span className="shrink-0 text-faint">
          <Chevron open={open} />
        </span>
      </div>

      {/* expandable detail */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="border-t border-border bg-bg-subtle px-4 py-4 pl-[96px]">
              {results.length > 0 ? (
                <div className="divide-y divide-border">
                  {results.map((r, i) => (
                    <ResultLine
                      key={`${r.hunkId}-${i}`}
                      system={r.system}
                      ok={r.ok}
                      mocked={r.mocked}
                      detail={r.detail}
                      error={r.error}
                      externalUrl={r.externalUrl}
                    />
                  ))}
                </div>
              ) : (
                <MetaGrid e={event} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

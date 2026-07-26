"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";
import RoleAvatar from "@/components/RoleAvatar";
import { ROLES } from "@/lib/permissions";
import type { Role } from "@/types/changeset";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function BackChevron() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatCreatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** A single mono metadata token in the changeset meta row. */
function Meta({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-muted"
      title={title}
    >
      {children}
    </span>
  );
}

function Dot() {
  return (
    <span className="text-faint" aria-hidden>
      ·
    </span>
  );
}

export default function ReviewHeader({
  id,
  goal,
  summary,
  hunkCount,
  systemCount,
  dangerCount,
  createdAt,
  actorRole,
  onRole,
  disabled,
}: {
  id: string;
  goal: string;
  summary: string;
  hunkCount: number;
  systemCount: number;
  dangerCount: number;
  createdAt: string;
  actorRole: Role;
  onRole: (r: Role) => void;
  disabled: boolean;
}) {
  const created = formatCreatedAt(createdAt);

  return (
    <header className="glass sticky top-0 z-30 border-b border-border/80">
      <div className="mx-auto max-w-4xl px-6 py-4">
        {/* top strip: back + logo · role switcher */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-text"
            >
              <BackChevron />
              <span className="hidden sm:inline">Overview</span>
            </Link>
            <span className="h-4 w-px bg-border" aria-hidden />
            <Logo href="/app" size={20} />
          </div>

          {/* role switcher — "Acting as" (a deliberate demo beat) */}
          <div className="flex items-center gap-2.5">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-faint sm:inline">
              Acting as
            </span>
            <div className="flex gap-0.5 rounded-lg border border-border bg-bg-subtle p-1">
              {ROLES.map((r) => {
                const active = actorRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onRole(r.id)}
                    disabled={disabled}
                    title={`Act as ${r.label}`}
                    aria-pressed={active}
                    className="relative inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: active
                        ? "color-mix(in srgb, var(--accent) 16%, transparent)"
                        : "transparent",
                      color: active ? "var(--text)" : "var(--muted)",
                      boxShadow: active
                        ? "inset 0 0 0 1px color-mix(in srgb, var(--accent) 45%, transparent)"
                        : "none",
                    }}
                  >
                    <RoleAvatar role={r.id} size={18} />
                    <span className="hidden md:inline">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* title block */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: EASE }}
        >
          <div className="flex items-center gap-2">
            <span className="eyebrow !tracking-[0.18em]">Changeset · Review</span>
            {dangerCount > 0 && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em]"
                style={{
                  color: "var(--danger)",
                  background: "color-mix(in srgb, var(--danger) 12%, transparent)",
                  border:
                    "1px solid color-mix(in srgb, var(--danger) 40%, transparent)",
                }}
              >
                {dangerCount} landmine{dangerCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <h1 className="mt-2 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-text">
            {goal}
          </h1>
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-text-2">
            {summary}
          </p>

          {/* meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <Meta title="Changeset id">
              <span className="text-faint">#</span>
              <span className="text-text-2">{id}</span>
            </Meta>
            <Dot />
            <Meta title="Total hunks">
              <span className="tabular-nums text-text-2">{hunkCount}</span> hunks
            </Meta>
            <Dot />
            <Meta title="Systems touched">
              <span className="tabular-nums text-text-2">{systemCount}</span>{" "}
              systems
            </Meta>
            {created && (
              <>
                <Dot />
                <Meta title={createdAt}>
                  <span className="text-text-2">{created}</span>
                </Meta>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </header>
  );
}

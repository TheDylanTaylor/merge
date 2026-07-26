"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Change, HunkStatus } from "@/types/changeset";
import { roleLabel } from "@/lib/permissions";
import SystemIcon from "./SystemIcon";
import RiskBadge from "./RiskBadge";
import RoleAvatar from "./RoleAvatar";

/** During a merge, each visible hunk is in one of these display states. */
export type MergePhase = "idle" | "queued" | "applied" | "muted";

function CheckIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="5"
        y="10.5"
        width="14"
        height="9.5"
        rx="2.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 10.5V8a4 4 0 0 1 8 0v2.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WarnGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.2 22 20H2L12 3.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 9.5v4.2"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="1.1" fill="currentColor" />
    </svg>
  );
}

export default function HunkCard({
  change,
  status,
  canApproveIt,
  onApprove,
  onReject,
  mergePhase = "idle",
}: {
  change: Change;
  status: HunkStatus;
  canApproveIt: boolean;
  onApprove: () => void;
  onReject: () => void;
  mergePhase?: MergePhase;
}) {
  const isDanger = change.risk === "danger";
  const approved = status === "approved" && canApproveIt;
  const rejected = status === "rejected";
  const locked = !canApproveIt;

  const interactive = mergePhase === "idle";
  const applied = mergePhase === "applied";
  const muted = mergePhase === "muted";

  // Status rail colour: applied hunks go green mid-merge; otherwise reflect state.
  const accent = applied
    ? "var(--safe)"
    : rejected
      ? "var(--muted)"
      : approved
        ? "var(--safe)"
        : "var(--review)";

  const statusLabel = applied
    ? "Applied"
    : rejected
      ? "Rejected"
      : approved
        ? "Approved"
        : locked
          ? `Locked — needs ${roleLabel(change.requiredRole)}`
          : "Needs review";

  // Border + glow: applied → green; danger (pre-merge) → red glow; else default.
  const borderColor = applied
    ? "color-mix(in srgb, var(--safe) 55%, var(--border))"
    : isDanger && interactive
      ? "color-mix(in srgb, var(--danger) 42%, var(--border))"
      : undefined;

  const boxShadow = applied
    ? "0 0 26px -8px rgba(63,185,80,0.55)"
    : isDanger && interactive
      ? "0 0 24px -6px rgba(248,81,73,0.40)"
      : undefined;

  return (
    <motion.div
      className="hunk-rise group relative overflow-hidden rounded-xl border bg-panel"
      animate={{ opacity: muted ? 0.32 : rejected && interactive ? 0.6 : 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{ borderColor, boxShadow }}
    >
      {/* status rail */}
      <motion.span
        className="absolute inset-y-0 left-0 z-10 w-[3px]"
        animate={{ background: accent }}
        transition={{ duration: 0.3 }}
        aria-hidden
      />

      {/* apply-sweep: a green band that wipes across the card once when applied */}
      <AnimatePresence>
        {applied && (
          <motion.span
            key="sweep"
            className="pointer-events-none absolute inset-0 z-20"
            initial={{ opacity: 0.85, x: "-45%" }}
            animate={{ opacity: 0, x: "130%" }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background:
                "linear-gradient(100deg, transparent 0%, color-mix(in srgb, var(--safe) 30%, transparent) 45%, color-mix(in srgb, var(--safe) 8%, transparent) 60%, transparent 100%)",
            }}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <div className="relative z-[15] p-4 pl-5">
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <SystemIcon system={change.system} size={30} />
            <h4
              className={`min-w-0 truncate text-[15px] font-medium ${
                rejected && interactive ? "text-muted line-through" : "text-text"
              }`}
              title={change.title}
            >
              {change.title}
            </h4>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <RiskBadge risk={change.risk} />
            <RoleAvatar role={change.requiredRole} size={22} />
          </div>
        </div>

        {/* diff */}
        <div className="mt-3.5 overflow-hidden rounded-lg border font-mono text-[12.5px] leading-relaxed">
          <div
            className="flex gap-2 px-3 py-1.5"
            style={{
              background: "color-mix(in srgb, var(--danger) 7%, transparent)",
              borderLeft: "2px solid color-mix(in srgb, var(--danger) 55%, transparent)",
            }}
          >
            <span className="select-none text-danger" aria-hidden>
              −
            </span>
            <span className="whitespace-pre-wrap break-words text-text/75">
              {change.before}
            </span>
          </div>
          <div className="h-px bg-border" />
          <div
            className="flex gap-2 px-3 py-1.5"
            style={{
              background: "color-mix(in srgb, var(--safe) 9%, transparent)",
              borderLeft: "2px solid color-mix(in srgb, var(--safe) 55%, transparent)",
            }}
          >
            <span className="select-none text-safe" aria-hidden>
              +
            </span>
            <span className="whitespace-pre-wrap break-words text-text">
              {change.after}
            </span>
          </div>
        </div>

        {/* landmine — the emotional beat */}
        {change.conflict && (
          <div
            className="mt-3.5 rounded-lg border p-3"
            style={{
              borderColor: "color-mix(in srgb, var(--danger) 48%, transparent)",
              background: "color-mix(in srgb, var(--danger) 8%, transparent)",
              boxShadow: "0 0 22px -8px rgba(248,81,73,0.45)",
            }}
          >
            <div className="flex items-start gap-2.5">
              <motion.span
                className="mt-0.5 shrink-0 text-danger"
                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.08, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <WarnGlyph />
              </motion.span>
              <div className="min-w-0">
                <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-danger">
                  Landmine detected
                </div>
                <p className="mt-1 text-[13px] leading-snug text-text">
                  {change.conflict}
                </p>
                {change.evidence && (
                  <p className="mt-2 border-l-2 border-danger/40 pl-2.5 text-[12px] leading-snug text-muted">
                    <span className="font-mono uppercase tracking-wider text-muted/80">
                      Evidence&nbsp;
                    </span>
                    {change.evidence}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* actions */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <span
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em]"
            style={{ color: accent }}
          >
            {applied && <CheckIcon size={12} />}
            {statusLabel}
          </span>

          <div className="flex items-center gap-2">
            {locked ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-[11px]"
                style={{
                  color: "var(--review)",
                  borderColor:
                    "color-mix(in srgb, var(--review) 40%, transparent)",
                  background:
                    "color-mix(in srgb, var(--review) 10%, transparent)",
                }}
              >
                <LockGlyph />
                Needs {roleLabel(change.requiredRole)}
              </span>
            ) : (
              <button
                type="button"
                onClick={onApprove}
                aria-pressed={approved}
                disabled={!interactive}
                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12.5px] font-medium transition-colors disabled:cursor-not-allowed"
                style={
                  approved
                    ? {
                        color: "var(--safe)",
                        borderColor:
                          "color-mix(in srgb, var(--safe) 50%, transparent)",
                        background:
                          "color-mix(in srgb, var(--safe) 14%, transparent)",
                      }
                    : {
                        color: "var(--muted)",
                        borderColor: "var(--border)",
                        background: "transparent",
                      }
                }
              >
                <CheckIcon />
                Approve
              </button>
            )}

            <button
              type="button"
              onClick={onReject}
              aria-pressed={rejected}
              disabled={!interactive}
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12.5px] font-medium transition-colors disabled:cursor-not-allowed"
              style={
                rejected
                  ? {
                      color: "var(--danger)",
                      borderColor:
                        "color-mix(in srgb, var(--danger) 50%, transparent)",
                      background:
                        "color-mix(in srgb, var(--danger) 13%, transparent)",
                    }
                  : {
                      color: "var(--muted)",
                      borderColor: "var(--border)",
                      background: "transparent",
                    }
              }
            >
              <CloseIcon />
              Reject
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

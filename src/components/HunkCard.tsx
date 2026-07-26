"use client";

import { motion } from "framer-motion";
import type { Change, HunkStatus } from "@/types/changeset";
import { roleLabel } from "@/lib/permissions";
import SystemIcon from "./SystemIcon";
import RiskBadge from "./RiskBadge";
import RoleAvatar from "./RoleAvatar";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
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

const DIFF = {
  card: {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
  },
};

export default function HunkCard({
  change,
  status,
  canApproveIt,
  onApprove,
  onReject,
}: {
  change: Change;
  status: HunkStatus;
  canApproveIt: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const isDanger = change.risk === "danger";
  const approved = status === "approved" && canApproveIt;
  const rejected = status === "rejected";
  const locked = !canApproveIt;

  const accent = rejected
    ? "var(--muted)"
    : approved
      ? "var(--safe)"
      : "var(--review)";

  const statusLabel = rejected
    ? "Rejected"
    : approved
      ? "Approved"
      : locked
        ? "Locked"
        : "Needs review";

  return (
    <motion.div
      variants={DIFF.card}
      className="group relative overflow-hidden rounded-xl border bg-panel"
      animate={
        isDanger
          ? {
              boxShadow: [
                "0 0 0 0 rgba(248,81,73,0.0)",
                "0 0 22px -4px rgba(248,81,73,0.35)",
                "0 0 0 0 rgba(248,81,73,0.0)",
              ],
            }
          : undefined
      }
      transition={
        isDanger
          ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
          : undefined
      }
      style={{
        borderColor: isDanger
          ? "color-mix(in srgb, var(--danger) 42%, var(--border))"
          : undefined,
        opacity: rejected ? 0.62 : 1,
      }}
    >
      {/* status rail */}
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: accent }}
        aria-hidden
      />

      <div className="p-4 pl-5">
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <SystemIcon system={change.system} size={30} />
            <h4
              className={`min-w-0 truncate text-[15px] font-medium ${
                rejected ? "text-muted line-through" : "text-text"
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
            }}
          >
            <span className="select-none text-danger" aria-hidden>
              −
            </span>
            <span className="whitespace-pre-wrap break-words text-text/80">
              {change.before}
            </span>
          </div>
          <div className="h-px bg-border" />
          <div
            className="flex gap-2 px-3 py-1.5"
            style={{
              background: "color-mix(in srgb, var(--safe) 9%, transparent)",
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

        {/* landmine */}
        {change.conflict && (
          <div
            className="mt-3.5 rounded-lg border p-3"
            style={{
              borderColor: "color-mix(in srgb, var(--danger) 45%, transparent)",
              background: "color-mix(in srgb, var(--danger) 8%, transparent)",
              boxShadow: "0 0 20px -6px rgba(248,81,73,0.4)",
            }}
          >
            <div className="flex items-start gap-2.5">
              <motion.span
                className="mt-0.5 shrink-0 text-danger"
                animate={{ opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <WarnGlyph />
              </motion.span>
              <div className="min-w-0">
                <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-danger">
                  Landmine
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
        <div className="mt-4 flex items-center justify-between">
          <span
            className="font-mono text-[11px] uppercase tracking-[0.12em]"
            style={{ color: accent }}
          >
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
                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12.5px] font-medium transition-colors"
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
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12.5px] font-medium transition-colors"
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

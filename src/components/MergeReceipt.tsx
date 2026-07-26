"use client";

import { motion, type Variants } from "framer-motion";
import type { Changeset, MergeResult } from "@/types/changeset";
import SystemIcon from "./SystemIcon";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type ReceiptPhase = "merged" | "reverting" | "reverted";

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

function LinkGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
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

function UndoGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 7 4 12l5 5M4 12h11a5 5 0 0 1 0 10h-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MergeReceipt({
  changeset,
  results,
  phase,
  onRevert,
  onHome,
}: {
  changeset: Changeset;
  results: MergeResult[];
  phase: ReceiptPhase;
  onRevert: () => void;
  onHome: () => void;
}) {
  const titleFor = (hunkId: string) =>
    changeset.changes.find((c) => c.id === hunkId)?.title ?? hunkId;

  const reverted = phase === "reverted";
  const reverting = phase === "reverting";

  const okCount = results.filter((r) => r.ok).length;
  const blockedCount = results.filter((r) => !r.ok).length;
  const mockedCount = results.filter((r) => r.ok && r.mocked).length;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={list}
      className="mx-auto max-w-3xl"
    >
      {/* header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="mb-6 flex items-center gap-4">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border"
          style={{
            color: reverted ? "var(--muted)" : "var(--safe)",
            borderColor: reverted
              ? "var(--border)"
              : "color-mix(in srgb, var(--safe) 45%, transparent)",
            background: reverted
              ? "transparent"
              : "color-mix(in srgb, var(--safe) 12%, transparent)",
          }}
        >
          {reverted ? (
            <UndoGlyph />
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M20 6 9 17l-5-5"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {reverted ? "Changes reverted" : "Merged to reality"}
          </h2>
          <p className="mt-0.5 font-mono text-[12px] text-muted">
            {reverted
              ? `${results.length} side effects rolled back`
              : `${okCount} applied · ${mockedCount} mocked · ${blockedCount} blocked`}
          </p>
        </div>
      </motion.div>

      {/* rows */}
      <div className="space-y-2.5">
        {results.map((r) => {
          const blocked = !r.ok;
          return (
            <motion.div
              key={r.hunkId}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}
              className="flex items-center gap-3 rounded-xl border bg-panel px-4 py-3"
              style={{
                opacity: reverted ? 0.55 : 1,
                borderColor: blocked
                  ? "color-mix(in srgb, var(--danger) 42%, var(--border))"
                  : undefined,
              }}
            >
              <SystemIcon system={r.system} size={30} />

              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-[14px] ${
                    reverted ? "text-muted line-through" : "text-text"
                  }`}
                >
                  {titleFor(r.hunkId)}
                </p>
                <p
                  className="truncate font-mono text-[11.5px]"
                  style={{ color: blocked ? "var(--danger)" : "var(--muted)" }}
                >
                  {blocked
                    ? r.error ?? "Blocked — insufficient permission"
                    : r.detail ?? "Applied"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {r.ok && r.mocked && (
                  <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                    mocked
                  </span>
                )}

                {blocked ? (
                  <span
                    className="grid h-6 w-6 place-items-center rounded-full"
                    style={{
                      color: "var(--danger)",
                      background:
                        "color-mix(in srgb, var(--danger) 14%, transparent)",
                    }}
                    aria-label="blocked"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 6l12 12M18 6 6 18"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                ) : (
                  !reverted && (
                    <span
                      className="grid h-6 w-6 place-items-center rounded-full"
                      style={{
                        color: "var(--safe)",
                        background:
                          "color-mix(in srgb, var(--safe) 14%, transparent)",
                      }}
                      aria-label="applied"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M20 6 9 17l-5-5"
                          stroke="currentColor"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )
                )}

                {r.externalUrl && !reverted && (
                  <a
                    href={r.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-mono text-[11px] text-muted transition-colors hover:text-text"
                  >
                    <LinkGlyph />
                    open
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* footer actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}
        className="mt-7 flex items-center justify-between gap-3"
      >
        <button
          type="button"
          onClick={onHome}
          className="rounded-lg border border-border px-4 py-2.5 text-[13px] font-medium text-muted transition-colors hover:text-text"
        >
          New changeset
        </button>

        {reverted ? (
          <span className="font-mono text-[12px] text-muted">
            Reality restored.
          </span>
        ) : (
          <button
            type="button"
            onClick={onRevert}
            disabled={reverting}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-semibold transition-colors disabled:opacity-50"
            style={{
              color: "var(--danger)",
              borderColor: "color-mix(in srgb, var(--danger) 45%, transparent)",
              background: "color-mix(in srgb, var(--danger) 9%, transparent)",
            }}
          >
            {reverting ? (
              <>
                <motion.span
                  className="inline-block h-3.5 w-3.5 rounded-full border-2 border-danger/40 border-t-danger"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                  aria-hidden
                />
                Reverting…
              </>
            ) : (
              <>
                <UndoGlyph />
                Revert everything
              </>
            )}
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

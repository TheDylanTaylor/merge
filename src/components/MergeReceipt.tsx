"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Changeset, MergeResult } from "@/types/changeset";
import SystemIcon, { systemLabel } from "./SystemIcon";
import { ButtonLink } from "./ui/Button";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type ReceiptPhase = "merged" | "reverting" | "reverted";

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

function UndoGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
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

function CheckGlyph({ size = 22 }: { size?: number }) {
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

export default function MergeReceipt({
  changeset,
  results,
  phase,
  onRevert,
}: {
  changeset: Changeset;
  results: MergeResult[];
  phase: ReceiptPhase;
  onRevert: () => void;
}) {
  const titleFor = (hunkId: string) =>
    changeset.changes.find((c) => c.id === hunkId)?.title ?? hunkId;

  const reverted = phase === "reverted";
  const reverting = phase === "reverting";

  const realApplied = results.filter((r) => r.ok && !r.mocked).length;
  const simulated = results.filter((r) => r.ok && r.mocked).length;
  const blocked = results.filter((r) => !r.ok).length;
  const revertible = results.some((r) => r.ok);

  const summaryLine = reverted
    ? `${results.filter((r) => r.ok).length} side effect${
        results.filter((r) => r.ok).length === 1 ? "" : "s"
      } rolled back`
    : [
        realApplied > 0 ? `${realApplied} applied` : null,
        simulated > 0 ? `${simulated} simulated` : null,
        blocked > 0 ? `${blocked} blocked` : null,
      ]
        .filter(Boolean)
        .join(" · ") || "Nothing applied";

  const okResults = results.filter((r) => r.ok);
  const revertOrder = new Map(
    okResults.map((r, i) => [r.hunkId, okResults.length - 1 - i]),
  );

  return (
    <div className="mx-auto max-w-3xl">
      {/* header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="mb-6 flex items-center gap-4"
      >
        <motion.div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border"
          animate={{
            color: reverted ? "var(--review)" : "var(--safe)",
            borderColor: reverted
              ? "color-mix(in srgb, var(--review) 45%, transparent)"
              : "color-mix(in srgb, var(--safe) 45%, transparent)",
            backgroundColor: reverted
              ? "color-mix(in srgb, var(--review) 10%, transparent)"
              : "color-mix(in srgb, var(--safe) 12%, transparent)",
          }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {reverted ? <UndoGlyph size={20} /> : <CheckGlyph />}
        </motion.div>
        <div>
          <h2 className="text-[22px] font-semibold leading-tight tracking-[-0.02em]">
            {reverted ? "Reality restored" : "Merged to reality"}
          </h2>
          <p className="mt-0.5 font-mono text-[12px] text-muted">{summaryLine}</p>
        </div>
      </motion.div>

      {/* rows — reveal sequentially top→down (concrete per-row delays, no variant labels) */}
      <div className="space-y-2.5">
        {results.map((r, i) => {
          const isBlocked = !r.ok;
          const dimmed = reverted && r.ok;
          const revIndex = revertOrder.get(r.hunkId) ?? 0;
          return (
            <motion.div
              key={r.hunkId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: dimmed ? 0.5 : 1, y: 0 }}
              transition={{
                duration: 0.34,
                ease: EASE,
                delay: reverted || reverting ? 0 : 0.12 + i * 0.08,
              }}
              className="relative flex items-center gap-3 overflow-hidden rounded-xl border bg-panel px-4 py-3"
              style={{
                borderColor: isBlocked
                  ? "color-mix(in srgb, var(--danger) 42%, var(--border))"
                  : undefined,
              }}
            >
              {/* amber reverse-sweep while reverting (bottom → top stagger) */}
              <AnimatePresence>
                {reverting && r.ok && (
                  <motion.span
                    key="revert-sweep"
                    className="pointer-events-none absolute inset-0 z-20"
                    initial={{ opacity: 0.8, x: "130%" }}
                    animate={{ opacity: 0, x: "-45%" }}
                    transition={{
                      duration: 0.55,
                      ease: EASE,
                      delay: revIndex * 0.07,
                    }}
                    style={{
                      background:
                        "linear-gradient(260deg, transparent 0%, color-mix(in srgb, var(--review) 28%, transparent) 45%, transparent 100%)",
                    }}
                    aria-hidden
                  />
                )}
              </AnimatePresence>

              <SystemIcon system={r.system} size={30} />

              <div className="relative z-10 min-w-0 flex-1">
                <p
                  className={`truncate text-[14px] ${
                    dimmed ? "text-muted line-through" : "text-text"
                  }`}
                >
                  {titleFor(r.hunkId)}
                </p>
                <p
                  className="truncate font-mono text-[11.5px]"
                  style={{
                    color: isBlocked
                      ? "var(--danger)"
                      : dimmed
                        ? "var(--faint)"
                        : "var(--muted)",
                  }}
                >
                  {isBlocked
                    ? r.error ?? "Blocked — insufficient permission"
                    : dimmed
                      ? `Reverted on ${systemLabel(r.system)}`
                      : r.detail ?? "Applied"}
                </p>
              </div>

              <div className="relative z-10 flex shrink-0 items-center gap-2">
                {r.ok && r.mocked && !reverted && (
                  <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                    mocked
                  </span>
                )}

                {r.externalUrl && !reverted && (
                  <a
                    href={r.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-mono text-[11px] text-muted transition-colors hover:border-border-strong hover:text-accent"
                  >
                    <LinkGlyph />
                    open
                  </a>
                )}

                {/* outcome glyph */}
                {isBlocked ? (
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
                ) : reverted ? (
                  <span
                    className="grid h-6 w-6 place-items-center rounded-full text-muted"
                    style={{ background: "var(--surface-2)" }}
                    aria-label="reverted"
                  >
                    <UndoGlyph size={12} />
                  </span>
                ) : (
                  <span
                    className="grid h-6 w-6 place-items-center rounded-full"
                    style={{
                      color: "var(--safe)",
                      background:
                        "color-mix(in srgb, var(--safe) 14%, transparent)",
                    }}
                    aria-label="applied"
                  >
                    <CheckGlyph size={12} />
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* footer actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.34,
          ease: EASE,
          delay: reverted || reverting ? 0 : 0.12 + results.length * 0.08,
        }}
        className="mt-7 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2.5">
          <ButtonLink href="/app" variant="secondary" size="md">
            Back to overview
          </ButtonLink>
          <ButtonLink href="/app#compose" variant="ghost" size="md">
            New changeset
          </ButtonLink>
        </div>

        {reverted ? (
          <span className="inline-flex items-center gap-2 font-mono text-[12px] text-muted">
            <UndoGlyph size={13} />
            Every side effect has been rolled back.
          </span>
        ) : revertible ? (
          <button
            type="button"
            onClick={onRevert}
            disabled={reverting}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-semibold transition-colors disabled:opacity-60"
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
        ) : (
          <span className="font-mono text-[12px] text-muted">
            Nothing to revert.
          </span>
        )}
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";

function MergeGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="6" cy="18" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="15" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M6 8.5v7M6 12a6 6 0 0 0 6 6h3.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Stat({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: color }}
        aria-hidden
      />
      <span className="tabular-nums font-medium text-text">{value}</span>
      <span className="text-muted">{label}</span>
    </span>
  );
}

export default function MergeBar({
  approvedCount,
  rejectedCount,
  reviewNeeded,
  total,
  realCount,
  merging,
  onMerge,
}: {
  approvedCount: number;
  rejectedCount: number;
  reviewNeeded: number;
  total: number;
  realCount: number;
  merging: boolean;
  onMerge: () => void;
}) {
  const disabled = merging || approvedCount === 0;

  return (
    <div className="glass sticky bottom-0 z-30 border-t border-border/80">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-3.5">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
            <Stat value={approvedCount} label="approved" color="var(--safe)" />
            <span className="h-3 w-px bg-border" aria-hidden />
            <Stat value={rejectedCount} label="rejected" color="var(--muted)" />
            <span className="h-3 w-px bg-border" aria-hidden />
            <Stat
              value={reviewNeeded}
              label="need review"
              color="var(--review)"
            />
          </div>

          <p className="flex items-center gap-1.5 font-mono text-[11px]">
            {realCount > 0 ? (
              <>
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--accent)" }}
                  aria-hidden
                />
                <span className="text-text-2">
                  <span className="tabular-nums">{realCount}</span> will fire real
                  side effects
                </span>
                <span className="text-faint">
                  · the rest run in mock mode
                </span>
              </>
            ) : (
              <span className="text-muted">No live side effects staged</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {reviewNeeded > 0 && !merging && (
            <span className="hidden font-mono text-[11px] text-review sm:inline">
              {reviewNeeded} hunk{reviewNeeded > 1 ? "s" : ""} still awaiting
              review
            </span>
          )}

          <motion.button
            type="button"
            onClick={onMerge}
            disabled={disabled}
            whileHover={disabled ? undefined : { scale: 1.015 }}
            whileTap={disabled ? undefined : { scale: 0.97 }}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 text-[14px] font-semibold text-white transition-[opacity,box-shadow] disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: "var(--accent)",
              boxShadow: disabled
                ? "none"
                : "0 0 26px -6px color-mix(in srgb, var(--accent) 85%, transparent)",
            }}
          >
            {merging ? (
              <>
                <motion.span
                  className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                  aria-hidden
                />
                Applying…
              </>
            ) : (
              <>
                <MergeGlyph />
                Merge {approvedCount} of {total}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

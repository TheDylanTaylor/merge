import type { ReactNode } from "react";

export type Tone =
  | "safe"
  | "review"
  | "danger"
  | "neutral"
  | "accent"
  | "merged"
  | "reverted";

const toneVar: Record<Tone, string> = {
  safe: "var(--safe)",
  review: "var(--review)",
  danger: "var(--danger)",
  merged: "var(--safe)",
  reverted: "var(--muted)",
  neutral: "var(--muted)",
  accent: "var(--accent)",
};

/** Compact pill used for risk, lifecycle, and metadata across the app. */
export function Badge({
  tone = "neutral",
  children,
  className = "",
  mono = true,
  dot = false,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  mono?: boolean;
  dot?: boolean;
}) {
  const c = toneVar[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.08em] ${
        mono ? "font-mono" : ""
      } ${className}`}
      style={{
        color: c,
        borderColor: `color-mix(in srgb, ${c} 40%, transparent)`,
        background: `color-mix(in srgb, ${c} 11%, transparent)`,
      }}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: c }}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

/** Live vs Mock status — honesty is a feature; never fake "live". */
export function LiveBadge({ live }: { live: boolean }) {
  if (live) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em]"
        style={{
          color: "var(--safe)",
          borderColor: "color-mix(in srgb, var(--safe) 45%, transparent)",
          background: "color-mix(in srgb, var(--safe) 12%, transparent)",
        }}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safe opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-safe" />
        </span>
        Live
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted">
      <span className="h-1.5 w-1.5 rounded-full border border-muted" aria-hidden />
      Mock
    </span>
  );
}

import Link from "next/link";

/** The Merge mark: a git-branch glyph that resolves into one node. */
export function MergeMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <circle cx="6" cy="5" r="2.1" stroke="var(--accent-2)" strokeWidth="1.8" />
      <circle cx="6" cy="19" r="2.1" stroke="var(--accent-2)" strokeWidth="1.8" />
      <circle cx="18" cy="12" r="2.1" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1.8" />
      <path
        d="M6 7v10M8 5.4c6 0 2 6.6 8 6.6M8 18.6c6 0 2-6.6 8-6.6"
        stroke="var(--accent-2)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Logo({
  href = "/",
  size = 22,
  showWord = true,
  className = "",
}: {
  href?: string | null;
  size?: number;
  showWord?: boolean;
  className?: string;
}) {
  const inner = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <MergeMark size={size} />
      {showWord && (
        <span className="text-[17px] font-semibold tracking-tight text-text">
          Merge<span className="text-accent">.</span>
        </span>
      )}
    </span>
  );
  if (href === null) return inner;
  return (
    <Link href={href} className="inline-flex items-center transition-opacity hover:opacity-80">
      {inner}
    </Link>
  );
}

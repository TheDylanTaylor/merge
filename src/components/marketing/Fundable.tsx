import Reveal from "./Reveal";

const BULLETS = [
  {
    k: "Partial approval",
    v: "Humans keep line-item control instead of one blunt yes/no on a wall of tool-calls.",
  },
  {
    k: "Real execution + revert",
    v: "Side effects fire against live systems, and every one can be replayed in reverse.",
  },
  {
    k: "Landmine detection",
    v: "False compliance claims, over-scoped grants, and over-budget spend are caught pre-merge.",
  },
];

export default function Fundable() {
  return (
    <section id="fundable" className="relative scroll-mt-24">
      <div className="mx-auto max-w-content px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Reveal>
          <div className="rounded-xl border border-border bg-surface p-8 md:p-12">
            <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
              <div>
                <p className="eyebrow" style={{ color: "var(--accent)" }}>Why now</p>
                <h2 className="mt-4 text-h1 font-semibold text-text">
                  The missing control plane for Software for Agents.
                </h2>
                <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-text-2">
                  Agents will soon touch every system a company runs. The
                  bottleneck isn&apos;t capability — it&apos;s trust. Merge is
                  the review, execution, and rollback layer that makes autonomous
                  action safe to ship.
                </p>
              </div>

              <div className="flex flex-col justify-center gap-5">
                {BULLETS.map((b) => (
                  <div key={b.k} className="border-l-2 pl-4" style={{ borderColor: "color-mix(in srgb, var(--accent) 55%, transparent)" }}>
                    <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-text">{b.k}</p>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{b.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

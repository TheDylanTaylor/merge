import SystemIcon, { systemLabel } from "@/components/SystemIcon";
import type { System } from "@/types/changeset";
import Reveal from "./Reveal";

const CARDS: { system: System; op: "+" | "~" | "-"; example: string }[] = [
  { system: "linear", op: "+", example: "Close ENG-482, move PROJ-204 to Shipped" },
  { system: "gmail", op: "+", example: "Email 312 customers a launch announcement" },
  { system: "slack", op: "+", example: "Post an outage update to #incidents" },
  { system: "stripe", op: "~", example: "Refund $2,400 across 3 duplicate charges" },
  { system: "crm", op: "+", example: "Advance 18 deals from $500 → $1,500/mo" },
  { system: "permissions", op: "~", example: "Grant scoped admin to a new engineer" },
];

export default function SystemsBento() {
  return (
    <section id="systems" className="relative scroll-mt-24">
      <div className="mx-auto max-w-content px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Reveal className="mx-auto max-w-[680px] text-center">
          <p className="eyebrow">Surface area</p>
          <h2 className="mt-4 text-h1 font-semibold text-text">One diff. Every system.</h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            A single changeset spans the tools that run your company. Here is
            what one hunk looks like in each.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c, i) => {
            const opColor =
              c.op === "+" ? "var(--safe)" : c.op === "-" ? "var(--danger)" : "var(--review)";
            return (
              <Reveal key={c.system} delay={(i % 3) * 0.06}>
                <div className="card card-hover group h-full p-5">
                  <div className="flex items-center justify-between">
                    <SystemIcon system={c.system} size={34} />
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                      {systemLabel(c.system)}
                    </span>
                  </div>
                  <div className="mt-5 flex items-start gap-2 font-mono text-[13px] leading-relaxed">
                    <span className="mt-px shrink-0 font-semibold" style={{ color: opColor }}>
                      {c.op}
                    </span>
                    <span className="text-text-2">{c.example}</span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import Reveal from "./Reveal";

const BLIND_CALLS = [
  "stripe.refunds.create({ amount: 240000 })",
  "gmail.send({ to: 312 recipients })",
  "linear.issue.update({ state: done })",
  "slack.postMessage({ channel: #general })",
  "permissions.grant({ scope: admin })",
];

export default function Problem() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-content px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <Reveal>
            <p className="eyebrow">The gap</p>
            <h2 className="mt-4 text-h1 font-semibold text-text">
              Agents can act. Approval can&apos;t keep up.
            </h2>
            <p className="mt-5 max-w-[520px] text-[16px] leading-relaxed text-muted">
              Today an agent either asks permission for every click — or runs
              wild and you find out afterward. There&apos;s no diff. No partial
              approval. No undo.
            </p>
            <p className="mt-4 max-w-[520px] text-[16px] leading-relaxed text-muted">
              Real systems, real money, no review layer. So you rubber-stamp a
              wall of tool-calls, or you babysit every one. Neither scales past
              a demo.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between px-1 pb-3">
                <span className="font-mono text-[11.5px] text-muted">
                  agent · 5 tool-calls fired
                </span>
                <span className="font-mono text-[11px] text-danger">no review</span>
              </div>
              <div className="space-y-2">
                {BLIND_CALLS.map((c) => (
                  <div
                    key={c}
                    className="flex items-center gap-3 rounded-lg border border-border bg-bg-subtle px-3 py-2.5"
                  >
                    <span
                      className="grid h-5 w-5 shrink-0 place-items-center rounded-full border font-mono text-[11px] font-semibold"
                      style={{
                        color: "var(--danger)",
                        borderColor: "color-mix(in srgb, var(--danger) 45%, transparent)",
                        background: "color-mix(in srgb, var(--danger) 10%, transparent)",
                      }}
                      aria-hidden
                    >
                      ?
                    </span>
                    <code className="truncate font-mono text-[12px] text-text-2">{c}</code>
                  </div>
                ))}
              </div>
              <p className="mt-3 px-1 font-mono text-[11px] text-faint">
                // executed. no diff, no partial approval, no rollback.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

import type { ReactNode } from "react";
import SystemIcon from "@/components/SystemIcon";
import Reveal from "./Reveal";

/* ---- mini mocks ---------------------------------------------------------- */

function PartialMergeMock() {
  const rows = [
    { system: "slack" as const, label: "Post release notes to #launch", state: "approved" as const },
    { system: "linear" as const, label: "Move PROJ-204 to Shipped", state: "approved" as const },
    { system: "permissions" as const, label: "Grant admin to contractor@ext", state: "rejected" as const },
  ];
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="px-1 pb-3 font-mono text-[11.5px] text-muted">Merge 2 of 3 hunks</p>
      <div className="space-y-2">
        {rows.map((r) => {
          const approved = r.state === "approved";
          const rail = approved ? "var(--safe)" : "var(--danger)";
          return (
            <div
              key={r.label}
              className="relative flex items-center gap-3 overflow-hidden rounded-lg border border-border bg-bg-subtle px-3 py-2.5"
              style={{ opacity: approved ? 1 : 0.6 }}
            >
              <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: rail }} aria-hidden />
              <span
                className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border font-mono text-[11px] font-bold"
                style={
                  approved
                    ? { color: "#fff", borderColor: "var(--safe)", background: "var(--safe)" }
                    : { color: "var(--danger)", borderColor: "color-mix(in srgb, var(--danger) 55%, transparent)" }
                }
                aria-hidden
              >
                {approved ? "✓" : "✕"}
              </span>
              <SystemIcon system={r.system} size={20} />
              <span
                className={`truncate text-[13px] ${approved ? "text-text" : "text-muted line-through"}`}
              >
                {r.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExecuteRevertMock() {
  const steps = [
    { system: "slack" as const, text: "Message sent to #incidents", id: "ts_1718…" },
    { system: "linear" as const, text: "ENG-482 moved to Done", id: "ENG-482" },
    { system: "gmail" as const, text: "Emailed 3 customers", id: "re_9f2…" },
  ];
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between px-1 pb-3">
        <span className="font-mono text-[11.5px] text-safe">● Executed · live</span>
        <span className="rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-text-2">
          Revert ↺
        </span>
      </div>
      <div className="space-y-2">
        {steps.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-bg-subtle px-3 py-2.5"
          >
            <SystemIcon system={s.system} size={20} />
            <span className="truncate text-[13px] text-text">{s.text}</span>
            <span className="ml-auto shrink-0 font-mono text-[11px] text-faint">{s.id}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 px-1 font-mono text-[11px] text-faint">
        // one click replays every step in reverse.
      </p>
    </div>
  );
}

function LandmineMock() {
  return (
    <div className="rounded-xl border bg-surface p-4" style={{ borderColor: "color-mix(in srgb, var(--danger) 40%, var(--border))" }}>
      <div className="relative overflow-hidden rounded-lg border border-border bg-bg-subtle p-4">
        <span className="absolute inset-y-0 left-0 w-[3px] bg-review" aria-hidden />
        <div className="flex items-center gap-2.5">
          <SystemIcon system="linear" size={22} />
          <span className="text-[13.5px] font-medium text-text">
            Publish “SOC 2 certified” to the pricing page
          </span>
        </div>
        <div
          className="mt-3 rounded-lg border p-3"
          style={{
            borderColor: "color-mix(in srgb, var(--danger) 45%, transparent)",
            background: "color-mix(in srgb, var(--danger) 8%, transparent)",
          }}
        >
          <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-danger">
            ⚠ Landmine
          </div>
          <p className="mt-1.5 text-[13px] leading-snug text-text">
            Claims “SOC 2 certified” — the company holds no active SOC 2 report.
          </p>
          <p className="mt-2 border-l-2 pl-2.5 text-[12px] leading-snug text-muted" style={{ borderColor: "color-mix(in srgb, var(--danger) 40%, transparent)" }}>
            <span className="font-mono uppercase tracking-wider text-muted/80">Evidence&nbsp;</span>
            compliance/soc2.status = none
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---- feature row --------------------------------------------------------- */

type Primitive = {
  eyebrow: string;
  accent?: boolean;
  title: string;
  body: string;
  mock: ReactNode;
  wide?: boolean;
};

const PRIMITIVES: Primitive[] = [
  {
    eyebrow: "Primitive 01",
    title: "Approve line by line, not all or nothing.",
    body: "A changeset is made of hunks. Check the ones you trust, reject the rest, merge the subset. The agent's plan bends to your judgment — not the reverse.",
    mock: <PartialMergeMock />,
  },
  {
    eyebrow: "Primitive 02",
    title: "Merge fires real side effects. Revert takes them back.",
    body: "Hit Merge and the Slack message sends, the Linear issue moves, the refund posts — live. Change your mind? Revert replays every step in reverse.",
    mock: <ExecuteRevertMock />,
  },
  {
    eyebrow: "Primitive 03",
    accent: true,
    title: "It flags the hunks that would burn you.",
    body: "Merge inspects every changeset for false compliance claims, over-scoped permission grants, and over-budget purchases — and marks them, in plain English, before you approve.",
    mock: <LandmineMock />,
    wide: true,
  },
];

export default function Primitives() {
  return (
    <section id="primitives" className="relative scroll-mt-24">
      <div className="mx-auto max-w-content px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Reveal className="mx-auto max-w-[680px] text-center">
          <p className="eyebrow">The primitives</p>
          <h2 className="mt-4 text-h1 font-semibold text-text">
            Three moves between an agent and reality.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            Partial-hunk merge, real execution with revert, and a landmine
            detector — the review layer autonomous action was missing.
          </p>
        </Reveal>

        <div className={`mt-16 space-y-16 md:space-y-24`}>
          {PRIMITIVES.map((p, i) => {
            const textFirst = i % 2 === 0;
            return (
              <div
                key={p.eyebrow}
                className={`grid items-center gap-10 md:gap-14 ${p.wide ? "md:py-4" : ""} md:grid-cols-2`}
              >
                <Reveal className={textFirst ? "md:order-1" : "md:order-2"}>
                  <p className="eyebrow" style={p.accent ? { color: "var(--accent)" } : undefined}>
                    {p.eyebrow}
                  </p>
                  <h3 className="mt-3 max-w-[440px] text-h2 font-semibold text-text">{p.title}</h3>
                  <p className="mt-4 max-w-[480px] text-[16px] leading-relaxed text-muted">{p.body}</p>
                </Reveal>
                <Reveal delay={0.08} className={textFirst ? "md:order-2" : "md:order-1"}>
                  {p.mock}
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

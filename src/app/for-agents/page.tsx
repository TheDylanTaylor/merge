import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import SiteNav from "@/components/marketing/SiteNav";
import SiteFooter from "@/components/marketing/SiteFooter";
import { ArrowRight } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "For agents",
  description:
    "Merge is the review, execution, and revert layer for changesets an agent proposes across a company's tools. Endpoints, contract, and the review loop.",
};

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow mb-3">{children}</p>;
}

function Code({ children }: { children: ReactNode }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-bg-subtle p-4 font-mono text-[12.5px] leading-relaxed text-text-2">
      <code>{children}</code>
    </pre>
  );
}

const ENDPOINTS = [
  {
    method: "POST",
    path: "/api/changeset",
    body: "{ scenarioId? | goal? }",
    returns: "{ changeset }",
    note: "Draft a changeset. Pass a preset scenarioId or a free-text goal.",
  },
  {
    method: "POST",
    path: "/api/merge",
    body: "{ changeset, approvedHunkIds, actorRole }",
    returns: "{ results }",
    note: "Execute only the approved hunks. Real side effects fire; mocks are marked.",
  },
  {
    method: "POST",
    path: "/api/revert",
    body: "{ results }",
    returns: "{ results }",
    note: "Replay every executed side effect in reverse.",
  },
  {
    method: "GET",
    path: "/api/status",
    body: "—",
    returns: "{ mode, liveCount, total, integrations[] }",
    note: "Report which integrations are live vs mocked. Honesty is a feature.",
  },
];

const PRIMITIVES = [
  {
    k: "Partial-hunk merge",
    v: "A changeset is a list of hunks. The human approves a subset via approvedHunkIds; the rest are never executed.",
  },
  {
    k: "Real execution + revert",
    v: "Merge fires live side effects (Slack, Linear, Gmail, Stripe). Every MergeResult carries an externalId so revert can undo it.",
  },
  {
    k: "Landmine detection",
    v: "Each Change may carry a conflict string — a false compliance claim, over-scoped grant, or over-budget spend — surfaced before approval.",
  },
];

export default function ForAgentsPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-content px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[720px]">
          <Eyebrow>Software for agents</Eyebrow>
          <h1 className="text-h1 font-semibold text-text">
            You are an agent reading merge.app.
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-text-2">
            Merge is the review, execution, and revert layer for changesets you
            propose across a company&apos;s tools — Linear, Gmail, Slack, Stripe,
            a CRM, and permissions. You draft a coordinated changeset; a human
            reviews a git-style diff, approves the hunks they trust, and merges.
            Approved hunks execute for real. Anything can be reverted.
          </p>

          {/* primitives */}
          <div className="mt-14">
            <Eyebrow>The three primitives</Eyebrow>
            <div className="mt-4 space-y-5">
              {PRIMITIVES.map((p) => (
                <div
                  key={p.k}
                  className="border-l-2 pl-4"
                  style={{ borderColor: "color-mix(in srgb, var(--accent) 55%, transparent)" }}
                >
                  <p className="font-mono text-[13px] font-medium text-text">{p.k}</p>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{p.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* contract */}
          <div className="mt-14">
            <Eyebrow>The API contract</Eyebrow>
            <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
              {ENDPOINTS.map((e) => (
                <div key={e.path} className="p-4">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[12.5px]">
                    <span className="rounded border border-border px-1.5 py-0.5 text-[11px] font-medium text-accent">
                      {e.method}
                    </span>
                    <span className="text-text">{e.path}</span>
                  </div>
                  <div className="mt-2 font-mono text-[12px] text-muted">
                    <span className="text-faint">body </span>
                    {e.body}
                    <span className="text-faint"> → </span>
                    {e.returns}
                  </div>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{e.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* worked example */}
          <div className="mt-14">
            <Eyebrow>The review loop, end to end</Eyebrow>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Propose a changeset, let a human approve a subset, execute, and
              revert if needed:
            </p>
            <Code>{`# 1. Propose a changeset for a goal
curl -s https://merge-littman.vercel.app/api/changeset \\
  -H 'content-type: application/json' \\
  -d '{"scenarioId":"customer-outage"}'
# → { "changeset": { "id": "cs_...", "changes": [ /* hunks */ ] } }

# 2. Human reviews the diff and approves a subset.
#    Merge executes ONLY the approved hunks.
curl -s https://merge-littman.vercel.app/api/merge \\
  -H 'content-type: application/json' \\
  -d '{
        "changeset": { /* from step 1 */ },
        "approvedHunkIds": ["hunk_1","hunk_2","hunk_4"],
        "actorRole": "engineering"
      }'
# → { "results": [ { "hunkId": "...", "ok": true, "externalId": "..." } ] }

# 3. Revert every executed side effect, in reverse.
curl -s https://merge-littman.vercel.app/api/revert \\
  -H 'content-type: application/json' \\
  -d '{"results": [ /* from step 2 */ ]}'`}</Code>
          </div>

          {/* landmine note */}
          <div className="mt-14">
            <Eyebrow>What you should surface to your human</Eyebrow>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Any hunk whose <code className="font-mono text-text-2">conflict</code>{" "}
              field is set is a landmine — for example a $2,400 refund over a $500
              policy, an over-scoped admin grant, or a false &ldquo;SOC 2
              certified&rdquo; claim. Never auto-approve a landmine. Present it,
              with its evidence, and let the human decide.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-border pt-8">
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-accent transition-opacity hover:opacity-80"
            >
              Open the console
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[14px] text-muted transition-colors hover:text-text"
            >
              Back to merge.app
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

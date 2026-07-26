"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ComponentType, SVGProps } from "react";
import type { System } from "@/types/changeset";
import SystemIcon from "@/components/SystemIcon";
import { LiveBadge } from "@/components/ui/Badge";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ---- status contract (from GET /api/status) --------------------------------
export type StatusIntegration = {
  id: string;
  name: string;
  category: string;
  live: boolean;
  detail: string;
};

// ---- enrichment metadata (static, keyed by integration id) -----------------
// Sourced from RESEARCH-apis.md. Env var names match src/lib/env.ts exactly.
type EnvVar = { name: string; optional?: boolean };
export type IntegrationMeta = {
  blurb: string; // what it does in Merge, one line
  env: EnvVar[]; // exact env vars from code
  where: { label: string; url: string }; // where to get the key
  revert: string; // revert behavior
  gotcha: string; // the one thing that trips people up
};

export const INTEGRATION_META: Record<string, IntegrationMeta> = {
  anthropic: {
    blurb:
      "Turns a plain-language goal into a coordinated diff — 7-9 hunks across your tools, with conflicts flagged.",
    env: [{ name: "ANTHROPIC_API_KEY" }, { name: "ANTHROPIC_MODEL", optional: true }],
    where: { label: "console.anthropic.com", url: "https://console.anthropic.com" },
    revert: "N/A — generation only. No external artifact is created.",
    gotcha:
      "Preset scenarios always use seeded output; live generation fires only for a free-text goal.",
  },
  resend: {
    blurb: "Sends the launch and customer announcement emails for email hunks.",
    env: [{ name: "RESEND_API_KEY" }, { name: "DEMO_EMAIL_TO" }],
    where: { label: "resend.com/api-keys", url: "https://resend.com/api-keys" },
    revert:
      "Can't unsend — a follow-up “[Reverted] please disregard” notice is sent instead.",
    gotcha:
      "With the default onboarding@resend.dev sender, delivery is forced to DEMO_EMAIL_TO until you verify a domain.",
  },
  linear: {
    blurb: "Creates and archives the launch or incident issue for Linear hunks.",
    env: [{ name: "LINEAR_API_KEY" }, { name: "LINEAR_TEAM_ID" }],
    where: {
      label: "Linear → Settings → API",
      url: "https://linear.app/settings/api",
    },
    revert: "Archives the created issue (soft, restorable) — not a hard delete.",
    gotcha:
      "The API key is sent with no “Bearer” prefix; both key and team id are required.",
  },
  slack: {
    blurb: "Posts and deletes the launch, status, and war-room messages for Slack hunks.",
    env: [{ name: "SLACK_BOT_TOKEN" }, { name: "SLACK_CHANNEL_ID" }, { name: "SLACK_WEBHOOK_URL", optional: true }],
    where: { label: "api.slack.com/apps", url: "https://api.slack.com/apps" },
    revert: "Deletes the posted message via chat.delete (webhook posts can't be reverted).",
    gotcha:
      "Invite the bot to the channel (/invite) or chat.postMessage returns not_in_channel.",
  },
  channel3: {
    blurb: "Finds a cheaper equivalent product for shopping hunks.",
    env: [{ name: "CHANNEL3_API_KEY" }],
    where: { label: "trychannel3.com", url: "https://trychannel3.com" },
    revert: "None — nothing external to undo.",
    gotcha:
      "Wired but unreachable — no changeset path emits a shopping hunk today, so a key changes nothing observable.",
  },
  crustdata: {
    blurb: "Enriches company copy with headcount and funding context.",
    env: [{ name: "CRUSTDATA_TOKEN" }],
    where: { label: "crustdata.com", url: "https://crustdata.com" },
    revert: "N/A — read-only enrichment.",
    gotcha:
      "Dead code today — enrichCompany is never called, and it uses the legacy Token auth scheme.",
  },
  hexclave: {
    blurb:
      "Auth, server-side approval RBAC, and an encrypted Data Vault for your execution keys.",
    env: [
      { name: "NEXT_PUBLIC_STACK_PROJECT_ID" },
      { name: "NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY" },
      { name: "STACK_SECRET_SERVER_KEY" },
      { name: "STACK_DATA_VAULT_SECRET", optional: true },
    ],
    where: { label: "app.stack-auth.com", url: "https://app.stack-auth.com" },
    revert: "N/A — auth and RBAC layer.",
    gotcha:
      "Needs all three keys and a signed-in user for real enforcement; otherwise the local role policy applies.",
  },
};

// ---- logo tiles ------------------------------------------------------------
type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

const svgBase: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const Spark: Glyph = (p) => (
  <svg {...svgBase} {...p}>
    <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5 4.2 16.5" />
  </svg>
);

const Bars: Glyph = (p) => (
  <svg {...svgBase} {...p}>
    <path d="M4 20h16M7 20v-6M12 20V8M17 20v-9" />
  </svg>
);

const Shield: Glyph = (p) => (
  <svg {...svgBase} {...p}>
    <path d="M12 3 19 6v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3Z" />
    <path d="M9.2 12.2 11 14l3.8-3.8" />
  </svg>
);

const ACCENT = "#8b7cf6";
const CUSTOM_LOGO: Record<string, { glyph: Glyph; tint: string }> = {
  anthropic: { glyph: Spark, tint: ACCENT },
  crustdata: { glyph: Bars, tint: ACCENT },
  hexclave: { glyph: Shield, tint: ACCENT },
};
const SYSTEM_LOGO: Record<string, System> = {
  resend: "gmail",
  linear: "linear",
  slack: "slack",
  channel3: "shopping",
};

function LogoTile({ id, size = 38 }: { id: string; size?: number }) {
  const system = SYSTEM_LOGO[id];
  if (system) return <SystemIcon system={system} size={size} />;
  const custom = CUSTOM_LOGO[id] ?? { glyph: Spark, tint: ACCENT };
  const { glyph: G, tint } = custom;
  const inner = Math.round(size * 0.56);
  return (
    <span
      className="grid shrink-0 place-items-center rounded-[9px] border"
      style={{
        width: size,
        height: size,
        color: tint,
        borderColor: `color-mix(in srgb, ${tint} 30%, transparent)`,
        background: `color-mix(in srgb, ${tint} 11%, transparent)`,
      }}
    >
      <G width={inner} height={inner} />
    </span>
  );
}

function EnvChip({ name, optional }: EnvVar) {
  return (
    <code
      className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] leading-none text-text-2"
      title={optional ? "Optional" : "Required"}
    >
      {name}
      {optional && (
        <span className="text-[9.5px] uppercase tracking-[0.08em] text-faint">opt</span>
      )}
    </code>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 160ms" }}
    >
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalArrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function IntegrationCard({
  integration,
  index = 0,
}: {
  integration: StatusIntegration;
  index?: number;
}) {
  const [open, setOpen] = useState(false);
  const meta = INTEGRATION_META[integration.id];

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: integration.live ? 1 : 0.92, y: 0 }}
      transition={{ duration: 0.26, ease: EASE, delay: Math.min(index * 0.04, 0.24) }}
      className="card card-hover flex flex-col p-[18px]"
    >
      {/* header */}
      <div className="flex items-start gap-3">
        <LogoTile id={integration.id} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold leading-tight text-text">
            {integration.name}
          </h3>
          <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">
            {integration.category}
          </p>
        </div>
        <LiveBadge live={integration.live} />
      </div>

      {/* what it does in Merge */}
      {meta && (
        <p className="mt-3 text-[13px] leading-relaxed text-muted">{meta.blurb}</p>
      )}

      {/* honest runtime state, straight from /api/status */}
      <div className="mt-2.5 flex items-start gap-1.5 font-mono text-[11px] leading-snug">
        <span
          className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: integration.live ? "var(--safe)" : "var(--faint)" }}
          aria-hidden
        />
        <span className="text-faint">{integration.detail}</span>
      </div>

      {/* env vars */}
      {meta && (
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {meta.env.map((e) => (
            <EnvChip key={e.name} {...e} />
          ))}
        </div>
      )}

      {/* setup disclosure */}
      {meta && (
        <div className="mt-4 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex w-full items-center justify-between text-left font-mono text-[11px] uppercase tracking-[0.1em] text-muted transition-colors hover:text-text"
          >
            <span>{integration.live ? "Configuration" : "How to enable"}</span>
            <Chevron open={open} />
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="overflow-hidden"
              >
                <dl className="mt-3 space-y-2.5 text-[12px] leading-relaxed">
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                      Where to get it
                    </dt>
                    <dd className="mt-1">
                      <a
                        href={meta.where.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-accent transition-opacity hover:opacity-80"
                      >
                        {meta.where.label}
                        <ExternalArrow />
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                      Revert
                    </dt>
                    <dd className="mt-1 text-muted">{meta.revert}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                      Gotcha
                    </dt>
                    <dd className="mt-1 text-muted">{meta.gotcha}</dd>
                  </div>
                </dl>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.article>
  );
}

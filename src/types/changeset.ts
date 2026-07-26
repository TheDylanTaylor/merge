// ============================================================================
// Merge — SHARED CONTRACT
// Every module (backend generator, execution/API, frontend UI) codes against
// these types. Do not change a field without telling the other builder.
// ============================================================================

export type System =
  | "linear"
  | "gmail"
  | "slack"
  | "stripe"
  | "permissions"
  | "crm"
  | "shopping";

/** green = safe, amber = needs review, red = danger/landmine */
export type Risk = "safe" | "review" | "danger";

export type Role = "ceo" | "finance" | "legal" | "engineering" | "marketing";

export type HunkStatus = "pending" | "approved" | "rejected";

/** How Merge actually performs a hunk. `noop` = seeded/mock system (animates only). */
export type ExecutionSpec =
  | { kind: "email"; to: string; subject: string; html: string }
  | { kind: "linear"; title: string; description: string }
  | { kind: "slack"; text: string }
  | { kind: "shopping"; query: string; maxPrice?: number } // Channel3
  | { kind: "noop"; note: string }; // stripe / crm / permissions

/** One hunk — a single proposed change to one system. */
export interface Change {
  id: string;
  system: System;
  title: string; // "Email launch announcement to 312 customers"
  before: string; // human-readable current state
  after: string; // human-readable proposed state
  risk: Risk;
  requiredRole: Role; // who may approve (Hexclave RBAC)
  conflict?: string | null; // landmine reason, e.g. "Claims 'SOC 2 certified' — company is NOT certified"
  evidence?: string | null; // supporting citation from company state
  execution: ExecutionSpec;
  status: HunkStatus; // starts "pending"
}

export interface Changeset {
  id: string;
  goal: string; // "Launch our enterprise plan Monday"
  summary: string; // one-line agent summary
  changes: Change[];
  createdAt: string; // ISO string
}

/** Result of executing (or reverting) one hunk. externalId is used for Revert. */
export interface MergeResult {
  hunkId: string;
  system: System;
  ok: boolean;
  mocked: boolean; // true when the adapter simulated because no API key was present
  externalId?: string; // linear issue id / slack ts / resend id
  externalUrl?: string; // deep link to the created artifact
  detail?: string; // human-readable outcome, e.g. "Emailed hyperr.ware@gmail.com"
  error?: string;
}

// ---------------------------------------------------------------------------
// Scenario presets — shared by the goal screen (FE) and the generator (BE).
// ---------------------------------------------------------------------------

export type ScenarioId =
  | "launch-enterprise"
  | "onboard-hire"
  | "customer-outage";

export interface ScenarioPreset {
  id: ScenarioId;
  label: string;
  goal: string;
  blurb: string;
}

export const SCENARIOS: ScenarioPreset[] = [
  {
    id: "launch-enterprise",
    label: "Launch enterprise plan",
    goal: "Launch our enterprise plan next Monday.",
    blurb: "Pricing, launch project, customer announcement, calendar, permissions.",
  },
  {
    id: "onboard-hire",
    label: "Onboard new hire",
    goal: "Onboard our new engineer, Maya, starting Monday.",
    blurb: "Accounts, access, welcome message, first-week plan, equipment.",
  },
  {
    id: "customer-outage",
    label: "Respond to customer outage",
    goal: "Respond to the production outage affecting Acme Corp.",
    blurb: "Incident ticket, status post, customer email, war-room, postmortem.",
  },
];

/** Risk display metadata — optional helper for the UI. */
export const RISK_META: Record<
  Risk,
  { label: string; sign: string; color: string }
> = {
  safe: { label: "Safe", sign: "+", color: "var(--safe)" },
  review: { label: "Review", sign: "~", color: "var(--review)" },
  danger: { label: "Danger", sign: "!", color: "var(--danger)" },
};

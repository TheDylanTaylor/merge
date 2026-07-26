// ============================================================================
// Merge — CHANGESET GENERATOR
// Turns a natural-language goal into a coordinated `Changeset`.
//
// Three code paths, in priority order:
//   1. Preset match (scenarioId) -> deep-clone a seeded changeset (demo-safe).
//   2. Live: Anthropic tool-use call producing a coordinated changeset that
//      FLAGS conflicts (stale claims, over-scoped perms, over-budget, clashes).
//   3. Fallback: clone the launch-enterprise changeset with the caller's goal.
//
// This function NEVER throws — it always returns a valid Changeset.
// ============================================================================

import type {
  Changeset,
  Change,
  ExecutionSpec,
  HunkStatus,
  Risk,
  Role,
  ScenarioId,
  System,
} from "@/types/changeset";
import { env } from "@/lib/env";
import { getAnthropic } from "@/lib/anthropic";
import { SCENARIO_CHANGESETS } from "@/data/scenarios";
import companyState from "@/data/companyState.json";

// ---------------------------------------------------------------------------
// Enum guards used when coercing loose model output.
// ---------------------------------------------------------------------------

const SYSTEMS: System[] = [
  "linear",
  "gmail",
  "slack",
  "stripe",
  "permissions",
  "crm",
  "shopping",
];
const RISKS: Risk[] = ["safe", "review", "danger"];
const ROLES: Role[] = ["ceo", "finance", "legal", "engineering", "marketing"];
const EXEC_KINDS = ["email", "linear", "slack", "shopping", "noop"] as const;

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function newId(): string {
  return `cs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// ---------------------------------------------------------------------------
// Coercion — turn an untyped tool-use payload into a valid Changeset.
// ---------------------------------------------------------------------------

function coerceExecution(raw: unknown): ExecutionSpec {
  const r = (raw ?? {}) as Record<string, unknown>;
  const kind = oneOf(r.kind, EXEC_KINDS, "noop");
  switch (kind) {
    case "email":
      return {
        kind: "email",
        to: String(r.to ?? env.demoEmailTo),
        subject: String(r.subject ?? "(no subject)"),
        html: String(r.html ?? ""),
      };
    case "linear":
      return {
        kind: "linear",
        title: String(r.title ?? "Untitled"),
        description: String(r.description ?? ""),
      };
    case "slack":
      return { kind: "slack", text: String(r.text ?? "") };
    case "shopping":
      return {
        kind: "shopping",
        query: String(r.query ?? ""),
        ...(typeof r.maxPrice === "number" ? { maxPrice: r.maxPrice } : {}),
      };
    case "noop":
    default:
      return {
        kind: "noop",
        note: String(r.note ?? "Simulated change (no external side-effect)."),
      };
  }
}

function coerceChange(raw: unknown, index: number): Change {
  const r = (raw ?? {}) as Record<string, unknown>;
  const conflict =
    typeof r.conflict === "string" && r.conflict.trim().length > 0
      ? r.conflict
      : null;
  const evidence =
    typeof r.evidence === "string" && r.evidence.trim().length > 0
      ? r.evidence
      : null;
  return {
    id: typeof r.id === "string" && r.id.trim().length > 0 ? r.id : `hunk-${index + 1}`,
    system: oneOf(r.system, SYSTEMS, "crm"),
    title: String(r.title ?? `Change ${index + 1}`),
    before: String(r.before ?? ""),
    after: String(r.after ?? ""),
    risk: oneOf(r.risk, RISKS, "review"),
    requiredRole: oneOf(r.requiredRole, ROLES, "engineering"),
    conflict,
    evidence,
    execution: coerceExecution(r.execution),
    status: "pending" as HunkStatus,
  };
}

function coerceChangeset(raw: unknown, goal: string): Changeset {
  const r = (raw ?? {}) as Record<string, unknown>;
  const rawChanges = Array.isArray(r.changes) ? r.changes : [];
  const changes = rawChanges.map((c, i) => coerceChange(c, i));
  return {
    id: newId(),
    goal,
    summary: String(r.summary ?? `Coordinated plan for: ${goal}`),
    changes,
    createdAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Fallback — a cloned launch-enterprise changeset with the caller's goal.
// ---------------------------------------------------------------------------

function fallbackChangeset(goal: string): Changeset {
  const clone = deepClone(SCENARIO_CHANGESETS["launch-enterprise"]);
  clone.id = newId();
  clone.goal = goal;
  clone.createdAt = new Date().toISOString();
  clone.changes.forEach((c) => (c.status = "pending"));
  return clone;
}

// ---------------------------------------------------------------------------
// Live generation via Anthropic tool-use.
// ---------------------------------------------------------------------------

const EMIT_CHANGESET_TOOL = {
  name: "emit_changeset",
  description:
    "Emit a coordinated changeset that accomplishes the goal across the company's systems, flagging any conflicts as danger.",
  input_schema: {
    type: "object" as const,
    properties: {
      summary: { type: "string", description: "One-line summary of the plan." },
      changes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            system: { type: "string", enum: SYSTEMS },
            title: { type: "string" },
            before: { type: "string", description: "Human-readable current state." },
            after: { type: "string", description: "Human-readable proposed state." },
            risk: {
              type: "string",
              enum: RISKS,
              description:
                "safe = no concerns; review = needs a human sign-off; danger = a real conflict/landmine.",
            },
            requiredRole: { type: "string", enum: ROLES },
            conflict: {
              type: ["string", "null"],
              description:
                "If risk is danger, WHY it is blocked (stale claim, over-scoped permission, over-budget, calendar clash).",
            },
            evidence: {
              type: ["string", "null"],
              description: "Supporting citation from the company state.",
            },
            execution: {
              type: "object",
              properties: {
                kind: { type: "string", enum: EXEC_KINDS },
                to: { type: "string" },
                subject: { type: "string" },
                html: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                text: { type: "string" },
                query: { type: "string" },
                maxPrice: { type: "number" },
                note: { type: "string" },
              },
              required: ["kind"],
            },
          },
          required: [
            "system",
            "title",
            "before",
            "after",
            "risk",
            "requiredRole",
            "execution",
          ],
        },
      },
    },
    required: ["summary", "changes"],
  },
};

function systemPrompt(): string {
  const compact = JSON.stringify(companyState);
  return [
    "You are Merge, an operations agent that turns a goal into a coordinated changeset across a startup's systems (linear, gmail, slack, stripe, permissions, crm, shopping).",
    "Produce 7-9 hunks spanning multiple systems, each with realistic before/after state, the correct requiredRole, and a proper execution spec.",
    "For real execution include at most one email (kind:email with to/subject/html), one linear (kind:linear with title/description), and one slack (kind:slack with text). Everything else uses kind:noop with a helpful note.",
    "CRITICAL: audit every hunk against the company state below and FLAG conflicts as risk:\"danger\" with a non-null `conflict` and `evidence`. Conflicts to catch include: stale or unapproved marketing claims (e.g. SOC 2 / HIPAA when not certified), over-scoped permission grants (violating least-privilege), over-budget or out-of-contract pricing/credits, and calendar clashes.",
    "Never invent capabilities the company does not have. Only cite facts present in the company state.",
    `COMPANY STATE (JSON): ${compact}`,
  ].join("\n\n");
}

async function liveChangeset(goal: string): Promise<Changeset> {
  const client = getAnthropic();
  if (!client) return fallbackChangeset(goal);

  const response = await client.messages.create({
    model: env.anthropicModel,
    max_tokens: 2500,
    system: systemPrompt(),
    tools: [EMIT_CHANGESET_TOOL],
    tool_choice: { type: "tool", name: "emit_changeset" },
    messages: [
      {
        role: "user",
        content: `Goal: ${goal}\n\nEmit the coordinated changeset now, flagging any conflicts as danger.`,
      },
    ],
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") return fallbackChangeset(goal);

  const changeset = coerceChangeset(toolUse.input, goal);
  if (changeset.changes.length === 0) return fallbackChangeset(goal);
  return changeset;
}

// ---------------------------------------------------------------------------
// Public entry point.
// ---------------------------------------------------------------------------

export async function generateChangeset(input: {
  goal: string;
  scenarioId?: ScenarioId;
}): Promise<Changeset> {
  const goal = (input.goal ?? "").trim();

  try {
    // 1) Preset path — demo-safe deterministic clone.
    if (input.scenarioId && SCENARIO_CHANGESETS[input.scenarioId]) {
      const preset = deepClone(SCENARIO_CHANGESETS[input.scenarioId]);
      preset.id = newId();
      preset.createdAt = new Date().toISOString();
      preset.goal = goal.length > 0 ? goal : preset.goal;
      preset.changes.forEach((c) => (c.status = "pending"));
      return preset;
    }

    // 2) Live path — Anthropic tool-use (falls back internally if no key).
    if (getAnthropic()) {
      return await liveChangeset(goal || "Coordinate a company operation.");
    }

    // 3) No key + no preset -> fallback clone.
    return fallbackChangeset(goal || SCENARIO_CHANGESETS["launch-enterprise"].goal);
  } catch {
    // Never throw — always return a valid Changeset.
    return fallbackChangeset(goal || SCENARIO_CHANGESETS["launch-enterprise"].goal);
  }
}

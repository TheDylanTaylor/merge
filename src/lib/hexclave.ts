// ============================================================================
// Merge — HEXCLAVE (Stack Auth) INTEGRATION  ·  GATED + NULL-SAFE
// ----------------------------------------------------------------------------
// The app runs 100% keyless in mock mode. Adding Hexclave keys activates,
// with ZERO changes elsewhere:
//   • Auth        — hosted sign-in via the /handler/[...stack] route + provider
//   • RBAC        — server-side enforcement of hunk approvals (user.hasPermission)
//   • Data Vault  — a secret store for the agent's execution keys
//
// `@stackframe/stack` is the SDK the Hexclave dashboard issues keys for; it
// re-exports the same classes under `Hexclave*` aliases (they are 1:1).
//
// Nothing here throws on missing keys — every helper degrades to the tested
// local policy / env path. `stackServerApp` is null until keys are present.
// ============================================================================

import "server-only";
import { StackServerApp } from "@stackframe/stack";
import { canApprove } from "@/lib/permissions";
import type { Change, Role } from "@/types/changeset";

function pick(...names: string[]): string | undefined {
  for (const n of names) {
    const v = process.env[n];
    if (v && v.trim().length > 0) return v.trim();
  }
  return undefined;
}

// Accept either the Hexclave-branded or the underlying Stack Auth env names,
// so whichever the dashboard hands out just works.
const projectId = pick(
  "NEXT_PUBLIC_HEXCLAVE_PROJECT_ID",
  "NEXT_PUBLIC_STACK_PROJECT_ID"
);
const publishableClientKey = pick(
  "NEXT_PUBLIC_HEXCLAVE_PUBLISHABLE_CLIENT_KEY",
  "NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY"
);
const secretServerKey = pick(
  "HEXCLAVE_SECRET_SERVER_KEY",
  "STACK_SECRET_SERVER_KEY"
);
const vaultSecret = pick(
  "HEXCLAVE_DATA_VAULT_SECRET",
  "STACK_DATA_VAULT_SECRET"
);

/** True only when all three core Hexclave keys are present. */
export const hexclaveConfigured = Boolean(
  projectId && publishableClientKey && secretServerKey
);

/** The server app, or null when Hexclave is not configured (keyless mode). */
export const stackServerApp: StackServerApp<true> | null = (() => {
  if (!hexclaveConfigured) return null;
  try {
    return new StackServerApp({
      tokenStore: "nextjs-cookie",
      projectId,
      publishableClientKey,
      secretServerKey,
    });
  } catch {
    return null;
  }
})();

export interface ApprovalDecision {
  allowed: boolean;
  enforcedBy: "hexclave" | "policy";
  reason?: string;
}

/**
 * Permission id convention: `approve_<role>` (e.g. approve_finance).
 * Define these in the Hexclave dashboard and grant them to the matching users.
 */
function permIdFor(change: Change): string {
  return `approve_${change.requiredRole}`;
}

/**
 * Decide whether an approval may proceed.
 *  - If Hexclave is configured AND a user is signed in → enforce via Hexclave
 *    `user.hasPermission(...)` (safe hunks are always allowed).
 *  - Otherwise → the local role policy (the demo's "Acting as" switcher).
 * Never throws; any Hexclave error degrades to the local policy.
 */
export async function approvalDecision(
  change: Change,
  actorRole: Role
): Promise<ApprovalDecision> {
  if (stackServerApp) {
    try {
      const user = await stackServerApp.getUser();
      if (user) {
        // Do NOT trust the client-supplied `risk` here — require the mapped
        // Hexclave permission for every hunk once a session is enforcing.
        const allowed = await user.hasPermission(permIdFor(change));
        return {
          allowed,
          enforcedBy: "hexclave",
          reason: allowed
            ? undefined
            : `Blocked by Hexclave — missing permission "${permIdFor(change)}"`,
        };
      }
    } catch {
      // fall through to local policy
    }
  }

  const allowed = canApprove(actorRole, change);
  return {
    allowed,
    enforcedBy: "policy",
    reason: allowed ? undefined : `Requires ${change.requiredRole} approval`,
  };
}

// ---------------------------------------------------------------------------
// Data Vault — an optional encrypted store for the agent's execution secrets.
// env remains the reliable fallback; the vault is preferred when populated.
// ---------------------------------------------------------------------------

const VAULT_STORE = "agent-execution-keys";

export async function getVaultSecret(name: string): Promise<string | undefined> {
  if (!stackServerApp || !vaultSecret) return undefined;
  try {
    const store = await stackServerApp.getDataVaultStore(VAULT_STORE);
    const value = await store.getValue(name, { secret: vaultSecret });
    return value ?? undefined;
  } catch {
    return undefined;
  }
}

export async function setVaultSecret(
  name: string,
  value: string
): Promise<boolean> {
  if (!stackServerApp || !vaultSecret) return false;
  try {
    const store = await stackServerApp.getDataVaultStore(VAULT_STORE);
    await store.setValue(name, value, { secret: vaultSecret });
    return true;
  } catch {
    return false;
  }
}

/** Prefer a Data-Vault secret, falling back to the env value. Never throws. */
export async function resolveSecret(
  vaultName: string,
  envValue: string | undefined
): Promise<string | undefined> {
  if (!stackServerApp || !vaultSecret) return envValue;
  return (await getVaultSecret(vaultName)) ?? envValue;
}

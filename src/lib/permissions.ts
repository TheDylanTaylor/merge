// Shared RBAC policy — imported by BOTH the frontend (role switcher + optimistic
// UI) and the /api/merge route (server-side enforcement). This is the demo's
// "landmine gets blocked for the wrong role" beat. When real Hexclave is wired,
// canApprove is backed by user.hasPermission(); until then it's this policy.

import type { Role, Change } from "@/types/changeset";

export const ROLES: { id: Role; label: string }[] = [
  { id: "ceo", label: "CEO" },
  { id: "finance", label: "Finance" },
  { id: "legal", label: "Legal" },
  { id: "engineering", label: "Engineering" },
  { id: "marketing", label: "Marketing" },
];

/**
 * Can `actor` approve this hunk?
 * - CEO can approve anything.
 * - Anyone can approve a `safe` hunk.
 * - Otherwise the actor's role must match the hunk's requiredRole.
 */
export function canApprove(actor: Role, change: Change): boolean {
  if (actor === "ceo") return true;
  if (change.risk === "safe") return true;
  return change.requiredRole === actor;
}

export function roleLabel(role: Role): string {
  return ROLES.find((r) => r.id === role)?.label ?? role;
}

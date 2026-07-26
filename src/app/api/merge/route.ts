// POST /api/merge  { changeset, approvedHunkIds, actorRole? } -> { results }
// Executes approved hunks sequentially (so the UI can animate order) and
// enforces RBAC server-side: a hunk the actor can't approve becomes a
// Forbidden result rather than an execution. Enforcement is via Hexclave when
// configured + signed in, else the local role policy (both never throw).
import { executeHunk } from "@/lib/adapters";
import { approvalDecision } from "@/lib/hexclave";
import type { Changeset, MergeResult, Role } from "@/types/changeset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      changeset?: Changeset;
      approvedHunkIds?: string[];
      actorRole?: Role;
    };

    const changeset = body.changeset;
    if (!changeset || !Array.isArray(changeset.changes)) {
      return Response.json(
        { error: "Invalid changeset", results: [] },
        { status: 400 }
      );
    }
    const approved = new Set(
      Array.isArray(body.approvedHunkIds) ? body.approvedHunkIds : []
    );
    const actorRole: Role = body.actorRole ?? "ceo";
    const results: MergeResult[] = [];

    for (const change of changeset.changes) {
      if (!approved.has(change.id)) continue;

      const decision = await approvalDecision(change, actorRole);
      if (!decision.allowed) {
        results.push({
          hunkId: change.id,
          system: change.system,
          ok: false,
          mocked: false,
          error:
            decision.reason ??
            `Forbidden — requires ${change.requiredRole} approval`,
        });
      } else {
        results.push(await executeHunk(change));
      }
    }

    return Response.json({ results });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e), results: [] },
      { status: 500 }
    );
  }
}

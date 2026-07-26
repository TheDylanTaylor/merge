// POST /api/revert  { results } -> { results }
// Reverts each previously-successful MergeResult; passes failed ones through
// unchanged so the returned array stays aligned with the input.
import { revertHunk } from "@/lib/adapters";
import type { MergeResult } from "@/types/changeset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      results?: MergeResult[];
    };

    if (body.results !== undefined && !Array.isArray(body.results)) {
      return Response.json(
        { error: "Invalid results", results: [] },
        { status: 400 }
      );
    }

    const reverted: MergeResult[] = [];
    for (const result of body.results ?? []) {
      reverted.push(result.ok ? await revertHunk(result) : result);
    }

    return Response.json({ results: reverted });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e), results: [] },
      { status: 500 }
    );
  }
}

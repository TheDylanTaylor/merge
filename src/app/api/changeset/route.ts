// POST /api/changeset  { scenarioId?, goal? } -> { changeset }
import { generateChangeset } from "@/lib/generateChangeset";
import type { ScenarioId } from "@/types/changeset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      scenarioId?: ScenarioId;
      goal?: string;
    };

    const changeset = await generateChangeset({
      goal: body.goal ?? "",
      scenarioId: body.scenarioId,
    });

    return Response.json({ changeset });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

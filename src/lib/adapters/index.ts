// Execution dispatcher. executeHunk runs one Change (real or mock) and always
// returns a FULL MergeResult. revertHunk undoes one MergeResult by system.
// Neither throws — errors are captured into the result.

import type { Change, MergeResult } from "@/types/changeset";
import { sendEmail, revertEmail } from "@/lib/adapters/email";
import { createIssue, archiveIssue } from "@/lib/adapters/linear";
import { postMessage, deleteMessage } from "@/lib/adapters/slack";
import { searchCheaper } from "@/lib/adapters/shopping";

function errMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export async function executeHunk(change: Change): Promise<MergeResult> {
  const base: MergeResult = {
    hunkId: change.id,
    system: change.system,
    ok: false,
    mocked: false,
  };

  try {
    const exec = change.execution;
    let partial: Partial<MergeResult>;

    switch (exec.kind) {
      case "email":
        partial = await sendEmail({
          to: exec.to,
          subject: exec.subject,
          html: exec.html,
        });
        break;
      case "linear":
        partial = await createIssue({
          title: exec.title,
          description: exec.description,
        });
        break;
      case "slack":
        partial = await postMessage({ text: exec.text });
        break;
      case "shopping":
        partial = await searchCheaper({
          query: exec.query,
          maxPrice: exec.maxPrice,
        });
        break;
      case "noop":
        partial = { ok: true, mocked: true, detail: exec.note };
        break;
      default:
        partial = {
          ok: false,
          mocked: false,
          error: "Unknown execution kind",
        };
    }

    return { ...base, ...partial };
  } catch (e) {
    return { ...base, ok: false, error: errMessage(e) };
  }
}

export async function revertHunk(result: MergeResult): Promise<MergeResult> {
  try {
    let partial: Partial<MergeResult>;

    switch (result.system) {
      case "gmail":
        partial = await revertEmail(result);
        break;
      case "linear":
        partial = result.externalId
          ? await archiveIssue(result.externalId)
          : { ok: true, mocked: result.mocked, detail: "Reverted (simulated)" };
        break;
      case "slack":
        partial = result.externalId
          ? await deleteMessage(result.externalId)
          : {
              ok: true,
              mocked: result.mocked,
              detail: "Reverted (no message id to delete)",
            };
        break;
      default:
        // stripe / crm / permissions / shopping — nothing external to undo.
        partial = { ok: true, mocked: result.mocked, detail: "Reverted" };
    }

    return {
      ...result,
      ok: partial.ok ?? result.ok,
      mocked: partial.mocked ?? result.mocked,
      detail: partial.detail ?? "Reverted",
      error: partial.error,
    };
  } catch (e) {
    return { ...result, ok: false, error: errMessage(e) };
  }
}

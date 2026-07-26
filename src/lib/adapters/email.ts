// Email adapter (Resend). Real when RESEND_API_KEY is present, else mock.
// In sandbox we ALWAYS deliver to env.demoEmailTo, but the detail names the
// intended audience so the demo reads truthfully.

import { env, caps } from "@/lib/env";
import type { MergeResult } from "@/types/changeset";

const RESEND_URL = "https://api.resend.com/emails";
const FROM = "Merge <onboarding@resend.dev>";

export async function sendEmail(spec: {
  to: string;
  subject: string;
  html: string;
}): Promise<Partial<MergeResult>> {
  if (!caps.email) {
    return { ok: true, mocked: true, detail: `Would email ${spec.to}` };
  }

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [env.demoEmailTo],
      subject: spec.subject,
      html: spec.html,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    name?: string;
  };

  if (!res.ok || !data.id) {
    return {
      ok: false,
      mocked: false,
      error: data.message ?? `Resend error (${res.status})`,
    };
  }

  return {
    ok: true,
    mocked: false,
    externalId: data.id,
    detail: `Emailed ${env.demoEmailTo} (intended audience: ${spec.to})`,
  };
}

export async function revertEmail(
  prev: MergeResult
): Promise<Partial<MergeResult>> {
  if (!prev.mocked && caps.email) {
    await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [env.demoEmailTo],
        subject: "[Reverted] A previous Merge email was retracted",
        html: `<p>[Reverted] A message previously sent by Merge has been retracted. Please disregard the earlier email.</p>`,
      }),
    }).catch(() => {
      /* best-effort reversal notice */
    });
  }
  return { ok: true, mocked: prev.mocked, detail: "Sent reversal notice" };
}

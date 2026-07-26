// Slack adapter. Real when SLACK_BOT_TOKEN + SLACK_CHANNEL_ID present (revertable),
// falls back to an incoming webhook (post-only, no revert), else mock.
// Slack returns HTTP 200 even on failure — we always check the JSON `ok` flag.

import { env, caps } from "@/lib/env";
import type { MergeResult } from "@/types/changeset";

export async function postMessage(spec: {
  text: string;
}): Promise<Partial<MergeResult>> {
  if (caps.slack) {
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.slackBotToken}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ channel: env.slackChannelId, text: spec.text }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      ts?: string;
      error?: string;
    };
    if (!json.ok) {
      return {
        ok: false,
        mocked: false,
        error: json.error ?? "Slack postMessage failed",
      };
    }
    return {
      ok: true,
      mocked: false,
      externalId: json.ts,
      detail: "Posted message to Slack",
    };
  }

  if (env.slackWebhookUrl) {
    const res = await fetch(env.slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: spec.text }),
    });
    if (!res.ok) {
      return {
        ok: false,
        mocked: false,
        error: `Slack webhook error (${res.status})`,
      };
    }
    return {
      ok: true,
      mocked: false,
      detail: "Posted to Slack via webhook (revert not supported)",
    };
  }

  return { ok: true, mocked: true, detail: "Would post to Slack" };
}

export async function deleteMessage(
  ts: string
): Promise<Partial<MergeResult>> {
  if (!caps.slack) {
    return { ok: true, mocked: true, detail: "Would delete Slack message" };
  }
  const res = await fetch("https://slack.com/api/chat.delete", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.slackBotToken}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ channel: env.slackChannelId, ts }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
  };
  if (!json.ok) {
    return {
      ok: false,
      mocked: false,
      error: json.error ?? "Slack chat.delete failed",
    };
  }
  return { ok: true, mocked: false, detail: "Deleted Slack message" };
}

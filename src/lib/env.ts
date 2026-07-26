// Central env access + capability flags.
// The app is designed to run fully in MOCK mode with zero keys, and to "go
// real" per-adapter as keys are added. Nothing here throws on missing keys.

import "server-only";

function get(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v.trim() : undefined;
}

export const env = {
  anthropicKey: get("ANTHROPIC_API_KEY"),
  anthropicModel: get("ANTHROPIC_MODEL") ?? "claude-opus-4-8",

  resendKey: get("RESEND_API_KEY"),
  demoEmailTo: get("DEMO_EMAIL_TO") ?? "hyperr.ware@gmail.com",

  linearKey: get("LINEAR_API_KEY"),
  linearTeamId: get("LINEAR_TEAM_ID"),

  slackBotToken: get("SLACK_BOT_TOKEN"),
  slackChannelId: get("SLACK_CHANNEL_ID"),
  slackWebhookUrl: get("SLACK_WEBHOOK_URL"),

  channel3Key: get("CHANNEL3_API_KEY"),
  crustdataToken: get("CRUSTDATA_TOKEN"),
};

export const caps = {
  get liveChangeset() {
    return Boolean(env.anthropicKey);
  },
  get email() {
    return Boolean(env.resendKey);
  },
  get linear() {
    return Boolean(env.linearKey && env.linearTeamId);
  },
  get slack() {
    return Boolean(env.slackBotToken && env.slackChannelId);
  },
  get shopping() {
    return Boolean(env.channel3Key);
  },
  get enrich() {
    return Boolean(env.crustdataToken);
  },
};

export type Caps = typeof caps;

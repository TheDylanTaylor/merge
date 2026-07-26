// Anthropic client factory. Returns null when no key is configured, so callers
// can gracefully fall back to the seeded (mock) path with zero keys.

import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";

export function getAnthropic(): Anthropic | null {
  if (!env.anthropicKey) return null;
  return new Anthropic({ apiKey: env.anthropicKey });
}

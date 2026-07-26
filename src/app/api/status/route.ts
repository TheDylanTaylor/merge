// GET /api/status -> { integrations, mode }
// Reports which adapters are LIVE (key present) vs MOCK, WITHOUT ever exposing
// a secret value. Powers the Integrations page and the dashboard status strip.
import { caps, env } from "@/lib/env";
import { hexclaveConfigured } from "@/lib/hexclave";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const integrations = [
    {
      id: "anthropic",
      name: "Claude (Anthropic)",
      category: "intelligence",
      live: caps.liveChangeset,
      detail: caps.liveChangeset
        ? `Live generation · model ${env.anthropicModel}`
        : "Mock mode · 3 seeded scenarios",
    },
    {
      id: "resend",
      name: "Resend (Email)",
      category: "execution",
      live: caps.email,
      detail: caps.email
        ? `Live · delivers to ${env.demoEmailTo}`
        : "Mock mode · emails are simulated",
    },
    {
      id: "linear",
      name: "Linear",
      category: "execution",
      live: caps.linear,
      detail: caps.linear
        ? "Live · creates & archives issues"
        : "Mock mode · issues are simulated",
    },
    {
      id: "slack",
      name: "Slack",
      category: "execution",
      live: caps.slack,
      detail: caps.slack
        ? "Live · posts & deletes messages"
        : "Mock mode · posts are simulated",
    },
    {
      id: "channel3",
      name: "Channel3 (Commerce)",
      category: "stretch",
      live: caps.shopping,
      detail: caps.shopping
        ? "Live · product search enabled"
        : "Mock mode · not wired to a hunk",
    },
    {
      id: "crustdata",
      name: "CrustData (Enrichment)",
      category: "stretch",
      live: caps.enrich,
      detail: caps.enrich
        ? "Live · company enrichment enabled"
        : "Mock mode · not wired to a hunk",
    },
    {
      id: "hexclave",
      name: "Hexclave (Auth · RBAC · Vault)",
      category: "governance",
      live: hexclaveConfigured,
      detail: hexclaveConfigured
        ? "Live · server-side approval enforcement + Data Vault"
        : "Mock mode · local role policy",
    },
  ];

  const liveCount = integrations.filter((i) => i.live).length;

  return Response.json({
    mode: liveCount === 0 ? "mock" : liveCount === integrations.length ? "live" : "hybrid",
    liveCount,
    total: integrations.length,
    integrations,
  });
}

// Linear adapter (GraphQL). Real when LINEAR_API_KEY + LINEAR_TEAM_ID present.
// NOTE: Linear uses a raw API key in the Authorization header (NO "Bearer").

import { env, caps } from "@/lib/env";
import type { MergeResult } from "@/types/changeset";

const LINEAR_URL = "https://api.linear.app/graphql";

interface LinearResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

async function linearFetch<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<LinearResponse<T>> {
  const res = await fetch(LINEAR_URL, {
    method: "POST",
    headers: {
      Authorization: env.linearKey as string,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  return (await res.json().catch(() => ({}))) as LinearResponse<T>;
}

export async function createIssue(spec: {
  title: string;
  description: string;
}): Promise<Partial<MergeResult>> {
  if (!caps.linear) {
    return {
      ok: true,
      mocked: true,
      detail: `Would create Linear issue "${spec.title}"`,
    };
  }

  const query = `
    mutation IssueCreate($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { id url identifier }
      }
    }`;

  const json = await linearFetch<{
    issueCreate?: {
      success?: boolean;
      issue?: { id: string; url: string; identifier: string };
    };
  }>(query, {
    input: {
      title: spec.title,
      description: spec.description,
      teamId: env.linearTeamId,
    },
  });

  const issue = json.data?.issueCreate?.issue;
  if (json.errors?.length || !issue) {
    return {
      ok: false,
      mocked: false,
      error: json.errors?.[0]?.message ?? "Linear issueCreate failed",
    };
  }

  return {
    ok: true,
    mocked: false,
    externalId: issue.id,
    externalUrl: issue.url,
    detail: `Created Linear issue ${issue.identifier}`,
  };
}

export async function archiveIssue(
  externalId: string
): Promise<Partial<MergeResult>> {
  if (!caps.linear) {
    return { ok: true, mocked: true, detail: "Would archive Linear issue" };
  }

  const query = `
    mutation IssueArchive($id: String!) {
      issueArchive(id: $id) { success }
    }`;

  const json = await linearFetch<{ issueArchive?: { success?: boolean } }>(
    query,
    { id: externalId }
  );

  if (json.errors?.length || !json.data?.issueArchive?.success) {
    return {
      ok: false,
      mocked: false,
      error: json.errors?.[0]?.message ?? "Linear issueArchive failed",
    };
  }

  return { ok: true, mocked: false, detail: "Archived Linear issue" };
}

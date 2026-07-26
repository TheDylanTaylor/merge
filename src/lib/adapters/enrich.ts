// Company enrichment (Crustdata). Real when CRUSTDATA_TOKEN present, else mock.
// Small flavor helper — used to color changeset copy, not a core execution path.

import { env, caps } from "@/lib/env";

export interface CompanyEnrichment {
  headcount: number;
  lastRound: string;
  note: string;
}

export async function enrichCompany(
  domain: string
): Promise<CompanyEnrichment> {
  if (!caps.enrich) {
    return {
      headcount: 240,
      lastRound: "Series B",
      note: `Mock enrichment for ${domain}`,
    };
  }

  try {
    const url =
      `https://api.crustdata.com/screener/company` +
      `?company_domain=${encodeURIComponent(domain)}` +
      `&fields=headcount.headcount,funding_and_investment`;

    const res = await fetch(url, {
      headers: { Authorization: `Token ${env.crustdataToken}` },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json: any = await res.json().catch(() => null);
    const company = Array.isArray(json) ? json[0] : json;

    const headcount =
      Number(company?.headcount?.headcount ?? company?.headcount ?? 0) || 0;
    const lastRound = String(
      company?.funding_and_investment?.last_funding_round_type ??
        company?.funding_and_investment?.last_round ??
        "unknown"
    );

    return {
      headcount,
      lastRound,
      note: `Enriched ${domain} via Crustdata`,
    };
  } catch {
    return {
      headcount: 0,
      lastRound: "unknown",
      note: `Enrichment unavailable for ${domain}`,
    };
  }
}

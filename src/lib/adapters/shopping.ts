// Shopping adapter (Channel3 product search). Real when CHANNEL3_API_KEY present,
// else returns a realistic mocked cheaper product. Picks the cheapest offer.

import { env, caps } from "@/lib/env";
import type { MergeResult } from "@/types/changeset";

interface RawOffer {
  title?: string;
  name?: string;
  url?: string;
  link?: string;
  price?: number | { price?: number; value?: number; amount?: number };
  offers?: Array<{ price?: number; url?: string }>;
}

function extractPrice(o: RawOffer): number | undefined {
  const p = o.price;
  if (typeof p === "number") return p;
  if (p && typeof p === "object") {
    const v = p.price ?? p.value ?? p.amount;
    if (typeof v === "number") return v;
  }
  const off = o.offers?.find((x) => typeof x.price === "number");
  if (off && typeof off.price === "number") return off.price;
  return undefined;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function searchCheaper(spec: {
  query: string;
  maxPrice?: number;
}): Promise<Partial<MergeResult>> {
  if (!caps.shopping) {
    const reference = spec.maxPrice ?? 129.99;
    const price = round2(reference * 0.72);
    const saves = round2(reference - price);
    return {
      ok: true,
      mocked: true,
      detail: `Found "${spec.query}" (generic equivalent) at $${price} (saves $${saves})`,
      externalUrl: "https://example.com/product",
    };
  }

  const res = await fetch("https://api.trychannel3.com/v1/search", {
    method: "POST",
    headers: {
      "x-api-key": env.channel3Key as string,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: spec.query,
      filters: spec.maxPrice
        ? { price: { max_price: spec.maxPrice } }
        : undefined,
      limit: 3,
    }),
  });

  if (!res.ok) {
    return {
      ok: false,
      mocked: false,
      error: `Channel3 error (${res.status})`,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await res.json().catch(() => null);
  const items: RawOffer[] = Array.isArray(json)
    ? json
    : json?.results ?? json?.products ?? json?.data ?? [];

  const priced = items
    .map((o) => ({ o, price: extractPrice(o) }))
    .filter((x): x is { o: RawOffer; price: number } =>
      typeof x.price === "number"
    )
    .sort((a, b) => a.price - b.price);

  if (priced.length === 0) {
    return {
      ok: true,
      mocked: false,
      detail: `No cheaper option found for "${spec.query}"`,
    };
  }

  const best = priced[0];
  const title = best.o.title ?? best.o.name ?? spec.query;
  const url = best.o.url ?? best.o.link;
  const reference =
    spec.maxPrice ?? Math.max(...priced.map((x) => x.price));
  const saves = Math.max(0, round2(reference - best.price));

  return {
    ok: true,
    mocked: false,
    detail: `Found ${title} at $${best.price} (saves $${saves})`,
    externalUrl: url,
  };
}

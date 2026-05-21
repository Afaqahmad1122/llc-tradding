const CURRENCY_API_USD_JSON =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json";

/**
 * Free USD→PKR rate (no API key). Used when Frankfurter / Open Exchange omit PKR.
 */
export async function fetchUsdToPkrRate(): Promise<number> {
  const res = await fetch(CURRENCY_API_USD_JSON, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`currency-api responded ${res.status}`);
  }
  const body = (await res.json()) as { usd?: Record<string, number> };
  const rate = body.usd?.pkr;
  if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
    throw new Error("currency-api payload missing usd.pkr");
  }
  return rate;
}

/** Ensures `rates.PKR` is set when a supplemental source is available. */
export async function withPkrRate(
  rates: Record<string, number>,
): Promise<Record<string, number>> {
  const existing = rates.PKR;
  if (typeof existing === "number" && Number.isFinite(existing) && existing > 0) {
    return rates;
  }
  try {
    const pkr = await fetchUsdToPkrRate();
    return { ...rates, PKR: pkr };
  } catch {
    return rates;
  }
}

/** Fills PKR from USD when the client did not send `pricePkr`. */
export async function resolvePricePkr(input: {
  priceUsd: number;
  pricePkr?: number;
}): Promise<number | undefined> {
  if (input.pricePkr !== undefined) return input.pricePkr;
  try {
    const rate = await fetchUsdToPkrRate();
    return Math.round(input.priceUsd * rate);
  } catch {
    return undefined;
  }
}

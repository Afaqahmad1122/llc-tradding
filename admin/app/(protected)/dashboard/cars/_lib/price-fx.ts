import { parseRequiredUsd } from "./draft-utils";

/** Whole PKR amount for a USD list price at the given rate. */
export function computePkrFromUsd(
  usdRaw: string,
  pkrPerUsd: number | undefined,
): string | null {
  const usd = parseRequiredUsd(usdRaw);
  if (
    usd == null ||
    typeof pkrPerUsd !== "number" ||
    !Number.isFinite(pkrPerUsd) ||
    pkrPerUsd <= 0
  ) {
    return null;
  }
  return String(Math.round(usd * pkrPerUsd));
}

export function formatPkrRateHint(pkrPerUsd: number): string {
  const rounded = Math.round(pkrPerUsd);
  return `1 USD ≈ ${rounded.toLocaleString()} PKR`;
}

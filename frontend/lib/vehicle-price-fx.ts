import { formatPkr, formatUsd } from "@/lib/car-display";

export function formatIntForeignCurrency(
  amount: number,
  currencyCode: string,
): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;
  }
}

export function getFxMultiplier(
  currency: string,
  rates: Record<string, number> | undefined,
): number | null {
  if (currency === "USD") return 1;
  const rate = rates?.[currency];
  if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
    return null;
  }
  return rate;
}

export type VehiclePriceDisplay = {
  label: string;
  hint: string | null;
};

/** Live FX first; stored PKR only when currency is PKR and rates are unavailable. */
export function resolveVehiclePriceDisplay(input: {
  currency: string;
  priceUsd: string | null;
  pricePkr: string | null;
  fxRates: Record<string, number> | undefined;
  fxLoading?: boolean;
}): VehiclePriceDisplay {
  const usd = formatUsd(input.priceUsd);
  const priceUsdNum = Number.parseFloat(input.priceUsd ?? "");

  if (input.currency === "USD") {
    return { label: usd, hint: null };
  }

  if (input.fxLoading) {
    return { label: "…", hint: "Loading exchange rate…" };
  }

  const multiplier = getFxMultiplier(input.currency, input.fxRates);
  if (
    multiplier != null &&
    Number.isFinite(priceUsdNum) &&
    priceUsdNum > 0
  ) {
    return {
      label: formatIntForeignCurrency(priceUsdNum * multiplier, input.currency),
      hint: null,
    };
  }

  if (input.currency === "PKR") {
    const stored = formatPkr(input.pricePkr);
    if (stored) {
      return {
        label: stored,
        hint: "Stored price — live rate unavailable.",
      };
    }
  }

  return {
    label: usd,
    hint: `Approximate (${input.currency}); USD shown — FX unavailable.`,
  };
}

/** Header secondary line: PKR from live USD×rate when possible. */
export function resolveHeaderPkrLine(input: {
  priceUsd: string | null;
  pricePkr: string | null;
  fxRates: Record<string, number> | undefined;
}): string | null {
  const priceUsdNum = Number.parseFloat(input.priceUsd ?? "");
  const rate = input.fxRates?.PKR;
  if (
    typeof rate === "number" &&
    Number.isFinite(rate) &&
    rate > 0 &&
    Number.isFinite(priceUsdNum) &&
    priceUsdNum > 0
  ) {
    return formatIntForeignCurrency(priceUsdNum * rate, "PKR");
  }
  return formatPkr(input.pricePkr);
}

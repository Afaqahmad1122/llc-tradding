/**
 * Currencies offered in the vehicle detail price calculator (ISO 4217).
 * USD is base; others convert via /reference/fx-rates (Frankfurter + PKR fallback).
 */
export const CALCULATOR_CURRENCY_CODES = [
  "USD",
  "PKR",
  "JPY",
  "EUR",
  "GBP",
  "CNY",
] as const;

export type CalculatorCurrencyCode = (typeof CALCULATOR_CURRENCY_CODES)[number];

const FEATURED_SET = new Set<string>(CALCULATOR_CURRENCY_CODES);

let displayNames: Intl.DisplayNames | null = null;

function getDisplayNames(): Intl.DisplayNames | null {
  if (displayNames) return displayNames;
  try {
    displayNames = new Intl.DisplayNames(["en"], { type: "currency" });
    return displayNames;
  } catch {
    return null;
  }
}

/** English name for a currency code, e.g. "Japanese Yen". */
export function calculatorCurrencyName(code: string): string {
  const normalized = code.trim().toUpperCase();
  const dn = getDisplayNames();
  if (dn) {
    try {
      const name = dn.of(normalized);
      if (name) return name;
    } catch {
      /* invalid code for Intl */
    }
  }
  return normalized;
}

/** Compact select label: "JPY — Japanese Yen". */
export function calculatorCurrencyOptionLabel(code: string): string {
  const normalized = code.trim().toUpperCase();
  if (normalized === "USD") return "USD — US Dollar";
  const name = calculatorCurrencyName(normalized);
  return name === normalized ? normalized : `${normalized} — ${name}`;
}

/**
 * Ordered currency list: featured codes first, then extra codes from the
 * selected destination country (alphabetically), de-duplicated.
 */
export function buildCalculatorCurrencyOptions(
  countryCurrencyCodes: string[] = [],
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  const add = (raw: string) => {
    const code = raw.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(code) || seen.has(code)) return;
    seen.add(code);
    result.push(code);
  };

  for (const code of CALCULATOR_CURRENCY_CODES) add(code);

  const extras = [...countryCurrencyCodes]
    .map((c) => c.trim().toUpperCase())
    .filter((c) => /^[A-Z]{3}$/.test(c) && !FEATURED_SET.has(c))
    .sort((a, b) => a.localeCompare(b));

  for (const code of extras) add(code);

  return result;
}

/** Prefer destination country currency when user changes country. */
export function defaultCurrencyForCountry(
  countryCode: string,
  countryCurrencyCodes: string[],
  availableOptions: string[],
): string {
  const options = new Set(availableOptions);
  const pick = (code: string | undefined) =>
    code && options.has(code) ? code : null;

  const fromCountry = countryCurrencyCodes
    .map((c) => c.trim().toUpperCase())
    .find((c) => c !== "USD" && options.has(c));
  if (fromCountry) return fromCountry;

  const byCountry: Record<string, CalculatorCurrencyCode> = {
    PK: "PKR",
    JP: "JPY",
    CN: "CNY",
    GB: "GBP",
  };
  const mapped = pick(byCountry[countryCode.trim().toUpperCase()]);
  if (mapped) return mapped;

  return pick("PKR") ?? pick("USD") ?? availableOptions[0] ?? "USD";
}

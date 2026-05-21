import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Request, Response } from "express";

import { env } from "../config/env.js";
import { withPkrRate } from "../lib/usd-pkr-rate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

type RestCountry = {
  name?: { common?: string };
  cca2?: string;
  currencies?: Record<string, { name?: string; symbol?: string }>;
};

export type DestinationCountryDto = {
  code: string;
  name: string;
  currencyCodes: string[];
};

type RatesPayload = {
  base: string;
  rates: Record<string, number>;
  source: "open-exchange-rates" | "frankfurter";
};

const COUNTRIES_TTL_MS = 6 * 60 * 60 * 1000;
const RATES_TTL_MS = 30 * 60 * 1000;

let countriesCache: {
  expiresAt: number;
  data: DestinationCountryDto[];
} | null = null;
let ratesCache: { expiresAt: number; data: RatesPayload } | null = null;

let destinationPorts: Record<string, string[]> | null = null;

function loadDestinationPorts(): Record<string, string[]> {
  if (destinationPorts) return destinationPorts;
  const raw = readFileSync(
    join(__dirname, "../data/destination-ports.json"),
    "utf8",
  );
  destinationPorts = JSON.parse(raw) as Record<string, string[]>;
  return destinationPorts;
}

function normalizeCurrencyCodes(
  currencies: RestCountry["currencies"],
): string[] {
  if (!currencies || typeof currencies !== "object") return [];
  return Object.keys(currencies).sort((a, b) => a.localeCompare(b));
}

async function fetchCountriesFromRest(): Promise<DestinationCountryDto[]> {
  const url = "https://restcountries.com/v3.1/all?fields=name,cca2,currencies";
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    throw new Error(`restcountries responded ${res.status}`);
  }
  const payload = (await res.json()) as RestCountry[];
  const rows: DestinationCountryDto[] = [];
  for (const row of payload) {
    const code = row.cca2?.trim().toUpperCase();
    const name = row.name?.common?.trim();
    if (!code || !name) continue;
    rows.push({
      code,
      name,
      currencyCodes: normalizeCurrencyCodes(row.currencies),
    });
  }
  rows.sort((a, b) => a.name.localeCompare(b.name));
  return rows;
}

async function fetchRatesOpenExchange(): Promise<RatesPayload> {
  const id = env.OPEN_EXCHANGE_RATES_APP_ID?.trim();
  if (!id) {
    throw new Error("open exchange rates app id not configured");
  }
  const url = `https://openexchangerates.org/api/latest.json?app_id=${encodeURIComponent(
    id,
  )}&base=USD`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`openexchangerates responded ${res.status}`);
  }
  const body = (await res.json()) as {
    base?: string;
    rates?: Record<string, number>;
  };
  if (!body.rates || typeof body.rates !== "object") {
    throw new Error("openexchangerates payload missing rates");
  }
  return {
    base: body.base?.trim().toUpperCase() || "USD",
    rates: body.rates,
    source: "open-exchange-rates",
  };
}

async function fetchRatesFrankfurter(): Promise<RatesPayload> {
  const url = "https://api.frankfurter.app/latest?from=USD";
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`frankfurter responded ${res.status}`);
  }
  const body = (await res.json()) as {
    base?: string;
    rates?: Record<string, number>;
  };
  if (!body.rates || typeof body.rates !== "object") {
    throw new Error("frankfurter payload missing rates");
  }
  return {
    base: body.base?.trim().toUpperCase() || "USD",
    rates: body.rates,
    source: "frankfurter",
  };
}

export const getDestinationCountries = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const now = Date.now();
    if (countriesCache && countriesCache.expiresAt > now) {
      res.status(200).json({ data: countriesCache.data });
      return;
    }
    const data = await fetchCountriesFromRest();
    countriesCache = { expiresAt: now + COUNTRIES_TTL_MS, data };
    res.status(200).json({ data });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "failed to load countries";
    res.status(502).json({ message });
  }
};

export const getDestinationPorts = (req: Request, res: Response): void => {
  const raw =
    typeof req.query.countryCode === "string" ? req.query.countryCode : "";
  const code = raw.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) {
    res
      .status(400)
      .json({ message: "countryCode must be a 2-letter ISO code" });
    return;
  }
  try {
    const map = loadDestinationPorts();
    const ports = map[code] ?? map["*"] ?? ["Nearest major port"];
    res.status(200).json({ data: ports });
  } catch {
    res.status(500).json({ message: "failed to load destination ports" });
  }
};

async function loadFxRatesPayload(): Promise<RatesPayload> {
  if (env.OPEN_EXCHANGE_RATES_APP_ID?.trim()) {
    try {
      return await fetchRatesOpenExchange();
    } catch {
      return await fetchRatesFrankfurter();
    }
  }
  return await fetchRatesFrankfurter();
}

export const getFxRates = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const now = Date.now();
    let payload: RatesPayload;
    if (ratesCache && ratesCache.expiresAt > now) {
      payload = ratesCache.data;
    } else {
      payload = await loadFxRatesPayload();
      ratesCache = { expiresAt: now + RATES_TTL_MS, data: payload };
    }

    const rates = await withPkrRate(payload.rates);
    const enriched: RatesPayload = { ...payload, rates };
    if (rates !== payload.rates) {
      ratesCache = {
        expiresAt: ratesCache?.expiresAt ?? now + RATES_TTL_MS,
        data: enriched,
      };
    }
    res.status(200).json(enriched);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "failed to load exchange rates";
    res.status(502).json({ message });
  }
};

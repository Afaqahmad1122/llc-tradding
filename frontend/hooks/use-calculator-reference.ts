"use client";

import { useMemo } from "react";

import {
  fetchDestinationCountries,
  fetchDestinationPorts,
} from "@/lib/api/reference";

import { useApiQuery } from "./use-api-query";

const DAY_MS = 24 * 60 * 60 * 1000;

export function useDestinationCountriesQuery() {
  return useApiQuery({
    queryKey: ["reference", "destination-countries"],
    queryFn: fetchDestinationCountries,
    staleTime: DAY_MS,
  });
}

export function useDestinationPortsQuery(countryCode: string | null) {
  const trimmed = countryCode?.trim().toUpperCase() ?? "";

  const queryKey = useMemo(
    () => ["reference", "destination-ports", trimmed],
    [trimmed],
  );

  return useApiQuery({
    queryKey,
    queryFn: () => fetchDestinationPorts(trimmed),
    enabled: /^[A-Z]{2}$/.test(trimmed),
    staleTime: DAY_MS,
  });
}

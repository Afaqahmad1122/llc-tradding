"use client";

import { fetchFxRates } from "@/lib/api/reference";

import { useApiQuery } from "./use-api-query";

const HOUR_MS = 60 * 60 * 1000;

export function useFxRatesQuery() {
  return useApiQuery({
    queryKey: ["reference", "fx-rates"],
    queryFn: fetchFxRates,
    staleTime: HOUR_MS,
    retry: 1,
  });
}

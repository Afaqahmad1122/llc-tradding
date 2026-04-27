"use client";

import { useMemo } from "react";
import { useApiQuery } from "@/hooks/use-api-query";
import {
  getShippingRegionsApi,
  getShippingSchedulesByRegionSlugApi,
} from "@/lib/api/shipping";

export function useShippingRegionsQuery() {
  return useApiQuery({
    queryKey: ["shipping-regions"],
    queryFn: getShippingRegionsApi,
  });
}

export function useShippingSchedulesByRegionQuery(regionSlug: string | null) {
  const queryKey = useMemo(
    () => ["shipping-schedules", regionSlug],
    [regionSlug],
  );

  return useApiQuery({
    queryKey,
    queryFn: () => getShippingSchedulesByRegionSlugApi(regionSlug ?? ""),
    enabled: Boolean(regionSlug),
  });
}

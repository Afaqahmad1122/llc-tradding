"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSiteSettings } from "@/lib/api/site-settings";
import { DEFAULT_CONTACT_SETTINGS } from "@/lib/contact-info";

export const SITE_SETTINGS_QUERY_KEY = ["site-settings"] as const;

export function useSiteSettingsQuery() {
  return useQuery({
    queryKey: SITE_SETTINGS_QUERY_KEY,
    queryFn: fetchSiteSettings,
    staleTime: 5 * 60 * 1000,
  });
}

export function useContactSettings() {
  const query = useSiteSettingsQuery();
  return {
    ...query,
    settings: query.data?.settings ?? DEFAULT_CONTACT_SETTINGS,
  };
}

import { http } from "@/lib/api/http";

export type SiteSettings = {
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  updatedAt: string;
};

export type SiteSettingsResponse = {
  settings: SiteSettings;
};

export function fetchSiteSettings() {
  return http.get<SiteSettingsResponse>("/site-settings");
}

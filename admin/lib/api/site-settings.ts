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

export type UpdateSiteSettingsBody = {
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
};

export function fetchSiteSettings() {
  return http.get<SiteSettingsResponse>("/site-settings");
}

export function updateSiteSettings(body: UpdateSiteSettingsBody) {
  return http.patch<SiteSettingsResponse, UpdateSiteSettingsBody>(
    "/site-settings/admin",
    body,
  );
}

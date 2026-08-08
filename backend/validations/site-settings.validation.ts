import { z } from "zod";

const trimmed = z.string().trim();

export const updateSiteSettingsSchema = z.object({
  contactEmail: trimmed.email("contact email must be valid").max(254),
  contactPhone: trimmed.min(6, "contact number must be at least 6 characters").max(40),
  whatsappNumber: trimmed.min(6, "whatsapp number must be at least 6 characters").max(40),
});

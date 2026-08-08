UPDATE "SiteSettings"
SET "contactPhone" = "whatsappNumber"
WHERE "contactPhone" = '+81 70-6436-2003'
  AND "whatsappNumber" <> "contactPhone";

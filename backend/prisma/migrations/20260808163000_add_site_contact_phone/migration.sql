ALTER TABLE "SiteSettings"
ADD COLUMN IF NOT EXISTS "contactPhone" TEXT NOT NULL DEFAULT '+81 70-6436-2003';

UPDATE "SiteSettings"
SET "contactPhone" = "whatsappNumber"
WHERE trim("contactPhone") = '';

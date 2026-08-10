ALTER TABLE "SiteSettings"
ALTER COLUMN "whatsappNumber" SET DEFAULT '+44 7827 893230';

UPDATE "SiteSettings"
SET "whatsappNumber" = '+44 7827 893230'
WHERE "whatsappNumber" = '+81 70-6436-2003';

CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "contactEmail" TEXT NOT NULL DEFAULT 'icctradingjp@gmail.com',
    "whatsappNumber" TEXT NOT NULL DEFAULT '+81 70-6436-2003',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "SiteSettings" ("id", "contactEmail", "whatsappNumber")
VALUES (1, 'icctradingjp@gmail.com', '+81 70-6436-2003')
ON CONFLICT ("id") DO NOTHING;

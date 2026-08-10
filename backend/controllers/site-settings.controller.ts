import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

const SITE_SETTINGS_ID = 1;
const DEFAULT_SITE_SETTINGS = {
  contactEmail: "icctradingjp@gmail.com",
  contactPhone: "+81 70-6436-2003",
  whatsappNumber: "+44 7827 893230",
};

type UpdateSiteSettingsBody = {
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
};

const getOrCreateSiteSettings = async () => {
  return prisma.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    update: {},
    create: { id: SITE_SETTINGS_ID, ...DEFAULT_SITE_SETTINGS },
  });
};

const settingsPayload = (settings: Awaited<ReturnType<typeof getOrCreateSiteSettings>>) => ({
  contactEmail: settings.contactEmail,
  contactPhone: settings.contactPhone,
  whatsappNumber: settings.whatsappNumber,
  updatedAt: settings.updatedAt,
});

export const getSiteSettings = async (_req: Request, res: Response): Promise<void> => {
  const settings = await getOrCreateSiteSettings();
  res.status(200).json({ settings: settingsPayload(settings) });
};

export const updateSiteSettings = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as UpdateSiteSettingsBody;
  const settings = await prisma.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    update: {
      contactEmail: body.contactEmail.trim().toLowerCase(),
      contactPhone: body.contactPhone.trim(),
      whatsappNumber: body.whatsappNumber.trim(),
    },
    create: {
      id: SITE_SETTINGS_ID,
      contactEmail: body.contactEmail.trim().toLowerCase(),
      contactPhone: body.contactPhone.trim(),
      whatsappNumber: body.whatsappNumber.trim(),
    },
  });

  res.status(200).json({ settings: settingsPayload(settings) });
};

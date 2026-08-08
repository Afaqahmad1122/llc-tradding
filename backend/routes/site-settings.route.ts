import { Router } from "express";
import {
  getSiteSettings,
  updateSiteSettings,
} from "../controllers/site-settings.controller.js";
import { requireAuth, requireAdminRole } from "../middlewares/auth.middleware.js";
import { validateRequestBody } from "../middlewares/validate-request.middleware.js";
import { updateSiteSettingsSchema } from "../validations/site-settings.validation.js";

export const siteSettingsRouter = Router();

siteSettingsRouter.get("/", getSiteSettings);
siteSettingsRouter.patch(
  "/admin",
  requireAuth,
  requireAdminRole,
  validateRequestBody(updateSiteSettingsSchema),
  updateSiteSettings,
);

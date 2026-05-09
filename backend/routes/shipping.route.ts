import { Router } from "express";
import {
  createAdminShippingRegion,
  createAdminShippingSchedule,
  deleteAdminShippingRegion,
  deleteAdminShippingSchedule,
  getAdminShippingRegions,
  getAdminShippingScheduleById,
  getAdminShippingSchedulesByRegion,
  getShippingRegions,
  getShippingSchedulesByRegionSlug,
  replaceAdminShippingScheduleArrivals,
  replaceAdminShippingScheduleDepartures,
  updateAdminShippingRegion,
  updateAdminShippingSchedule,
} from "../controllers/shipping.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { validateRequestBody } from "../middlewares/validate-request.middleware.js";
import {
  createShippingRegionSchema,
  createShippingScheduleSchema,
  replaceShippingArrivalsSchema,
  replaceShippingDeparturesSchema,
  updateShippingRegionSchema,
  updateShippingScheduleSchema,
} from "../validations/shipping.validation.js";

export const shippingRouter = Router();

shippingRouter.get("/regions", getShippingRegions);
shippingRouter.get("/regions/:slug/schedules", getShippingSchedulesByRegionSlug);

shippingRouter.get("/admin/regions", requireAuth, requirePermission("shippingRead"), getAdminShippingRegions);
shippingRouter.post(
  "/admin/regions",
  requireAuth,
  requirePermission("shippingCreate"),
  validateRequestBody(createShippingRegionSchema),
  createAdminShippingRegion,
);
shippingRouter.patch(
  "/admin/regions/:id",
  requireAuth,
  requirePermission("shippingUpdate"),
  validateRequestBody(updateShippingRegionSchema),
  updateAdminShippingRegion,
);
shippingRouter.delete("/admin/regions/:id", requireAuth, requirePermission("shippingDelete"), deleteAdminShippingRegion);

shippingRouter.get("/admin/regions/:id/schedules", requireAuth, requirePermission("shippingRead"), getAdminShippingSchedulesByRegion);
shippingRouter.post(
  "/admin/regions/:id/schedules",
  requireAuth,
  requirePermission("shippingCreate"),
  validateRequestBody(createShippingScheduleSchema),
  createAdminShippingSchedule,
);
shippingRouter.get("/admin/schedules/:id", requireAuth, requirePermission("shippingRead"), getAdminShippingScheduleById);
shippingRouter.patch(
  "/admin/schedules/:id",
  requireAuth,
  requirePermission("shippingUpdate"),
  validateRequestBody(updateShippingScheduleSchema),
  updateAdminShippingSchedule,
);
shippingRouter.delete("/admin/schedules/:id", requireAuth, requirePermission("shippingDelete"), deleteAdminShippingSchedule);
shippingRouter.put(
  "/admin/schedules/:id/departures",
  requireAuth,
  requirePermission("shippingUpdate"),
  validateRequestBody(replaceShippingDeparturesSchema),
  replaceAdminShippingScheduleDepartures,
);
shippingRouter.put(
  "/admin/schedules/:id/arrivals",
  requireAuth,
  requirePermission("shippingUpdate"),
  validateRequestBody(replaceShippingArrivalsSchema),
  replaceAdminShippingScheduleArrivals,
);

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

shippingRouter.get("/admin/regions", requireAuth, getAdminShippingRegions);
shippingRouter.post(
  "/admin/regions",
  requireAuth,
  validateRequestBody(createShippingRegionSchema),
  createAdminShippingRegion,
);
shippingRouter.patch(
  "/admin/regions/:id",
  requireAuth,
  validateRequestBody(updateShippingRegionSchema),
  updateAdminShippingRegion,
);
shippingRouter.delete("/admin/regions/:id", requireAuth, deleteAdminShippingRegion);

shippingRouter.get("/admin/regions/:id/schedules", requireAuth, getAdminShippingSchedulesByRegion);
shippingRouter.post(
  "/admin/regions/:id/schedules",
  requireAuth,
  validateRequestBody(createShippingScheduleSchema),
  createAdminShippingSchedule,
);
shippingRouter.get("/admin/schedules/:id", requireAuth, getAdminShippingScheduleById);
shippingRouter.patch(
  "/admin/schedules/:id",
  requireAuth,
  validateRequestBody(updateShippingScheduleSchema),
  updateAdminShippingSchedule,
);
shippingRouter.delete("/admin/schedules/:id", requireAuth, deleteAdminShippingSchedule);
shippingRouter.put(
  "/admin/schedules/:id/departures",
  requireAuth,
  validateRequestBody(replaceShippingDeparturesSchema),
  replaceAdminShippingScheduleDepartures,
);
shippingRouter.put(
  "/admin/schedules/:id/arrivals",
  requireAuth,
  validateRequestBody(replaceShippingArrivalsSchema),
  replaceAdminShippingScheduleArrivals,
);

import { Router } from "express";
import {
  createAdminCar,
  createAdminModel,
  deleteAdminCar,
  getAdminCarById,
  getAdminCars,
  getAdminModels,
  getCarByReference,
  getCarEngagementStats,
  getCarsMeta,
  getCars,
  presignCarImageUpload,
  replaceAdminCarImages,
  submitCarInquiry,
  trackCarEvent,
  updateAdminCar,
} from "../controllers/cars.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { validateRequestBody } from "../middlewares/validate-request.middleware.js";
import {
  carInquirySchema,
  createCarSchema,
  createCarModelSchema,
  presignCarImageSchema,
  replaceCarImagesSchema,
  trackCarEventSchema,
  updateCarSchema,
} from "../validations/cars.validation.js";

export const carsRouter = Router();

carsRouter.get("/", getCars);
carsRouter.get("/meta", getCarsMeta);

carsRouter.get("/admin", requireAuth, requirePermission("carsRead"), getAdminCars);
carsRouter.get(
  "/admin/analytics/engagement",
  requireAuth,
  requirePermission("carsRead"),
  getCarEngagementStats,
);
carsRouter.post(
  "/admin",
  requireAuth,
  requirePermission("carsCreate"),
  validateRequestBody(createCarSchema),
  createAdminCar,
);
carsRouter.post(
  "/admin/images/presign",
  requireAuth,
  requirePermission("carsCreate"),
  validateRequestBody(presignCarImageSchema),
  presignCarImageUpload,
);
carsRouter.get("/admin/models", requireAuth, requirePermission("carsRead"), getAdminModels);
carsRouter.post(
  "/admin/models",
  requireAuth,
  requirePermission("carsCreate"),
  validateRequestBody(createCarModelSchema),
  createAdminModel,
);
carsRouter.get("/admin/:id", requireAuth, requirePermission("carsRead"), getAdminCarById);
carsRouter.patch(
  "/admin/:id",
  requireAuth,
  requirePermission("carsUpdate"),
  validateRequestBody(updateCarSchema),
  updateAdminCar,
);
carsRouter.delete("/admin/:id", requireAuth, requirePermission("carsDelete"), deleteAdminCar);
carsRouter.put(
  "/admin/:id/images",
  requireAuth,
  requirePermission("carsUpdate"),
  validateRequestBody(replaceCarImagesSchema),
  replaceAdminCarImages,
);

carsRouter.get("/:referenceNo", getCarByReference);
carsRouter.post(
  "/:referenceNo/inquire",
  validateRequestBody(carInquirySchema),
  submitCarInquiry,
);
carsRouter.post(
  "/:referenceNo/events",
  validateRequestBody(trackCarEventSchema),
  trackCarEvent,
);

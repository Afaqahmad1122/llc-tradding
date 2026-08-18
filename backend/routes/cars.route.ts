import { Router } from "express";
import express from "express";
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
  streamAdminCarEvents,
  trackCarEvent,
  uploadAdminCarImage,
  updateAdminCar,
} from "../controllers/cars.controller.js";
import {
  requireAuth,
  requireAuthForEventStream,
} from "../middlewares/auth.middleware.js";
import {
  requireAnyPermission,
  requirePermission,
} from "../middlewares/permission.middleware.js";
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

carsRouter.get(
  "/admin",
  requireAuth,
  requireAnyPermission("carsRead", "ledgerCreate", "reviewsCreate"),
  getAdminCars,
);
carsRouter.get(
  "/admin/analytics/engagement",
  requireAuth,
  requirePermission("carsRead"),
  getCarEngagementStats,
);
carsRouter.get(
  "/admin/analytics/events/stream",
  requireAuthForEventStream,
  requirePermission("carsRead"),
  streamAdminCarEvents,
);
carsRouter.post(
  "/admin",
  requireAuth,
  requireAnyPermission("carsCreate", "ledgerCreate"),
  validateRequestBody(createCarSchema),
  createAdminCar,
);
carsRouter.post(
  "/admin/images/presign",
  requireAuth,
  requireAnyPermission("carsCreate", "ledgerCreate"),
  validateRequestBody(presignCarImageSchema),
  presignCarImageUpload,
);
carsRouter.post(
  "/admin/images/upload",
  requireAuth,
  requireAnyPermission("carsCreate", "ledgerCreate"),
  express.raw({
    type: ["image/jpeg", "image/png", "image/webp"],
    limit: "10mb",
  }),
  uploadAdminCarImage,
);
carsRouter.get(
  "/admin/models",
  requireAuth,
  requireAnyPermission("carsRead", "carsCreate", "ledgerCreate"),
  getAdminModels,
);
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

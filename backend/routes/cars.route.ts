import { Router } from "express";
import {
  createAdminCar,
  deleteAdminCar,
  getAdminCarById,
  getAdminCars,
  getCarByReference,
  getCarsMeta,
  getCars,
  presignCarImageUpload,
  replaceAdminCarImages,
  submitCarInquiry,
  updateAdminCar,
} from "../controllers/cars.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateRequestBody } from "../middlewares/validate-request.middleware.js";
import {
  carInquirySchema,
  createCarSchema,
  presignCarImageSchema,
  replaceCarImagesSchema,
  updateCarSchema,
} from "../validations/cars.validation.js";

export const carsRouter = Router();

carsRouter.get("/", getCars);
carsRouter.get("/meta", getCarsMeta);

carsRouter.get("/admin", requireAuth, getAdminCars);
carsRouter.post(
  "/admin",
  requireAuth,
  validateRequestBody(createCarSchema),
  createAdminCar,
);
carsRouter.post(
  "/admin/images/presign",
  requireAuth,
  validateRequestBody(presignCarImageSchema),
  presignCarImageUpload,
);
carsRouter.get("/admin/:id", requireAuth, getAdminCarById);
carsRouter.patch(
  "/admin/:id",
  requireAuth,
  validateRequestBody(updateCarSchema),
  updateAdminCar,
);
carsRouter.delete("/admin/:id", requireAuth, deleteAdminCar);
carsRouter.put(
  "/admin/:id/images",
  requireAuth,
  validateRequestBody(replaceCarImagesSchema),
  replaceAdminCarImages,
);

carsRouter.get("/:referenceNo", getCarByReference);
carsRouter.post(
  "/:referenceNo/inquire",
  validateRequestBody(carInquirySchema),
  submitCarInquiry,
);

import { Router } from "express";
import {
  applyToJob,
  createAdminJob,
  deleteAdminJob,
  getAdminJobs,
  getJobBySlug,
  getJobs,
  getMyJobApplicationStatus,
  updateAdminJob,
} from "../controllers/jobs.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateRequestBody } from "../middlewares/validate-request.middleware.js";
import {
  applyJobSchema,
  createJobSchema,
  updateJobSchema,
} from "../validations/jobs.validation.js";

export const jobsRouter = Router();

jobsRouter.get("/", getJobs);
jobsRouter.get("/admin", requireAuth, getAdminJobs);
jobsRouter.post(
  "/admin",
  requireAuth,
  validateRequestBody(createJobSchema),
  createAdminJob,
);
jobsRouter.patch(
  "/admin/:id",
  requireAuth,
  validateRequestBody(updateJobSchema),
  updateAdminJob,
);
jobsRouter.delete("/admin/:id", requireAuth, deleteAdminJob);

jobsRouter.post(
  "/:jobId/apply",
  requireAuth,
  validateRequestBody(applyJobSchema),
  applyToJob,
);
jobsRouter.get("/:jobId/apply-status", requireAuth, getMyJobApplicationStatus);
jobsRouter.get("/:slug", getJobBySlug);

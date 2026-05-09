import { Router } from "express";
import {
  getAdminReviews,
  createReview,
  createBuyerReviewEligibility,
  createReviewEligibility,
  getMyReviews,
  getMyPendingReviewEligibilities,
  getReviewEligibilities,
  getReviews,
  getReviewSummary,
  updateReview,
} from "../controllers/reviews.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateRequestBody } from "../middlewares/validate-request.middleware.js";
import {
  createBuyerReviewEligibilitySchema,
  createReviewEligibilitySchema,
  createReviewSchema,
  updateReviewSchema,
} from "../validations/reviews.validation.js";

export const reviewsRouter = Router();

reviewsRouter.get("/", getReviews);
reviewsRouter.get("/summary", getReviewSummary);
reviewsRouter.get("/admin", requireAuth, getAdminReviews);

reviewsRouter.get("/me", requireAuth, getMyReviews);
reviewsRouter.get("/me/eligibility", requireAuth, getMyPendingReviewEligibilities);
reviewsRouter.post(
  "/",
  requireAuth,
  validateRequestBody(createReviewSchema),
  createReview,
);
reviewsRouter.patch(
  "/:id",
  requireAuth,
  validateRequestBody(updateReviewSchema),
  updateReview,
);

reviewsRouter.post(
  "/eligibility/buyer",
  requireAuth,
  validateRequestBody(createBuyerReviewEligibilitySchema),
  createBuyerReviewEligibility,
);
reviewsRouter.post(
  "/eligibility",
  requireAuth,
  validateRequestBody(createReviewEligibilitySchema),
  createReviewEligibility,
);
reviewsRouter.get("/eligibility", requireAuth, getReviewEligibilities);

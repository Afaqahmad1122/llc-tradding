import { Router } from "express";
import {
  createReview,
  createReviewEligibility,
  getMyReviews,
  getReviewEligibilities,
  getReviews,
  getReviewSummary,
  updateReview,
} from "../controllers/reviews.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateRequestBody } from "../middlewares/validate-request.middleware.js";
import {
  createReviewEligibilitySchema,
  createReviewSchema,
  updateReviewSchema,
} from "../validations/reviews.validation.js";

export const reviewsRouter = Router();

reviewsRouter.get("/", getReviews);
reviewsRouter.get("/summary", getReviewSummary);

reviewsRouter.get("/me", requireAuth, getMyReviews);
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
  "/eligibility",
  requireAuth,
  validateRequestBody(createReviewEligibilitySchema),
  createReviewEligibility,
);
reviewsRouter.get("/eligibility", requireAuth, getReviewEligibilities);

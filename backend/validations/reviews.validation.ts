import { z } from "zod";

const trimmedString = z.string().trim();
const optionalTrimmed = z.string().trim().optional();

export const createReviewSchema = z.object({
  invoiceReference: trimmedString.min(1, "invoiceReference is required"),
  rating: z
    .number({ invalid_type_error: "rating must be a number" })
    .int("rating must be an integer")
    .min(1, "rating must be at least 1")
    .max(5, "rating cannot be more than 5"),
  comment: trimmedString.min(10, "comment must be at least 10 characters"),
  title: optionalTrimmed,
  country: optionalTrimmed,
  carId: optionalTrimmed,
});

export const updateReviewSchema = z
  .object({
    rating: z
      .number({ invalid_type_error: "rating must be a number" })
      .int("rating must be an integer")
      .min(1, "rating must be at least 1")
      .max(5, "rating cannot be more than 5")
      .optional(),
    comment: trimmedString.min(10, "comment must be at least 10 characters").optional(),
    title: optionalTrimmed,
    country: optionalTrimmed,
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "at least one field is required",
  });

export const createReviewEligibilitySchema = z.object({
  userId: trimmedString.min(1, "userId is required"),
  invoiceReference: trimmedString.min(1, "invoiceReference is required"),
  carId: optionalTrimmed,
  expiresAt: z
    .string()
    .datetime("expiresAt must be a valid ISO datetime")
    .optional(),
});

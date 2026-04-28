import { z } from "zod";

const trimmedString = z.string().trim();
const optionalTrimmed = z.string().trim().optional();

export const createJobSchema = z.object({
  title: trimmedString.min(2, "title must be at least 2 characters"),
  slug: trimmedString.min(2, "slug must be at least 2 characters"),
  location: optionalTrimmed,
  type: optionalTrimmed,
  description: trimmedString.min(
    10,
    "description must be at least 10 characters",
  ),
  applyEmail: z
    .string()
    .trim()
    .email("applyEmail must be a valid email")
    .optional(),
  isActive: z.boolean().optional(),
});

export const updateJobSchema = z
  .object({
    title: trimmedString
      .min(2, "title must be at least 2 characters")
      .optional(),
    slug: trimmedString.min(2, "slug must be at least 2 characters").optional(),
    location: optionalTrimmed,
    type: optionalTrimmed,
    description: trimmedString
      .min(10, "description must be at least 10 characters")
      .optional(),
    applyEmail: z
      .string()
      .trim()
      .email("applyEmail must be a valid email")
      .optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "at least one field is required",
  });

export const applyJobSchema = z.object({
  note: z
    .string()
    .trim()
    .max(2000, "note cannot exceed 2000 characters")
    .optional(),
});

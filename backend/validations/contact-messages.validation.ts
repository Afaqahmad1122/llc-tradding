import { z } from "zod";

const trimmedString = z.string().trim();
const optionalTrimmed = z.string().trim().optional();

const contactMessageStatuses = ["NEW", "IN_REVIEW", "RESOLVED", "SPAM"] as const;

export const createContactMessageSchema = z.object({
  name: trimmedString.min(2, "name must be at least 2 characters").max(120),
  email: trimmedString.email("email must be a valid email address").max(254),
  phone: trimmedString.min(6, "phone must be at least 6 characters").max(40),
  country: optionalTrimmed,
  city: optionalTrimmed,
  company: optionalTrimmed,
  vehicleRequirement: optionalTrimmed,
  message: trimmedString
    .min(10, "message must be at least 10 characters")
    .max(2000, "message cannot exceed 2000 characters"),
});

export const updateContactMessageSchema = z
  .object({
    status: z.enum(contactMessageStatuses).optional(),
    adminNote: z.string().trim().max(2000).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "at least one field is required",
  });

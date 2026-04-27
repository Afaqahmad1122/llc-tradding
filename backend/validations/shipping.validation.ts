import { z } from "zod";

const trimmedString = z.string().trim();
const optionalTrimmed = z.string().trim().optional();
const optionalSortOrder = z
  .number({ invalid_type_error: "sortOrder must be a number" })
  .int("sortOrder must be an integer")
  .min(0, "sortOrder must be at least 0")
  .optional();

export const createShippingRegionSchema = z.object({
  name: trimmedString.min(1, "name is required"),
  slug: trimmedString
    .min(1, "slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug format is invalid"),
  sortOrder: optionalSortOrder,
  isActive: z.boolean({ invalid_type_error: "isActive must be a boolean" }).optional(),
});

export const updateShippingRegionSchema = z
  .object({
    name: optionalTrimmed,
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug format is invalid")
      .optional(),
    sortOrder: optionalSortOrder,
    isActive: z.boolean({ invalid_type_error: "isActive must be a boolean" }).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "at least one field is required",
  });

export const createShippingScheduleSchema = z.object({
  company: trimmedString.min(1, "company is required"),
  shipName: trimmedString.min(1, "shipName is required"),
  voyage: trimmedString.min(1, "voyage is required"),
  sortOrder: optionalSortOrder,
  isActive: z.boolean({ invalid_type_error: "isActive must be a boolean" }).optional(),
});

export const updateShippingScheduleSchema = z
  .object({
    company: optionalTrimmed,
    shipName: optionalTrimmed,
    voyage: optionalTrimmed,
    sortOrder: optionalSortOrder,
    isActive: z.boolean({ invalid_type_error: "isActive must be a boolean" }).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "at least one field is required",
  });

const shippingDepartureEntrySchema = z.object({
  portName: trimmedString.min(1, "portName is required"),
  etdText: trimmedString.min(1, "etdText is required"),
  sortOrder: optionalSortOrder,
});

const shippingArrivalEntrySchema = z.object({
  portName: trimmedString.min(1, "portName is required"),
  etaText: trimmedString.min(1, "etaText is required"),
  sortOrder: optionalSortOrder,
});

export const replaceShippingDeparturesSchema = z.object({
  entries: z.array(shippingDepartureEntrySchema, {
    invalid_type_error: "entries must be an array",
  }),
});

export const replaceShippingArrivalsSchema = z.object({
  entries: z.array(shippingArrivalEntrySchema, {
    invalid_type_error: "entries must be an array",
  }),
});

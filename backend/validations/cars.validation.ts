import { z } from "zod";

const trimmed = z.string().trim();
const optionalTrimmed = trimmed.optional();

const fuelEnum = z.enum([
  "GASOLINE",
  "DIESEL",
  "HYBRID",
  "ELECTRIC",
  "PETROL",
  "CNG",
  "LPG",
  "OTHER",
]);
const transmissionEnum = z.enum(["AT", "MT", "CVT", "OTHER"]);
const steeringEnum = z.enum(["RHD", "LHD", "OTHER"]);

const imageContentTypeEnum = z.enum([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const imageExtEnum = z.enum(["jpg", "jpeg", "png", "webp"]);

export const presignCarImageSchema = z.object({
  contentType: imageContentTypeEnum,
  ext: imageExtEnum,
});

export const carImageInputSchema = z.object({
  url: trimmed.url("image url must be a valid URL"),
  key: optionalTrimmed,
  altText: trimmed.max(200).optional(),
  position: z.number().int().min(0).max(100).optional(),
  isPrimary: z.boolean().optional(),
});

const baseCarFields = {
  referenceNo: trimmed.min(1).max(64),
  title: trimmed.max(200).optional(),
  modelId: trimmed.min(1),
  year: z.number().int().min(1900).max(2100),
  mileage: z.number().int().min(0).max(10_000_000).optional(),
  mileageUnit: trimmed.max(8).optional(),
  priceUsd: z.number().positive().max(10_000_000),
  pricePkr: z.number().positive().max(1_000_000_000_000),
  priceJpy: z.number().positive().max(1_000_000_000_000),
  fuel: fuelEnum.optional(),
  transmission: transmissionEnum.optional(),
  seats: z.number().int().min(1).max(50).optional(),
  color: trimmed.max(64).optional(),
  drive: trimmed.max(32).optional(),
  doors: z.number().int().min(1).max(10).optional(),
  steering: steeringEnum.optional(),
  engineCc: z.number().int().min(0).max(20_000).optional(),
  engineCode: trimmed.max(64).optional(),
  modelCode: trimmed.max(64).optional(),
  chassisNo: trimmed.max(64).optional(),
  country: trimmed.max(64).optional(),
  city: trimmed.max(64).optional(),
  specifications: z.record(z.string(), z.unknown()).optional(),
  features: z.record(z.string(), z.unknown()).optional(),
  isPublished: z.boolean().optional(),
  images: z.array(carImageInputSchema).max(30).optional(),
};

export const createCarSchema = z.object(baseCarFields);

export const createCarModelSchema = z.object({
  name: trimmed.min(1, "model name is required").max(80),
});

export const updateCarSchema = z
  .object({
    referenceNo: baseCarFields.referenceNo.optional(),
    title: baseCarFields.title,
    modelId: baseCarFields.modelId.optional(),
    year: baseCarFields.year.optional(),
    mileage: baseCarFields.mileage,
    mileageUnit: baseCarFields.mileageUnit,
    priceUsd: baseCarFields.priceUsd.optional(),
    pricePkr: baseCarFields.pricePkr.optional(),
    priceJpy: baseCarFields.priceJpy.optional(),
    fuel: baseCarFields.fuel,
    transmission: baseCarFields.transmission,
    seats: baseCarFields.seats,
    color: baseCarFields.color,
    drive: baseCarFields.drive,
    doors: baseCarFields.doors,
    steering: baseCarFields.steering,
    engineCc: baseCarFields.engineCc,
    engineCode: baseCarFields.engineCode,
    modelCode: baseCarFields.modelCode,
    chassisNo: baseCarFields.chassisNo,
    country: baseCarFields.country,
    city: baseCarFields.city,
    specifications: baseCarFields.specifications,
    features: baseCarFields.features,
    isPublished: baseCarFields.isPublished,
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "at least one field is required",
  });

export const replaceCarImagesSchema = z.object({
  images: z.array(carImageInputSchema).max(30),
});

export const carInquirySchema = z.object({
  name: trimmed.min(1).max(128),
  email: trimmed.email(),
  phone: trimmed.min(1).max(32),
  destinationCountry: trimmed.max(64).optional(),
  destinationPort: trimmed.max(64).optional(),
  message: trimmed.max(2000).optional(),
});

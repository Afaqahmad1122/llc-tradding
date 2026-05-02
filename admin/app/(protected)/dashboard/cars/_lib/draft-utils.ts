import { ApiError } from "@/lib/api/client";
import type {
  AdminCar,
  AdminCarImage,
  CarImageInput,
} from "@/lib/api/cars";

export type ImageDraftRow = {
  uid: string;
  url: string;
  key: string;
  altText: string;
  isPrimary: boolean;
};

export type CarFormDraft = {
  referenceNo: string;
  title: string;
  modelId: string;
  year: string;
  mileage: string;
  mileageUnit: string;
  priceUsd: string;
  pricePkr: string;
  fuel: string;
  transmission: string;
  steering: string;
  seats: string;
  doors: string;
  engineCc: string;
  engineCode: string;
  modelCode: string;
  chassisNo: string;
  color: string;
  drive: string;
  country: string;
  city: string;
  specsJson: string;
  featuresJson: string;
  isPublished: boolean;
};

export function formatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Request failed";
}

export function formatUsd(value: string | null): string {
  const n = value == null ? NaN : Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function adminImageToDraft(
  img: AdminCarImage,
  uid?: string,
): ImageDraftRow {
  return {
    uid: uid ?? crypto.randomUUID(),
    url: img.url,
    key: img.key ?? "",
    altText: img.altText ?? "",
    isPrimary: img.isPrimary,
  };
}

export function emptyCarDraft(modelId = ""): CarFormDraft {
  return {
    referenceNo: "",
    title: "",
    modelId,
    year: "",
    mileage: "",
    mileageUnit: "km",
    priceUsd: "",
    pricePkr: "",
    fuel: "",
    transmission: "",
    steering: "",
    seats: "",
    doors: "",
    engineCc: "",
    engineCode: "",
    modelCode: "",
    chassisNo: "",
    color: "",
    drive: "",
    country: "",
    city: "",
    specsJson: "",
    featuresJson: "",
    isPublished: true,
  };
}

export function carToDraft(car: AdminCar): CarFormDraft {
  return {
    referenceNo: car.referenceNo,
    title: car.title ?? "",
    modelId: car.model.id,
    year: String(car.year),
    mileage: car.mileage != null ? String(car.mileage) : "",
    mileageUnit: car.mileageUnit ?? "km",
    priceUsd: String(car.priceUsd),
    pricePkr: car.pricePkr ? String(car.pricePkr) : "",
    fuel: car.fuel ?? "",
    transmission: car.transmission ?? "",
    steering: car.steering ?? "",
    seats: car.seats != null ? String(car.seats) : "",
    doors: car.doors != null ? String(car.doors) : "",
    engineCc: car.engineCc != null ? String(car.engineCc) : "",
    engineCode: car.engineCode ?? "",
    modelCode: car.modelCode ?? "",
    chassisNo: car.chassisNo ?? "",
    color: car.color ?? "",
    drive: car.drive ?? "",
    country: car.country ?? "",
    city: car.city ?? "",
    specsJson: car.specifications
      ? JSON.stringify(car.specifications, null, 2)
      : "",
    featuresJson: car.features ? JSON.stringify(car.features, null, 2) : "",
    isPublished: car.isPublished,
  };
}

export function parseOptionalPositiveInt(raw: string): number | undefined {
  const s = raw.trim();
  if (!s) return undefined;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
}

export function parseRequiredYear(raw: string): number | null {
  const n = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(n) || n < 1900 || n > 2100) return null;
  return n;
}

export function parseRequiredUsd(raw: string): number | null {
  const n = Number.parseFloat(raw.trim());
  if (!Number.isFinite(n) || n <= 0 || n > 10_000_000) return null;
  return n;
}

function parseOptionalJsonRecord(
  raw: string,
  label: string,
): Record<string, unknown> | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<string, unknown>;
    }
    throw new Error(`${label} must be a JSON object`);
  } catch {
    throw new Error(`Invalid JSON for ${label}`);
  }
}

export function draftToImageInputs(images: ImageDraftRow[]): CarImageInput[] {
  return images.map((img, index) => ({
    url: img.url.trim(),
    ...(img.key.trim() ? { key: img.key.trim() } : {}),
    ...(img.altText.trim() ? { altText: img.altText.trim() } : {}),
    position: index,
    isPrimary: img.isPrimary,
  }));
}

export function validateCarDraft(
  draft: CarFormDraft,
  images: ImageDraftRow[],
  requireReference: boolean,
): string | null {
  if (requireReference && !draft.referenceNo.trim()) {
    return "Reference number is required.";
  }
  if (!draft.modelId.trim()) return "Vehicle model is required.";
  const year = parseRequiredYear(draft.year);
  if (year === null) return "Year must be a number between 1900 and 2100.";
  const priceUsd = parseRequiredUsd(draft.priceUsd);
  if (priceUsd === null) return "USD price must be a positive number.";

  for (const row of images) {
    const trimmed = row.url.trim();
    try {
      new URL(trimmed);
    } catch {
      const tail = trimmed.length > 48 ? "…" : "";
      return `Image URL "${trimmed.slice(0, 48)}${tail}" is invalid.`;
    }
  }

  try {
    parseOptionalJsonRecord(draft.specsJson, "specifications");
    parseOptionalJsonRecord(draft.featuresJson, "features");
  } catch (e) {
    return formatErrorMessage(e);
  }

  const primaries = images.filter((i) => i.isPrimary);
  if (primaries.length > 1) return "Choose at most one primary image.";

  return null;
}

export function buildMutationBodyBase(
  draft: CarFormDraft,
): Record<string, unknown> {
  const year = parseRequiredYear(draft.year);
  const priceUsd = parseRequiredUsd(draft.priceUsd);
  if (year == null || priceUsd == null) {
    throw new Error("Validation failed.");
  }
  const body: Record<string, unknown> = {
    referenceNo: draft.referenceNo.trim().toUpperCase(),
    modelId: draft.modelId.trim(),
    year,
    priceUsd,
    ...(draft.title.trim() ? { title: draft.title.trim() } : {}),
    ...(parseOptionalPositiveInt(draft.mileage) != null
      ? { mileage: parseOptionalPositiveInt(draft.mileage)! }
      : {}),
    ...(draft.mileageUnit.trim()
      ? { mileageUnit: draft.mileageUnit.trim() }
      : {}),
    ...(parseOptionalPositiveInt(draft.pricePkr) != null
      ? { pricePkr: parseOptionalPositiveInt(draft.pricePkr)! }
      : {}),
    ...(draft.fuel.trim() ? { fuel: draft.fuel } : {}),
    ...(draft.transmission.trim()
      ? { transmission: draft.transmission }
      : {}),
    ...(draft.steering.trim() ? { steering: draft.steering } : {}),
    ...(parseOptionalPositiveInt(draft.seats) != null
      ? { seats: parseOptionalPositiveInt(draft.seats)! }
      : {}),
    ...(parseOptionalPositiveInt(draft.doors) != null
      ? { doors: parseOptionalPositiveInt(draft.doors)! }
      : {}),
    ...(parseOptionalPositiveInt(draft.engineCc) != null
      ? { engineCc: parseOptionalPositiveInt(draft.engineCc)! }
      : {}),
    ...(draft.engineCode.trim() ? { engineCode: draft.engineCode.trim() } : {}),
    ...(draft.modelCode.trim() ? { modelCode: draft.modelCode.trim() } : {}),
    ...(draft.chassisNo.trim()
      ? { chassisNo: draft.chassisNo.trim().toUpperCase() }
      : {}),
    ...(draft.color.trim() ? { color: draft.color.trim() } : {}),
    ...(draft.drive.trim() ? { drive: draft.drive.trim() } : {}),
    ...(draft.country.trim() ? { country: draft.country.trim() } : {}),
    ...(draft.city.trim() ? { city: draft.city.trim() } : {}),
    isPublished: draft.isPublished,
    specifications:
      parseOptionalJsonRecord(draft.specsJson, "specifications") ?? undefined,
    features:
      parseOptionalJsonRecord(draft.featuresJson, "features") ?? undefined,
  };

  Object.keys(body).forEach((k) => {
    if (body[k] === undefined) delete body[k];
  });
  return body;
}

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

/** One row in the specifications / features editors (flat key → value). */
export type CarKvRow = {
  id: string;
  key: string;
  kind: "text" | "number" | "yesNo" | "json";
  text: string;
  yesNo: boolean;
};

export function newCarKvRow(): CarKvRow {
  return {
    id: crypto.randomUUID(),
    key: "",
    kind: "text",
    text: "",
    yesNo: false,
  };
}

export function recordToKvRows(
  record: Record<string, unknown> | null | undefined,
): CarKvRow[] {
  if (!record || typeof record !== "object") return [];
  return Object.entries(record).map(([key, value]) => {
    const id = crypto.randomUUID();
    if (value === null || value === undefined) {
      return { id, key, kind: "text" as const, text: "", yesNo: false };
    }
    if (typeof value === "boolean") {
      return { id, key, kind: "yesNo" as const, text: "", yesNo: value };
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return { id, key, kind: "number" as const, text: String(value), yesNo: false };
    }
    if (typeof value === "string") {
      return { id, key, kind: "text" as const, text: value, yesNo: false };
    }
    return {
      id,
      key,
      kind: "json" as const,
      text: JSON.stringify(value),
      yesNo: false,
    };
  });
}

export function kvRowsToRecord(
  rows: CarKvRow[],
  label: string,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const row of rows) {
    const k = row.key.trim();
    if (!k) continue;
    switch (row.kind) {
      case "text":
        out[k] = row.text;
        break;
      case "number": {
        const n = Number.parseFloat(row.text.trim());
        if (!Number.isFinite(n)) {
          throw new Error(`${label}: "${k}" must be a valid number.`);
        }
        out[k] = n;
        break;
      }
      case "yesNo":
        out[k] = row.yesNo;
        break;
      case "json": {
        const raw = row.text.trim();
        if (!raw) {
          throw new Error(`${label}: "${k}" needs valid JSON.`);
        }
        try {
          out[k] = JSON.parse(raw) as unknown;
        } catch {
          throw new Error(`${label}: "${k}" has invalid JSON.`);
        }
        break;
      }
    }
  }
  return out;
}

function validateKvRows(rows: CarKvRow[], label: string): string | null {
  const seen = new Set<string>();
  for (const row of rows) {
    const k = row.key.trim();
    if (!k) continue;
    if (seen.has(k)) {
      return `${label}: duplicate name "${k}".`;
    }
    seen.add(k);
  }
  try {
    kvRowsToRecord(rows, label);
  } catch (e) {
    return formatErrorMessage(e);
  }
  return null;
}

export type CarFormDraft = {
  referenceNo: string;
  title: string;
  modelId: string;
  year: string;
  mileage: string;
  mileageUnit: string;
  priceUsd: string;
  pricePkr: string;
  priceJpy: string;
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
  specsRows: CarKvRow[];
  featuresRows: CarKvRow[];
  isPublished: boolean;
  inStock: boolean;
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

export function formatCurrency(
  value: string | null,
  currency: "PKR" | "JPY",
): string {
  const n = value == null ? NaN : Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
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
    priceJpy: "",
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
    specsRows: [],
    featuresRows: [],
    isPublished: true,
    inStock: true,
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
    priceUsd: car.priceUsd ? String(car.priceUsd) : "",
    pricePkr: car.pricePkr ? String(car.pricePkr) : "",
    priceJpy: car.priceJpy ? String(car.priceJpy) : "",
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
    specsRows: recordToKvRows(car.specifications ?? undefined),
    featuresRows: recordToKvRows(car.features ?? undefined),
    isPublished: car.isPublished,
    inStock: car.inStock,
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

export function parseOptionalUsd(raw: string): number | null | undefined {
  const s = raw.trim();
  if (!s) return null;
  const n = Number.parseFloat(s);
  if (!Number.isFinite(n) || n <= 0 || n > 10_000_000) return undefined;
  return n;
}

export function parseRequiredCurrencyInt(
  raw: string,
  max: number,
): number | null {
  const n = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}

export function parseOptionalCurrencyInt(
  raw: string,
  max: number,
): number | null | undefined {
  const s = raw.trim();
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  if (!Number.isFinite(n) || n <= 0 || n > max) return undefined;
  return n;
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
  const priceUsd = parseOptionalUsd(draft.priceUsd);
  if (priceUsd === undefined) return "USD price must be a positive number.";
  const pricePkr = parseOptionalCurrencyInt(
    draft.pricePkr,
    1_000_000_000_000,
  );
  if (pricePkr === undefined) return "PKR price must be a positive number.";
  const priceJpy = parseOptionalCurrencyInt(
    draft.priceJpy,
    1_000_000_000_000,
  );
  if (priceJpy === undefined) return "JPY price must be a positive number.";

  for (const row of images) {
    const trimmed = row.url.trim();
    try {
      new URL(trimmed);
    } catch {
      const tail = trimmed.length > 48 ? "…" : "";
      return `Image URL "${trimmed.slice(0, 48)}${tail}" is invalid.`;
    }
  }

  const specsErr = validateKvRows(draft.specsRows, "Specifications");
  if (specsErr) return specsErr;
  const featuresErr = validateKvRows(draft.featuresRows, "Features");
  if (featuresErr) return featuresErr;

  const primaries = images.filter((i) => i.isPrimary);
  if (primaries.length > 1) return "Choose at most one primary image.";

  return null;
}

export function buildMutationBodyBase(
  draft: CarFormDraft,
): Record<string, unknown> {
  const year = parseRequiredYear(draft.year);
  const priceUsd = parseOptionalUsd(draft.priceUsd);
  const pricePkr = parseOptionalCurrencyInt(
    draft.pricePkr,
    1_000_000_000_000,
  );
  const priceJpy = parseOptionalCurrencyInt(
    draft.priceJpy,
    1_000_000_000_000,
  );
  if (
    year == null ||
    priceUsd === undefined ||
    pricePkr === undefined ||
    priceJpy === undefined
  ) {
    throw new Error("Validation failed.");
  }
  const body: Record<string, unknown> = {
    referenceNo: draft.referenceNo.trim().toUpperCase(),
    modelId: draft.modelId.trim(),
    year,
    priceUsd,
    pricePkr,
    priceJpy,
    ...(draft.title.trim() ? { title: draft.title.trim() } : {}),
    ...(parseOptionalPositiveInt(draft.mileage) != null
      ? { mileage: parseOptionalPositiveInt(draft.mileage)! }
      : {}),
    ...(draft.mileageUnit.trim()
      ? { mileageUnit: draft.mileageUnit.trim() }
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
    inStock: draft.inStock,
    ...(() => {
      const specifications = kvRowsToRecord(draft.specsRows, "Specifications");
      const features = kvRowsToRecord(draft.featuresRows, "Features");
      return {
        ...(Object.keys(specifications).length ? { specifications } : {}),
        ...(Object.keys(features).length ? { features } : {}),
      };
    })(),
  };

  Object.keys(body).forEach((k) => {
    if (body[k] === undefined) delete body[k];
  });
  return body;
}

import { http } from "@/lib/api/http";

export type PublicCarModel = {
  id: string;
  name: string;
  brand: string;
  slug: string;
  bodyType: string | null;
};

export type PublicCarImage = {
  id: string;
  url: string;
  altText: string | null;
  position: number;
  isPrimary: boolean;
};

export type PublicCar = {
  id: string;
  referenceNo: string;
  title: string | null;
  year: number;
  mileage: number | null;
  mileageUnit: string;
  /** Prisma Decimal */
  priceUsd: string | null;
  pricePkr: string | null;
  priceJpy: string | null;
  fuel: string | null;
  transmission: string | null;
  seats: number | null;
  color: string | null;
  drive: string | null;
  doors: number | null;
  steering: string | null;
  engineCc: number | null;
  engineCode: string | null;
  modelCode: string | null;
  chassisNo: string | null;
  country: string | null;
  city: string | null;
  specifications: Record<string, unknown> | null;
  features: Record<string, unknown> | null;
  inStock: boolean;
  createdAt: string;
  model: PublicCarModel;
  images: PublicCarImage[];
};

export type CarsPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CarsListResponse = {
  data: PublicCar[];
  pagination: CarsPagination;
};

export type CategoryCounts = {
  newArrivals: number;
  clearance: number;
  thirdParty: number;
  machinery: number;
  uaeStock: number;
  thailandStock: number;
};

export type CarsMetaResponse = {
  brands: string[];
  models: PublicCarModel[];
  yearRange: { min: number | null; max: number | null };
  priceRange: { min: string | null; max: string | null };
  categoryCounts?: CategoryCounts;
};

export type PublicCarsQuery = {
  page?: number;
  pageSize?: number;
  brand?: string;
  bodyType?: string;
  modelId?: string;
  search?: string;
  sort?: "latest" | "oldest" | "priceAsc" | "priceDesc";
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  fuel?: string;
  transmission?: string;
  steering?: string;
  modelCode?: string;
};

function appendNumberParam(sp: URLSearchParams, key: string, value: number) {
  if (Number.isFinite(value)) sp.set(key, String(value));
}

export function fetchPublicCars(params: PublicCarsQuery = {}) {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.pageSize != null)
    searchParams.set("pageSize", String(params.pageSize));
  if (params.brand?.trim()) searchParams.set("brand", params.brand.trim());
  if (params.bodyType?.trim())
    searchParams.set("bodyType", params.bodyType.trim());
  if (params.modelId?.trim())
    searchParams.set("modelId", params.modelId.trim());
  if (params.search?.trim()) searchParams.set("search", params.search.trim());
  if (
    params.sort === "oldest" ||
    params.sort === "priceAsc" ||
    params.sort === "priceDesc"
  ) {
    searchParams.set("sort", params.sort);
  }
  if (params.yearMin != null)
    appendNumberParam(searchParams, "yearMin", params.yearMin);
  if (params.yearMax != null)
    appendNumberParam(searchParams, "yearMax", params.yearMax);
  if (params.priceMin != null)
    appendNumberParam(searchParams, "priceMin", params.priceMin);
  if (params.priceMax != null)
    appendNumberParam(searchParams, "priceMax", params.priceMax);
  if (params.fuel?.trim()) searchParams.set("fuel", params.fuel.trim());
  if (params.transmission?.trim())
    searchParams.set("transmission", params.transmission.trim());
  if (params.steering?.trim())
    searchParams.set("steering", params.steering.trim());
  if (params.modelCode?.trim())
    searchParams.set("modelCode", params.modelCode.trim());

  const qs = searchParams.toString();
  return http.get<CarsListResponse>(
    `/cars${qs ? `?${qs}` : ""}`,
  );
}

export function fetchCarsMeta() {
  return http.get<CarsMetaResponse>("/cars/meta");
}

export type PublicCarDetailResponse = {
  car: PublicCar;
  similarCars: PublicCar[];
};

export function fetchPublicCarByReference(referenceNo: string) {
  const ref = referenceNo.trim().toUpperCase();
  return http.get<PublicCarDetailResponse>(
    `/cars/${encodeURIComponent(ref)}`,
  );
}

export type CarInquiryPayload = {
  name: string;
  email: string;
  phone: string;
  destinationCountry?: string;
  destinationPort?: string;
  message?: string;
};

export function submitCarInquiry(
  referenceNo: string,
  body: CarInquiryPayload,
) {
  const ref = referenceNo.trim().toUpperCase();
  return http.post<{ message: string }>(
    `/cars/${encodeURIComponent(ref)}/inquire`,
    body,
  );
}

export type CarEventType = "DETAIL_VIEW" | "WHATSAPP_CLICK" | "EMAIL_CLICK";

export function trackCarEvent(referenceNo: string, type: CarEventType) {
  const ref = referenceNo.trim().toUpperCase();
  return http.post<{ success: boolean }>(
    `/cars/${encodeURIComponent(ref)}/events`,
    { type },
  );
}

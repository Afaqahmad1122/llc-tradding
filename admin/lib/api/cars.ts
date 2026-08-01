import { http } from "@/lib/api/http";

export type CarModelSummary = {
  id: string;
  name: string;
  brand: string;
  slug: string;
  bodyType: string | null;
};

export type AdminCarImage = {
  id: string;
  url: string;
  key: string | null;
  altText: string | null;
  position: number;
  isPrimary: boolean;
};

export type AdminCar = {
  id: string;
  referenceNo: string;
  title: string | null;
  year: number;
  mileage: number | null;
  mileageUnit: string;
  /** Prisma Decimal serializes as string in JSON */
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
  createdAt: string;
  isPublished: boolean;
  createdById: string | null;
  createdByAdmin: boolean;
  updatedAt: string;
  model: CarModelSummary;
  images: AdminCarImage[];
};

export type AdminCarsPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminCarsResponse = {
  data: AdminCar[];
  pagination: AdminCarsPagination;
};

export type AdminCarsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: "latest" | "oldest" | "priceAsc" | "priceDesc";
  isPublished?: boolean;
  createdById?: string;
};

export type CarFuel =
  | "GASOLINE"
  | "DIESEL"
  | "HYBRID"
  | "ELECTRIC"
  | "PETROL"
  | "CNG"
  | "LPG"
  | "OTHER";

export type CarTransmission = "AT" | "MT" | "CVT" | "OTHER";

export type CarSteering = "RHD" | "LHD" | "OTHER";

export type CarImageInput = {
  url: string;
  key?: string;
  altText?: string;
  position?: number;
  isPrimary?: boolean;
};

export type CreateAdminCarBody = {
  referenceNo: string;
  title?: string;
  modelId: string;
  year: number;
  mileage?: number;
  mileageUnit?: string;
  priceUsd?: number | null;
  pricePkr?: number | null;
  priceJpy?: number | null;
  fuel?: CarFuel;
  transmission?: CarTransmission;
  seats?: number;
  color?: string;
  drive?: string;
  doors?: number;
  steering?: CarSteering;
  engineCc?: number;
  engineCode?: string;
  modelCode?: string;
  chassisNo?: string;
  country?: string;
  city?: string;
  specifications?: Record<string, unknown>;
  features?: Record<string, unknown>;
  isPublished?: boolean;
  images?: CarImageInput[];
};

export type UpdateAdminCarBody = Partial<CreateAdminCarBody>;

export type CreateAdminCarResponse = {
  car: AdminCar;
};

export type UpdateAdminCarResponse = CreateAdminCarResponse;

export type CreateAdminModelBody = {
  name: string;
};

export type CreateAdminModelResponse = {
  model: CarModelSummary;
};

export type DeleteCarResponse = {
  message: string;
};

export type PresignCarImageBody = {
  contentType: "image/jpeg" | "image/png" | "image/webp";
  ext: "jpg" | "jpeg" | "png" | "webp";
};

export type PresignCarImageResponse = {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresInSec: number;
};

export type UploadCarImageResponse = {
  key: string;
  publicUrl: string;
};

export type ReplaceCarImagesBody = {
  images: CarImageInput[];
};

export function fetchAdminCars(params: AdminCarsQuery = {}) {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.pageSize != null)
    searchParams.set("pageSize", String(params.pageSize));
  if (params.search) searchParams.set("search", params.search);
  if (params.sort === "oldest") searchParams.set("sort", "oldest");
  if (params.sort === "priceAsc") searchParams.set("sort", "priceAsc");
  if (params.sort === "priceDesc") searchParams.set("sort", "priceDesc");
  if (params.createdById) searchParams.set("createdById", params.createdById);
  if (params.isPublished === true)
    searchParams.set("isPublished", "true");
  if (params.isPublished === false)
    searchParams.set("isPublished", "false");
  const qs = searchParams.toString();
  return http.get<AdminCarsResponse>(
    `/cars/admin${qs ? `?${qs}` : ""}`,
  );
}

export function fetchAdminModels() {
  return http.get<{ models: CarModelSummary[] }>("/cars/admin/models");
}

export function createAdminModel(body: CreateAdminModelBody) {
  return http.post<CreateAdminModelResponse, CreateAdminModelBody>(
    "/cars/admin/models",
    body,
  );
}

export function fetchAdminCarById(id: string) {
  return http.get<{ car: AdminCar }>(
    `/cars/admin/${encodeURIComponent(id)}`,
  );
}

export function createAdminCar(body: CreateAdminCarBody) {
  return http.post<CreateAdminCarResponse, CreateAdminCarBody>(
    "/cars/admin",
    body,
  );
}

export function updateAdminCar(id: string, body: UpdateAdminCarBody) {
  return http.patch<UpdateAdminCarResponse, UpdateAdminCarBody>(
    `/cars/admin/${encodeURIComponent(id)}`,
    body,
  );
}

export function deleteAdminCar(id: string) {
  return http.delete<DeleteCarResponse>(
    `/cars/admin/${encodeURIComponent(id)}`,
  );
}

export function presignCarImageUpload(body: PresignCarImageBody) {
  return http.post<PresignCarImageResponse, PresignCarImageBody>(
    "/cars/admin/images/presign",
    body,
  );
}

export function uploadCarImage(file: File) {
  return http.post<UploadCarImageResponse, File>(
    "/cars/admin/images/upload",
    file,
    {
      headers: {
        "Content-Type": file.type,
      },
    },
  );
}

export function replaceAdminCarImages(id: string, body: ReplaceCarImagesBody) {
  return http.put<UpdateAdminCarResponse, ReplaceCarImagesBody>(
    `/cars/admin/${encodeURIComponent(id)}/images`,
    body,
  );
}

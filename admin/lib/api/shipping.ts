import { http } from "@/lib/api/http";

export type AdminShippingRegion = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    schedules: number;
  };
};

export type AdminShippingDepartureEntry = {
  id: string;
  portName: string;
  etdText: string;
  sortOrder: number;
};

export type AdminShippingArrivalEntry = {
  id: string;
  portName: string;
  etaText: string;
  sortOrder: number;
};

export type AdminShippingSchedule = {
  id: string;
  regionId: string;
  company: string;
  shipName: string;
  voyage: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  departures: AdminShippingDepartureEntry[];
  arrivals: AdminShippingArrivalEntry[];
};

export type AdminShippingPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminShippingRegionsResponse = {
  data: AdminShippingRegion[];
  pagination: AdminShippingPagination;
};

export type AdminShippingRegionsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  sort?: "latest" | "oldest" | "name";
};

export type CreateAdminShippingRegionBody = {
  name: string;
  slug: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdateAdminShippingRegionBody =
  Partial<CreateAdminShippingRegionBody>;

export type CreateAdminShippingRegionResponse = {
  region: AdminShippingRegion;
};

export type UpdateAdminShippingRegionResponse =
  CreateAdminShippingRegionResponse;

export type DeactivateAdminShippingRegionResponse =
  UpdateAdminShippingRegionResponse;

export type DeleteAdminShippingRegionResponse = {
  message: string;
};

export type AdminShippingRegionSummary = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export type AdminShippingSchedulesByRegionResponse = {
  region: AdminShippingRegionSummary;
  data: AdminShippingSchedule[];
};

export type CreateAdminShippingScheduleBody = {
  company: string;
  shipName: string;
  voyage: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdateAdminShippingScheduleBody =
  Partial<CreateAdminShippingScheduleBody>;

export type CreateAdminShippingScheduleResponse = {
  schedule: AdminShippingSchedule;
};

export type UpdateAdminShippingScheduleResponse =
  CreateAdminShippingScheduleResponse;

export type DeactivateAdminShippingScheduleResponse = {
  message: string;
};

export type ReplaceShippingDeparturesBody = {
  entries: Array<{
    portName: string;
    etdText: string;
    sortOrder?: number;
  }>;
};

export type ReplaceShippingArrivalsBody = {
  entries: Array<{
    portName: string;
    etaText: string;
    sortOrder?: number;
  }>;
};

export type ReplaceShippingPortsResponse = {
  schedule: AdminShippingSchedule;
};

export type GetAdminShippingScheduleResponse = {
  schedule: AdminShippingSchedule;
};

export function fetchAdminShippingRegions(params: AdminShippingRegionsQuery = {}) {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.pageSize != null) searchParams.set("pageSize", String(params.pageSize));
  if (params.search) searchParams.set("search", params.search);
  if (params.isActive === true) searchParams.set("isActive", "true");
  if (params.isActive === false) searchParams.set("isActive", "false");
  if (params.sort === "oldest") searchParams.set("sort", "oldest");
  if (params.sort === "name") searchParams.set("sort", "name");
  const qs = searchParams.toString();
  return http.get<AdminShippingRegionsResponse>(
    `/shipping/admin/regions${qs ? `?${qs}` : ""}`,
  );
}

export function createAdminShippingRegion(body: CreateAdminShippingRegionBody) {
  return http.post<CreateAdminShippingRegionResponse, CreateAdminShippingRegionBody>(
    "/shipping/admin/regions",
    body,
  );
}

export function updateAdminShippingRegion(
  id: string,
  body: UpdateAdminShippingRegionBody,
) {
  return http.patch<UpdateAdminShippingRegionResponse, UpdateAdminShippingRegionBody>(
    `/shipping/admin/regions/${encodeURIComponent(id)}`,
    body,
  );
}

/** Hides the destination from the site; data is kept. */
export function deactivateAdminShippingRegion(id: string) {
  return http.patch<
    DeactivateAdminShippingRegionResponse,
    UpdateAdminShippingRegionBody
  >(`/shipping/admin/regions/${encodeURIComponent(id)}`, {
    isActive: false,
  });
}

/** Permanently removes the region and all sailing rows (cascade). Requires admin auth on the API. */
export function deleteAdminShippingRegion(id: string) {
  return http.delete<DeleteAdminShippingRegionResponse>(
    `/shipping/admin/regions/${encodeURIComponent(id)}`,
  );
}

export function fetchAdminShippingSchedulesByRegion(regionId: string) {
  return http.get<AdminShippingSchedulesByRegionResponse>(
    `/shipping/admin/regions/${encodeURIComponent(regionId)}/schedules`,
  );
}

export function fetchAdminShippingScheduleById(scheduleId: string) {
  return http.get<GetAdminShippingScheduleResponse>(
    `/shipping/admin/schedules/${encodeURIComponent(scheduleId)}`,
  );
}

export function createAdminShippingSchedule(
  regionId: string,
  body: CreateAdminShippingScheduleBody,
) {
  return http.post<CreateAdminShippingScheduleResponse, CreateAdminShippingScheduleBody>(
    `/shipping/admin/regions/${encodeURIComponent(regionId)}/schedules`,
    body,
  );
}

export function updateAdminShippingSchedule(
  scheduleId: string,
  body: UpdateAdminShippingScheduleBody,
) {
  return http.patch<UpdateAdminShippingScheduleResponse, UpdateAdminShippingScheduleBody>(
    `/shipping/admin/schedules/${encodeURIComponent(scheduleId)}`,
    body,
  );
}

export function deactivateAdminShippingSchedule(scheduleId: string) {
  return http.delete<DeactivateAdminShippingScheduleResponse>(
    `/shipping/admin/schedules/${encodeURIComponent(scheduleId)}`,
  );
}

export function replaceAdminShippingDepartures(
  scheduleId: string,
  body: ReplaceShippingDeparturesBody,
) {
  return http.put<ReplaceShippingPortsResponse, ReplaceShippingDeparturesBody>(
    `/shipping/admin/schedules/${encodeURIComponent(scheduleId)}/departures`,
    body,
  );
}

export function replaceAdminShippingArrivals(
  scheduleId: string,
  body: ReplaceShippingArrivalsBody,
) {
  return http.put<ReplaceShippingPortsResponse, ReplaceShippingArrivalsBody>(
    `/shipping/admin/schedules/${encodeURIComponent(scheduleId)}/arrivals`,
    body,
  );
}

import { http } from "@/lib/api/http";

export type AdminJob = {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  type: string | null;
  description: string;
  applyEmail: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    applications: number;
  };
};

export type AdminJobsPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminJobsResponse = {
  data: AdminJob[];
  pagination: AdminJobsPagination;
};

export type AdminJobsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: "latest" | "oldest";
  isActive?: boolean;
};

export type CreateAdminJobBody = {
  title: string;
  slug: string;
  location?: string;
  type?: string;
  description: string;
  applyEmail?: string;
  isActive?: boolean;
};

export type UpdateAdminJobBody = Partial<CreateAdminJobBody>;

export type CreateAdminJobResponse = {
  job: Omit<AdminJob, "_count">;
};

export type UpdateAdminJobResponse = CreateAdminJobResponse;

export type DeactivateAdminJobResponse = {
  message: string;
};

export function fetchAdminJobs(params: AdminJobsQuery = {}) {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.pageSize != null) searchParams.set("pageSize", String(params.pageSize));
  if (params.search) searchParams.set("search", params.search);
  if (params.sort === "oldest") searchParams.set("sort", "oldest");
  if (params.isActive === true) searchParams.set("isActive", "true");
  if (params.isActive === false) searchParams.set("isActive", "false");
  const qs = searchParams.toString();
  return http.get<AdminJobsResponse>(
    `/jobs/admin${qs ? `?${qs}` : ""}`,
  );
}

export function createAdminJob(body: CreateAdminJobBody) {
  return http.post<CreateAdminJobResponse, CreateAdminJobBody>(
    "/jobs/admin",
    body,
  );
}

export function updateAdminJob(id: string, body: UpdateAdminJobBody) {
  return http.patch<UpdateAdminJobResponse, UpdateAdminJobBody>(
    `/jobs/admin/${encodeURIComponent(id)}`,
    body,
  );
}

export function deactivateAdminJob(id: string) {
  return http.delete<DeactivateAdminJobResponse>(
    `/jobs/admin/${encodeURIComponent(id)}`,
  );
}

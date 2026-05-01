import { http } from "@/lib/api/http";

export type ContactMessageStatus = "NEW" | "IN_REVIEW" | "RESOLVED" | "SPAM";

export type AdminContactReviewer = {
  id: string;
  name: string;
  email: string;
};

export type AdminContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string | null;
  city: string | null;
  company: string | null;
  vehicleRequirement: string | null;
  message: string;
  status: ContactMessageStatus;
  adminNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedBy: AdminContactReviewer | null;
};

export type AdminContactMessagesPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminContactMessagesResponse = {
  data: AdminContactMessage[];
  pagination: AdminContactMessagesPagination;
};

export type AdminContactMessagesQuery = {
  page?: number;
  pageSize?: number;
  status?: ContactMessageStatus;
  search?: string;
  sort?: "newest" | "oldest";
};

export function fetchAdminContactMessages(params: AdminContactMessagesQuery = {}) {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.pageSize != null) searchParams.set("pageSize", String(params.pageSize));
  if (params.status) searchParams.set("status", params.status);
  if (params.search) searchParams.set("search", params.search);
  if (params.sort === "oldest") searchParams.set("sort", "oldest");
  const qs = searchParams.toString();
  return http.get<AdminContactMessagesResponse>(
    `/contact-messages/admin${qs ? `?${qs}` : ""}`,
  );
}

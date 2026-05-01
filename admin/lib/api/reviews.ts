import { http } from "@/lib/api/http";

export type AdminReviewUser = {
  id: string;
  name: string;
  email: string;
};

export type AdminReview = {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  country: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  invoiceReference: string;
  carId: string | null;
  user: AdminReviewUser;
};

export type AdminReviewsPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminReviewsResponse = {
  data: AdminReview[];
  pagination: AdminReviewsPagination;
};

export type AdminReviewsQuery = {
  page?: number;
  pageSize?: number;
  sort?: "latest" | "oldest" | "highest";
};

export function fetchAdminReviews(params: AdminReviewsQuery = {}) {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.sort) search.set("sort", params.sort);
  const qs = search.toString();
  return http.get<AdminReviewsResponse>(
    `/reviews/admin${qs ? `?${qs}` : ""}`,
  );
}

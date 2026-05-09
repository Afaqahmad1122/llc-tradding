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

export type ReviewEligibilityAdmin = {
  id: string;
  userId: string;
  invoiceReference: string;
  carId: string | null;
  isUsed: boolean;
  expiresAt: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
};

export type ReviewEligibilitiesResponse = {
  data: ReviewEligibilityAdmin[];
  pagination: AdminReviewsPagination;
};

export type ReviewEligibilitiesQuery = {
  page?: number;
  pageSize?: number;
  userId?: string;
  invoiceReference?: string;
  isUsed?: boolean;
};

export function fetchReviewEligibilities(params: ReviewEligibilitiesQuery = {}) {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.userId != null && params.userId.trim())
    search.set("userId", params.userId.trim());
  if (params.invoiceReference != null && params.invoiceReference.trim())
    search.set("invoiceReference", params.invoiceReference.trim());
  if (params.isUsed !== undefined)
    search.set("isUsed", params.isUsed ? "true" : "false");
  const qs = search.toString();
  return http.get<ReviewEligibilitiesResponse>(
    `/reviews/eligibility${qs ? `?${qs}` : ""}`,
  );
};

export type CreateReviewEligibilityBody = {
  userId: string;
  invoiceReference: string;
  carId?: string;
  expiresAt?: string;
};

export type CreatedReviewEligibility = {
  id: string;
  userId: string;
  invoiceReference: string;
  carId: string | null;
  isUsed: boolean;
  expiresAt: string | null;
  createdAt: string;
};

export function createReviewEligibility(body: CreateReviewEligibilityBody) {
  return http.post<{ eligibility: CreatedReviewEligibility }>(
    "/reviews/eligibility",
    body,
  );
}

export type BuyerReviewEligibilityResponse = {
  eligibility: CreatedReviewEligibility;
  customer: { name: string; email: string };
  reviewCodeHint: string;
};

export function createBuyerReviewEligibility(body: {
  userId: string;
  carId?: string;
  expiresAt?: string;
}) {
  return http.post<BuyerReviewEligibilityResponse>(
    "/reviews/eligibility/buyer",
    body,
  );
}

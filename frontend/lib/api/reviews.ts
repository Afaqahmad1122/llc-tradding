import { http } from "@/lib/api/http";

export type PublicReview = {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  country: string | null;
  createdAt: string;
  invoiceReference: string;
  carId: string | null;
  user: {
    id: string;
    name: string;
  };
};

export type ReviewsListResponse = {
  data: PublicReview[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type GetPublicReviewsParams = {
  page?: number;
  pageSize?: number;
  rating?: number;
  carId?: string;
  sort?: "latest" | "oldest" | "highest";
};

export async function getPublicReviews(
  params: GetPublicReviewsParams = {},
): Promise<ReviewsListResponse> {
  return http.get<ReviewsListResponse>("/reviews", { params });
}

export type PendingReviewEligibility = {
  id: string;
  carId: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export async function getMyPendingReviewEligibilities(): Promise<{
  data: PendingReviewEligibility[];
}> {
  return http.get<{ data: PendingReviewEligibility[] }>("/reviews/me/eligibility");
}

export type CreateCustomerReviewPayload = {
  /** Preferred: server ties this to your account; no code typed by the user. */
  eligibilityId?: string;
  /** Legacy: match an invitation by reference if you still collect it. */
  invoiceReference?: string;
  rating: number;
  comment: string;
  title?: string;
  country?: string;
  carId?: string;
};

export type CustomerReviewSubmitted = {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  country: string | null;
  createdAt: string;
  invoiceReference: string;
  carId: string | null;
};

export async function createCustomerReview(
  payload: CreateCustomerReviewPayload,
): Promise<{ review: CustomerReviewSubmitted }> {
  return http.post<{ review: CustomerReviewSubmitted }, CreateCustomerReviewPayload>(
    "/reviews",
    payload,
  );
}

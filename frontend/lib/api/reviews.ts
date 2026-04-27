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

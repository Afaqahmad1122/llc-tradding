"use client";

import { useQuery } from "@tanstack/react-query";

import { getMyPendingReviewEligibilities } from "@/lib/api/reviews";
import { useAuthStore } from "@/stores/auth-store";

export const PENDING_REVIEW_ELIGIBILITY_QUERY_KEY = [
  "my-pending-review-eligibility",
] as const;

export function usePendingReviewEligibilityQuery() {
  const user = useAuthStore((state) => state.user);
  const hasBootstrapped = useAuthStore((state) => state.hasBootstrapped);

  return useQuery({
    queryKey: PENDING_REVIEW_ELIGIBILITY_QUERY_KEY,
    queryFn: () => getMyPendingReviewEligibilities(),
    enabled: Boolean(hasBootstrapped && user?.id),
    staleTime: 30_000,
  });
}

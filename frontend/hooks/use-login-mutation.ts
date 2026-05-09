"use client";

import { useQueryClient } from "@tanstack/react-query";

import { loginApi, type LoginRequest } from "@/lib/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { PENDING_REVIEW_ELIGIBILITY_QUERY_KEY } from "@/hooks/use-pending-review-eligibility-query";
import { useAuthStore } from "@/stores/auth-store";

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: (payload: LoginRequest) => loginApi(payload),
    successToast: "Logged in successfully.",
    onSuccess: ({ user, accessToken }) => {
      useAuthStore.getState().setAuthSession(user, accessToken);
      void queryClient.invalidateQueries({
        queryKey: PENDING_REVIEW_ELIGIBILITY_QUERY_KEY,
      });
    },
  });
}

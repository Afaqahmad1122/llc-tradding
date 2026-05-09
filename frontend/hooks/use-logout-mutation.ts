"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { logoutApi } from "@/lib/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { PENDING_REVIEW_ELIGIBILITY_QUERY_KEY } from "@/hooks/use-pending-review-eligibility-query";
import { useAuthStore } from "@/stores/auth-store";

export function useLogoutMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: () => logoutApi(),
    successToast: "Logged out successfully.",
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: PENDING_REVIEW_ELIGIBILITY_QUERY_KEY });
      useAuthStore.getState().clearAuth();
      router.push("/");
      router.refresh();
    },
  });
}

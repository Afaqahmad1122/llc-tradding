"use client";

import { logoutApi } from "@/lib/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useAuthStore } from "@/stores/auth-store";

export function useLogoutMutation() {
  return useApiMutation({
    mutationFn: () => logoutApi(),
    onSuccess: () => {
      useAuthStore.getState().clearAuth();
    },
  });
}

"use client";

import { useRouter } from "next/navigation";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { logoutApi } from "@/lib/api/auth";
import { useAdminAuthStore } from "@/stores/auth-store";

export function useAdminLogoutMutation() {
  const router = useRouter();
  const clearAuth = useAdminAuthStore((s) => s.clearAuth);

  return useApiMutation({
    mutationFn: () => logoutApi(),
    errorToast: (error) => error.message,
    onSuccess: () => {
      clearAuth();
      router.replace("/");
      router.refresh();
    },
  });
}

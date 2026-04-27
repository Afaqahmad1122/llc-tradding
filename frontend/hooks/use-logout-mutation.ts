"use client";

import { logoutApi } from "@/lib/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

export function useLogoutMutation() {
  const router = useRouter();

  return useApiMutation({
    mutationFn: () => logoutApi(),
    successToast: "Logged out successfully.",
    onSuccess: () => {
      useAuthStore.getState().clearAuth();
      router.push("/");
      router.refresh();
    },
  });
}

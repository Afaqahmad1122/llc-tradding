"use client";

import { useRouter } from "next/navigation";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { adminLoginApi, type AdminLoginRequest } from "@/lib/api/auth";
import { useAdminAuthStore } from "@/stores/auth-store";

export function useAdminLoginMutation() {
  const router = useRouter();
  const setAuthSession = useAdminAuthStore((s) => s.setAuthSession);

  return useApiMutation({
    mutationFn: (payload: AdminLoginRequest) => adminLoginApi(payload),
    errorToast: () => null,
    onSuccess: (data) => {
      setAuthSession(data.user, data.accessToken);
      router.replace("/");
      router.refresh();
    },
  });
}

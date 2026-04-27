"use client";

import { loginApi, type LoginRequest } from "@/lib/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useAuthStore } from "@/stores/auth-store";

export function useLoginMutation() {
  return useApiMutation({
    mutationFn: (payload: LoginRequest) => loginApi(payload),
    onSuccess: ({ user, accessToken }) => {
      useAuthStore.getState().setAuthSession(user, accessToken);
    },
  });
}

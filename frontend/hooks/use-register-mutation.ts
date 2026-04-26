"use client";

import { registerApi, type RegisterRequest } from "@/lib/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useAuthStore } from "@/stores/auth-store";

export function useRegisterMutation() {
  return useApiMutation({
    mutationFn: (payload: RegisterRequest) => registerApi(payload),
    onSuccess: ({ user }) => {
      useAuthStore.getState().setAuthUser(user);
    },
  });
}

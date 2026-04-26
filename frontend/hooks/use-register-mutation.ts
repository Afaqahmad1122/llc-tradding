"use client";

import { registerApi, type RegisterRequest } from "@/lib/api";
import { useApiMutation } from "@/hooks/use-api-mutation";

export function useRegisterMutation() {
  return useApiMutation({
    mutationFn: (payload: RegisterRequest) => registerApi(payload),
  });
}

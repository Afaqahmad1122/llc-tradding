"use client";

import { resetPasswordApi, type ResetPasswordRequest } from "@/lib/api";
import { useApiMutation } from "@/hooks/use-api-mutation";

export function useResetPasswordMutation() {
  return useApiMutation({
    mutationFn: (payload: ResetPasswordRequest) => resetPasswordApi(payload),
    successToast: "Password reset successfully. Please sign in.",
  });
}

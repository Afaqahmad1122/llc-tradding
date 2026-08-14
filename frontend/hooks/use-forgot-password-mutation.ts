"use client";

import { forgotPasswordApi, type ForgotPasswordRequest } from "@/lib/api";
import { useApiMutation } from "@/hooks/use-api-mutation";

export function useForgotPasswordMutation() {
  return useApiMutation({
    mutationFn: (payload: ForgotPasswordRequest) => forgotPasswordApi(payload),
    successToast:
      "If the account exists, a reset code has been sent. Please check your inbox and spam folder.",
  });
}

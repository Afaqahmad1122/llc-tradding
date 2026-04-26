"use client";

import { verifyOtpApi, type VerifyOtpRequest } from "@/lib/api";
import { useApiMutation } from "@/hooks/use-api-mutation";

export function useVerifyOtpMutation() {
  return useApiMutation({
    mutationFn: (payload: VerifyOtpRequest) => verifyOtpApi(payload),
  });
}

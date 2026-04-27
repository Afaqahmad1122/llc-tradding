"use client";

import { useApiMutation } from "@/hooks/use-api-mutation";
import {
  submitContactMessageApi,
  type SubmitContactMessageRequest,
} from "@/lib/api/contact-messages";

export function useContactMessageMutation() {
  return useApiMutation({
    mutationFn: (payload: SubmitContactMessageRequest) =>
      submitContactMessageApi(payload),
  });
}

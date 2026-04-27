"use client";

import { useApiMutation } from "@/hooks/use-api-mutation";
import {
  updateAdminContactMessageApi,
  type ContactMessageStatus,
} from "@/lib/api/contact-messages";

type UpdateContactMessageMutationPayload = {
  id: string;
  status?: ContactMessageStatus;
  adminNote?: string;
};

export function useAdminContactMessageMutation() {
  return useApiMutation({
    mutationFn: ({ id, ...payload }: UpdateContactMessageMutationPayload) =>
      updateAdminContactMessageApi(id, payload),
  });
}

"use client";

import { useMemo } from "react";
import { useApiQuery } from "@/hooks/use-api-query";
import {
  getAdminContactMessageByIdApi,
  getAdminContactMessagesApi,
  type ContactMessagesListParams,
} from "@/lib/api/contact-messages";

export function useAdminContactMessagesQuery(params: ContactMessagesListParams) {
  const queryKey = useMemo(() => ["admin-contact-messages", params], [params]);
  return useApiQuery({
    queryKey,
    queryFn: () => getAdminContactMessagesApi(params),
  });
}

export function useAdminContactMessageDetailQuery(id: string) {
  return useApiQuery({
    queryKey: ["admin-contact-message", id],
    queryFn: () => getAdminContactMessageByIdApi(id),
    enabled: Boolean(id),
  });
}

"use client";

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
  type QueryKey,
} from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client";

type ApiQueryOptions<TData, TSelect = TData> = Omit<
  UseQueryOptions<TData, ApiError, TSelect, QueryKey>,
  "queryFn" | "queryKey"
> & {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
};

export function useApiQuery<TData, TSelect = TData>({
  queryKey,
  queryFn,
  ...options
}: ApiQueryOptions<TData, TSelect>): UseQueryResult<TSelect, ApiError> {
  return useQuery<TData, ApiError, TSelect, QueryKey>({
    queryKey,
    queryFn,
    ...options,
  });
}

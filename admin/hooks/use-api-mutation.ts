"use client";

import {
  useMutation,
  type MutationFunctionContext,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";

type ApiMutationOptions<TData, TVariables, TOnMutateResult = unknown> = Omit<
  UseMutationOptions<TData, ApiError, TVariables, TOnMutateResult>,
  "mutationFn"
> & {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successToast?: string | ((data: TData) => string | null | undefined);
  errorToast?: string | ((error: ApiError) => string | null | undefined);
};

export function useApiMutation<TData, TVariables, TOnMutateResult = unknown>({
  mutationFn,
  successToast,
  errorToast,
  onSuccess,
  onError,
  ...options
}: ApiMutationOptions<TData, TVariables, TOnMutateResult>): UseMutationResult<
  TData,
  ApiError,
  TVariables,
  TOnMutateResult
> {
  return useMutation<TData, ApiError, TVariables, TOnMutateResult>({
    mutationFn,
    onSuccess: (
      data: TData,
      variables: TVariables,
      onMutateResult: TOnMutateResult,
      context: MutationFunctionContext,
    ) => {
      if (successToast) {
        const message =
          typeof successToast === "function"
            ? successToast(data)
            : successToast;
        if (message) {
          toast.success(message);
        }
      }
      onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (
      error: ApiError,
      variables: TVariables,
      onMutateResult: TOnMutateResult | undefined,
      context: MutationFunctionContext,
    ) => {
      const message =
        typeof errorToast === "function"
          ? errorToast(error)
          : (errorToast ?? error.message);
      if (message) {
        toast.error(message);
      }
      onError?.(error, variables, onMutateResult, context);
    },
    ...options,
  });
}

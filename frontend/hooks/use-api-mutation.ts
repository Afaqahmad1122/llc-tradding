"use client";

import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";

type ApiMutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, ApiError, TVariables>,
  "mutationFn"
> & {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successToast?: string | ((data: TData) => string | null | undefined);
  errorToast?: string | ((error: ApiError) => string | null | undefined);
};

export function useApiMutation<TData, TVariables>({
  mutationFn,
  successToast,
  errorToast,
  onSuccess,
  onError,
  ...options
}: ApiMutationOptions<TData, TVariables>): UseMutationResult<
  TData,
  ApiError,
  TVariables
> {
  return useMutation<TData, ApiError, TVariables>({
    mutationFn,
    onSuccess: (data, variables, onMutateResult, context) => {
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
    onError: (error, variables, onMutateResult, context) => {
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

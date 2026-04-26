import type { AxiosRequestConfig, Method } from "axios";

import { apiClient } from "@/lib/api/client";

export type RequestConfig<TBody = unknown> = Omit<
  AxiosRequestConfig<TBody>,
  "url" | "method" | "data"
>;

type RequestParams<TBody = unknown> = {
  url: string;
  method: Method;
  data?: TBody;
  config?: RequestConfig<TBody>;
};

export async function request<TResponse, TBody = unknown>({
  url,
  method,
  data,
  config,
}: RequestParams<TBody>): Promise<TResponse> {
  const response = await apiClient.request<
    TResponse,
    { data: TResponse },
    TBody
  >({
    url,
    method,
    data,
    ...config,
  });

  return response.data;
}

export const http = {
  get: <TResponse>(url: string, config?: RequestConfig) =>
    request<TResponse>({ url, method: "GET", config }),
  post: <TResponse, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: RequestConfig<TBody>,
  ) => request<TResponse, TBody>({ url, method: "POST", data, config }),
  put: <TResponse, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: RequestConfig<TBody>,
  ) => request<TResponse, TBody>({ url, method: "PUT", data, config }),
  patch: <TResponse, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: RequestConfig<TBody>,
  ) => request<TResponse, TBody>({ url, method: "PATCH", data, config }),
  delete: <TResponse>(url: string, config?: RequestConfig) =>
    request<TResponse>({ url, method: "DELETE", config }),
};

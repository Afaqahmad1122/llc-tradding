import axios, {
  AxiosError,
  type AxiosHeaders,
  type InternalAxiosRequestConfig,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/stores/auth-store";

export type ApiErrorResponse = {
  message?: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  public readonly statusCode?: number;
  public readonly details?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode?: number,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

const API_TIMEOUT_MS = 15000;

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const defaultConfig: AxiosRequestConfig = {
  baseURL,
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export const apiClient: AxiosInstance = axios.create(defaultConfig);

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    const headers = config.headers as AxiosHeaders & { Authorization?: string };
    if (!headers.Authorization) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const statusCode = error.response?.status;

    const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh");
    if (statusCode === 401 && originalRequest && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await apiClient.post<{ accessToken: string; user: import("@/lib/api/auth").AuthUser }>(
          "/auth/refresh",
        );

        useAuthStore
          .getState()
          .setAuthSession(refreshResponse.data.user, refreshResponse.data.accessToken);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${refreshResponse.data.accessToken}`,
        };

        return apiClient.request(originalRequest);
      } catch {
        useAuthStore.getState().clearAuth();
      }
    }

    const errorPayload = error.response?.data;
    const message =
      errorPayload?.message ??
      (statusCode
        ? `Request failed with status ${statusCode}`
        : "Network request failed");

    return Promise.reject(
      new ApiError(message, statusCode, errorPayload?.errors),
    );
  },
);

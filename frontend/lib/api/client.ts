import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

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

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

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

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const statusCode = error.response?.status;
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

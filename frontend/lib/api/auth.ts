import { http } from "@/lib/api/http";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  postalCode: string | null;
  role: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

export type VerifyOtpRequest = {
  email: string;
  otp: string;
};

type AuthSuccessResponse = {
  accessToken: string;
  user: AuthUser;
};

type RegisterResponse = {
  user: AuthUser;
  verification: {
    otpSent: boolean;
  };
};

type VerifyOtpResponse = {
  message: string;
};

type RefreshResponse = {
  accessToken: string;
  user: AuthUser;
};

type LogoutResponse = {
  success: boolean;
};

export const loginApi = (payload: LoginRequest) => {
  return http.post<AuthSuccessResponse, LoginRequest>("/auth/login", payload);
};

export const registerApi = (payload: RegisterRequest) => {
  return http.post<RegisterResponse, RegisterRequest>(
    "/auth/register",
    payload,
  );
};

export const verifyOtpApi = (payload: VerifyOtpRequest) => {
  return http.post<VerifyOtpResponse, VerifyOtpRequest>("/auth/verify-otp", payload);
};

export const refreshSessionApi = () => {
  return http.post<RefreshResponse>("/auth/refresh");
};

export const logoutApi = () => {
  return http.post<LogoutResponse>("/auth/logout");
};

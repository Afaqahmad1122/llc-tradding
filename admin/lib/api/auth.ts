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

export type AdminLoginRequest = {
  email: string;
  password: string;
};

type AuthSuccessResponse = {
  accessToken: string;
  user: AuthUser;
};

type RefreshResponse = {
  accessToken: string;
  user: AuthUser;
};

type LogoutResponse = {
  success: boolean;
};

export const adminLoginApi = (payload: AdminLoginRequest) => {
  return http.post<AuthSuccessResponse, AdminLoginRequest>(
    "/auth/admin/login",
    payload,
  );
};

export const refreshSessionApi = () => {
  return http.post<RefreshResponse>("/auth/refresh");
};

export const logoutApi = () => {
  return http.post<LogoutResponse>("/auth/logout");
};

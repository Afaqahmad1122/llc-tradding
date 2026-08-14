import { http } from "@/lib/api/http";

export type StaffPermissions = {
  carsCreate: boolean;
  carsRead: boolean;
  carsUpdate: boolean;
  carsDelete: boolean;
  shippingCreate: boolean;
  shippingRead: boolean;
  shippingUpdate: boolean;
  shippingDelete: boolean;
  reviewsCreate: boolean;
  reviewsRead: boolean;
  reviewsUpdate: boolean;
  reviewsDelete: boolean;
  contactCreate: boolean;
  contactRead: boolean;
  contactUpdate: boolean;
  contactDelete: boolean;
  careersCreate: boolean;
  careersRead: boolean;
  careersUpdate: boolean;
  careersDelete: boolean;
  ledgerCreate: boolean;
  ledgerRead: boolean;
  ledgerUpdate: boolean;
  ledgerDelete: boolean;
  usersCreate: boolean;
  usersRead: boolean;
  usersUpdate: boolean;
  usersDelete: boolean;
};

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
  permissions?: StaffPermissions;
};

export type AdminLoginRequest = {
  email: string;
  password: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  email: string;
  otp: string;
  newPassword: string;
  confirmNewPassword?: string;
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

type PasswordResetResponse = {
  message: string;
};

export const adminLoginApi = (payload: AdminLoginRequest) => {
  return http.post<AuthSuccessResponse, AdminLoginRequest>(
    "/auth/admin/login",
    payload,
  );
};

export const forgotPasswordApi = (payload: ForgotPasswordRequest) => {
  return http.post<PasswordResetResponse, ForgotPasswordRequest>(
    "/auth/forgot-password",
    payload,
  );
};

export const resetPasswordApi = (payload: ResetPasswordRequest) => {
  return http.post<PasswordResetResponse, ResetPasswordRequest>(
    "/auth/reset-password",
    payload,
  );
};

export const refreshSessionApi = () => {
  return http.post<RefreshResponse>("/auth/admin/refresh");
};

export const logoutApi = () => {
  return http.post<LogoutResponse>("/auth/admin/logout");
};

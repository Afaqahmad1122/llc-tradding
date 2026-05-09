import { http } from "@/lib/api/http";
import type { StaffPermissions } from "@/lib/api/auth";

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  staffPermission: StaffPermissions | null;
};

type ListStaffResponse = {
  users: StaffUser[];
};

type StaffUserResponse = {
  user: StaffUser;
};

type PermissionsResponse = {
  permissions: StaffPermissions;
};

export type CreateStaffUserBody = {
  name: string;
  email: string;
  password: string;
};

export type UpdateStaffUserBody = {
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
};

export const fetchStaffUsers = () =>
  http.get<ListStaffResponse>("/users/admin/staff");

export const createStaffUser = (body: CreateStaffUserBody) =>
  http.post<StaffUserResponse, CreateStaffUserBody>("/users/admin/staff", body);

export const updateStaffUser = (id: string, body: UpdateStaffUserBody) =>
  http.patch<StaffUserResponse, UpdateStaffUserBody>(
    `/users/admin/staff/${id}`,
    body,
  );

export const updateStaffPermissions = (
  id: string,
  body: Partial<StaffPermissions>,
) =>
  http.patch<PermissionsResponse, Partial<StaffPermissions>>(
    `/users/admin/staff/${id}/permissions`,
    body,
  );

export const deleteStaffUser = (id: string) =>
  http.delete<{ success: boolean }>(`/users/admin/staff/${id}`);

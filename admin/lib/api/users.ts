import { http } from "@/lib/api/http";

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type AdminCustomersPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminCustomersResponse = {
  data: AdminCustomer[];
  pagination: AdminCustomersPagination;
};

export type AdminCustomersQuery = {
  q?: string;
  page?: number;
  pageSize?: number;
};

export type CreateAdminCustomerBody = {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  password: string;
};

export function fetchAdminCustomers(params: AdminCustomersQuery = {}) {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.q != null && params.q.trim())
    search.set("q", params.q.trim());
  const qs = search.toString();
  return http.get<AdminCustomersResponse>(
    `/users/admin/customers${qs ? `?${qs}` : ""}`,
  );
}

export function createAdminCustomer(body: CreateAdminCustomerBody) {
  return http.post<{ customer: AdminCustomer }, CreateAdminCustomerBody>(
    "/users/admin/customers",
    body,
  );
}

export type AdminUserRole = "ADMIN" | "STAFF" | "USER";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: AdminUserRole;
  isActive: boolean;
  createdAt: string;
};

export type AdminAllUsersResponse = {
  data: AdminUser[];
  pagination: AdminCustomersPagination;
};

export type AdminAllUsersQuery = {
  q?: string;
  page?: number;
  pageSize?: number;
  role?: AdminUserRole;
  isActive?: boolean;
};

export function fetchAdminAllUsers(params: AdminAllUsersQuery = {}) {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.q != null && params.q.trim()) search.set("q", params.q.trim());
  if (params.role) search.set("role", params.role);
  if (params.isActive != null) search.set("isActive", String(params.isActive));
  const qs = search.toString();
  return http.get<AdminAllUsersResponse>(
    `/users/admin/all${qs ? `?${qs}` : ""}`,
  );
}

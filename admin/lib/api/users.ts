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

import { http } from "@/lib/api/http";

export type CarEngagementRow = {
  carId: string;
  referenceNo: string;
  title: string | null;
  model: string;
  views: number;
  whatsappClicks: number;
  emailClicks: number;
  clicks: number;
  clickThroughRate: number;
};

export type CarEngagementPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CarEngagementResponse = {
  data: CarEngagementRow[];
  days: number;
  pagination: CarEngagementPagination;
};

export type CarEngagementQuery = {
  page?: number;
  pageSize?: number;
  days?: number;
};

export function fetchCarEngagementStats(params: CarEngagementQuery = {}) {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.days != null) search.set("days", String(params.days));
  const qs = search.toString();
  return http.get<CarEngagementResponse>(
    `/cars/admin/analytics/engagement${qs ? `?${qs}` : ""}`,
  );
}

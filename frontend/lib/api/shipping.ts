import { http } from "@/lib/api/http";

export type ShippingRegion = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};

export type ShippingRegionsResponse = {
  data: ShippingRegion[];
};

export type ShippingTableRow = {
  id: string;
  company: string;
  shipName: string;
  voyage: string;
  sortOrder: number;
  departures: Record<string, string>;
  arrivals: Record<string, string>;
};

export type ShippingSchedulesByRegionResponse = {
  region: ShippingRegion;
  table: {
    departurePorts: string[];
    arrivalPorts: string[];
    rows: ShippingTableRow[];
  };
};

export const getShippingRegionsApi = () =>
  http.get<ShippingRegionsResponse>("/shipping/regions");

export const getShippingSchedulesByRegionSlugApi = (slug: string) =>
  http.get<ShippingSchedulesByRegionResponse>(
    `/shipping/regions/${slug}/schedules`,
  );

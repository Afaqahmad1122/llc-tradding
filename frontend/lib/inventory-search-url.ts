/**
 * Builds `/cars` URLs with all supported inventory query params.
 * Must stay in sync with {@link PublicCarsQuery} and the backend getCars handler.
 */
export type InventoryUrlParams = {
  brand?: string;
  bodyType?: string;
  modelId?: string;
  modelCode?: string;
  steering?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  fuel?: string;
  transmission?: string;
  search?: string;
};

export function buildCarsInventoryUrl(params: InventoryUrlParams = {}): string {
  const sp = new URLSearchParams();

  if (params.brand?.trim()) sp.set("brand", params.brand.trim());
  if (params.bodyType?.trim()) sp.set("bodyType", params.bodyType.trim());
  if (params.modelId?.trim()) sp.set("modelId", params.modelId.trim());
  if (params.modelCode?.trim()) sp.set("modelCode", params.modelCode.trim());
  if (params.steering?.trim()) sp.set("steering", params.steering.trim());
  if (params.fuel?.trim()) sp.set("fuel", params.fuel.trim());
  if (params.transmission?.trim()) sp.set("transmission", params.transmission.trim());
  if (params.search?.trim()) sp.set("search", params.search.trim());

  if (params.yearMin != null && Number.isFinite(params.yearMin)) {
    sp.set("yearMin", String(Math.floor(params.yearMin)));
  }
  if (params.yearMax != null && Number.isFinite(params.yearMax)) {
    sp.set("yearMax", String(Math.floor(params.yearMax)));
  }
  if (params.priceMin != null && Number.isFinite(params.priceMin)) {
    sp.set("priceMin", String(Math.floor(params.priceMin)));
  }
  if (params.priceMax != null && Number.isFinite(params.priceMax)) {
    sp.set("priceMax", String(Math.ceil(params.priceMax)));
  }

  const q = sp.toString();
  return q ? `/cars?${q}` : "/cars";
}

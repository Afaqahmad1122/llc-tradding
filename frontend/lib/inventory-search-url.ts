/**
 * Builds `/cars` URLs with supported inventory query params (must stay in sync with {@link PublicCarsQuery}).
 */
export function buildCarsInventoryUrl(
  params: {
    brand?: string;
    bodyType?: string;
    priceMin?: number;
    priceMax?: number;
  } = {},
): string {
  const sp = new URLSearchParams();
  if (params.brand?.trim()) sp.set("brand", params.brand.trim());
  if (params.bodyType?.trim()) sp.set("bodyType", params.bodyType.trim());
  if (params.priceMin != null && Number.isFinite(params.priceMin)) {
    sp.set("priceMin", String(Math.floor(params.priceMin)));
  }
  if (params.priceMax != null && Number.isFinite(params.priceMax)) {
    sp.set("priceMax", String(Math.ceil(params.priceMax)));
  }
  const q = sp.toString();
  return q ? `/cars?${q}` : "/cars";
}

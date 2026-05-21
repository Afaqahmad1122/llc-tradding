import { http } from "@/lib/api/http";

export type FxRatesResponse = {
  base: string;
  rates: Record<string, number>;
  source: "open-exchange-rates" | "frankfurter";
};

export function fetchFxRates() {
  return http.get<FxRatesResponse>("/reference/fx-rates");
}

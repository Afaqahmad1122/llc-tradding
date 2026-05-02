import { http } from "@/lib/api/http";

export type DestinationCountry = {
  code: string;
  name: string;
  currencyCodes: string[];
};

export type DestinationCountriesResponse = {
  data: DestinationCountry[];
};

export type FxRatesResponse = {
  base: string;
  rates: Record<string, number>;
  source: "open-exchange-rates" | "frankfurter";
};

export type DestinationPortsResponse = {
  data: string[];
};

export function fetchDestinationCountries() {
  return http.get<DestinationCountriesResponse>(
    "/reference/destination-countries",
  );
}

export function fetchDestinationPorts(countryCode: string) {
  const code = encodeURIComponent(countryCode.trim().toUpperCase());
  return http.get<DestinationPortsResponse>(
    `/reference/destination-ports?countryCode=${code}`,
  );
}

export function fetchFxRates() {
  return http.get<FxRatesResponse>("/reference/fx-rates");
}

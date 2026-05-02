import type { CarFuel, CarSteering, CarTransmission } from "@/lib/api/cars";

export const PAGE_SIZE_OPTIONS = [12, 25, 50] as const;

export const FUEL_OPTIONS: readonly CarFuel[] = [
  "GASOLINE",
  "DIESEL",
  "HYBRID",
  "ELECTRIC",
  "PETROL",
  "CNG",
  "LPG",
  "OTHER",
];

export const TRANSMISSION_OPTIONS: readonly CarTransmission[] = [
  "AT",
  "MT",
  "CVT",
  "OTHER",
];

export const STEERING_OPTIONS: readonly CarSteering[] = ["RHD", "LHD", "OTHER"];

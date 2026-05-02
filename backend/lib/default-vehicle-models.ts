/**
 * Canonical default catalog for inventory `Model` rows.
 * Upsert keys on `slug` so admins can customize names/brands safely.
 */

export type DefaultVehicleModelSeed = Readonly<{
  name: string;
  slug: string;
  brand: string;
  bodyType?: string | null;
}>;

export const DEFAULT_VEHICLE_MODELS: readonly DefaultVehicleModelSeed[] = [
  {
    brand: "Toyota",
    name: "Corolla",
    slug: "toyota-corolla",
    bodyType: "Sedan",
  },
  {
    brand: "Toyota",
    name: "Camry",
    slug: "toyota-camry",
    bodyType: "Sedan",
  },
  {
    brand: "Toyota",
    name: "RAV4",
    slug: "toyota-rav4",
    bodyType: "SUV",
  },
  {
    brand: "Toyota",
    name: "Land Cruiser Prado",
    slug: "toyota-prado",
    bodyType: "SUV",
  },
  {
    brand: "Toyota",
    name: "Hilux",
    slug: "toyota-hilux",
    bodyType: "Pickup",
  },
  {
    brand: "Honda",
    name: "Civic",
    slug: "honda-civic",
    bodyType: "Sedan",
  },
  {
    brand: "Honda",
    name: "Accord",
    slug: "honda-accord",
    bodyType: "Sedan",
  },
  {
    brand: "Honda",
    name: "CR-V",
    slug: "honda-crv",
    bodyType: "SUV",
  },
  {
    brand: "Nissan",
    name: "X-Trail",
    slug: "nissan-xtrail",
    bodyType: "SUV",
  },
  {
    brand: "Mazda",
    name: "CX-5",
    slug: "mazda-cx5",
    bodyType: "SUV",
  },
  {
    brand: "Mitsubishi",
    name: "Pajero",
    slug: "mitsubishi-pajero",
    bodyType: "SUV",
  },
];

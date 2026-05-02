import type { PrismaClient } from "@prisma/client";

import {
  DEFAULT_VEHICLE_MODELS,
  type DefaultVehicleModelSeed,
} from "./default-vehicle-models.js";

const toUpsertPayload = (
  row: DefaultVehicleModelSeed,
): {
  slug: string;
  name: string;
  brand: string;
  bodyType: string | null;
} => ({
  slug: row.slug,
  name: row.name,
  brand: row.brand,
  bodyType: row.bodyType ?? null,
});

/**
 * Ensures predefined models exist without deleting admin-created rows.
 * Safe to run on every deploy: updates name/brand/bodyType for known slugs only.
 */
export async function syncDefaultVehicleModels(db: PrismaClient): Promise<void> {
  for (const row of DEFAULT_VEHICLE_MODELS) {
    const payload = toUpsertPayload(row);
    await db.model.upsert({
      where: { slug: payload.slug },
      create: payload,
      update: {
        name: payload.name,
        brand: payload.brand,
        bodyType: payload.bodyType,
      },
    });
  }
}

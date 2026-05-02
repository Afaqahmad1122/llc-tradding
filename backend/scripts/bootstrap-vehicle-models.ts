import { prisma } from "../config/prisma.js";
import { syncDefaultVehicleModels } from "../lib/sync-default-vehicle-models.js";

const run = async (): Promise<void> => {
  await syncDefaultVehicleModels(prisma);
  console.log("Default vehicle models are in sync with the catalog.");
};

run()
  .catch((error: unknown) => {
    console.error("Vehicle model bootstrap failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

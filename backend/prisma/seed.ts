import { prisma } from "../config/prisma.js";
import { syncDefaultVehicleModels } from "../lib/sync-default-vehicle-models.js";

const main = async (): Promise<void> => {
  await syncDefaultVehicleModels(prisma);
  console.log(
    `Vehicle models seeded/updated (${process.env.NODE_ENV ?? "development"}).`,
  );
};

main()
  .catch((error: unknown) => {
    console.error("Prisma seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

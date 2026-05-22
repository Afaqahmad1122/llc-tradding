import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { syncDefaultVehicleModels } from "./lib/sync-default-vehicle-models.js";

await syncDefaultVehicleModels(prisma);
console.log("Default vehicle models are in sync with the catalog.");

const server = app.listen(env.PORT, () => {
  console.log(`Backend running on port ${env.PORT}`);
});

const shutdown = (signal: NodeJS.Signals): void => {
  console.log(`${signal} received, shutting down gracefully`);
  server.close((error) => {
    if (error) {
      console.error("Graceful shutdown failed", error);
      process.exit(1);
    }
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

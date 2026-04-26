import { app } from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  // Minimal startup log for local/dev observability.
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

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const prismaLogOptions =
  process.env.NODE_ENV === "development"
    ? process.env.PRISMA_LOG_QUERIES === "true"
      ? (["query", "warn", "error"] as const)
      : (["warn", "error"] as const)
    : (["error"] as const);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
    log: [...prismaLogOptions],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

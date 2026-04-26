import { Router } from "express";
import { prisma } from "../config/prisma.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res, _next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      database: "up",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Health should stay informative even if database is down.
    res.status(503).json({
      status: "degraded",
      database: "down",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : "Database check failed",
    });
  }
});

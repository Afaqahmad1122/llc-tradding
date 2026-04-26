import type { NextFunction, Request, Response } from "express";

type ErrorResponse = {
  message: string;
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction,
): void => {
  const statusCode = 500;
  const message = error instanceof Error ? error.message : "Internal server error";

  res.status(statusCode).json({ message });
};

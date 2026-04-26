import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodTypeAny } from "zod";

export const validateRequestBody = (schema: ZodTypeAny): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      res.status(400).json({ message: firstIssue?.message ?? "invalid request body" });
      return;
    }

    req.body = parsed.data;
    next();
  };
};

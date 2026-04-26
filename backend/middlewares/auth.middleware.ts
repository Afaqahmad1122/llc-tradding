import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

const getBearerToken = (authorizationHeader: string | undefined): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ message: "authorization token required" });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    res.locals.authUserId = payload.sub;
    res.locals.authUserRole = payload.role;
    next();
  } catch {
    res.status(401).json({ message: "invalid or expired access token" });
  }
};

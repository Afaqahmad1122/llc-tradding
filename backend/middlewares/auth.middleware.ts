import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

export const getBearerToken = (
  authorizationHeader: string | undefined,
): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.trim().split(/\s+/);
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
};

const getQueryAccessToken = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const token = value.trim();
  return token ? token : null;
};

const verifyRequestAccessToken = (
  token: string | null,
  res: Response,
  next: NextFunction,
): void => {
  if (!token) {
    res.status(401).json({ message: "authorization token required" });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    res.locals.authUserId = payload.sub;
    res.locals.authUserRole = payload.role;
    if (payload.permissions) {
      res.locals.authPermissions = payload.permissions;
    }
    next();
  } catch {
    res.status(401).json({ message: "invalid or expired access token" });
  }
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  verifyRequestAccessToken(getBearerToken(req.headers.authorization), res, next);
};

export const requireAuthForEventStream = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token =
    getBearerToken(req.headers.authorization) ??
    getQueryAccessToken(req.query.accessToken);
  verifyRequestAccessToken(token, res, next);
};

export const requireAdminRole = (req: Request, res: Response, next: NextFunction): void => {
  if (res.locals.authUserRole !== "ADMIN") {
    res.status(403).json({ message: "admin access required" });
    return;
  }
  next();
};

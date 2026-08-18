import type { NextFunction, Request, Response } from "express";
import type { StaffPermissionsPayload } from "../utils/jwt.js";

export const requirePermission =
  (field: keyof StaffPermissionsPayload) =>
  (_req: Request, res: Response, next: NextFunction): void => {
    if (res.locals.authUserRole === "ADMIN") {
      next();
      return;
    }
    const permissions = res.locals.authPermissions as StaffPermissionsPayload | undefined;
    if (!permissions?.[field]) {
      res.status(403).json({ message: "insufficient permissions" });
      return;
    }
    next();
  };

export const requireAnyPermission =
  (...fields: Array<keyof StaffPermissionsPayload>) =>
  (_req: Request, res: Response, next: NextFunction): void => {
    if (res.locals.authUserRole === "ADMIN") {
      next();
      return;
    }
    const permissions = res.locals.authPermissions as StaffPermissionsPayload | undefined;
    if (!fields.some((field) => permissions?.[field])) {
      res.status(403).json({ message: "insufficient permissions" });
      return;
    }
    next();
  };

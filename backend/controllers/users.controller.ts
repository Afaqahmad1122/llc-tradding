import { Prisma, UserRole } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 15;
const MAX_PAGE_SIZE = 50;

const parsePositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
};

const requireAdmin = (res: Response): boolean => {
  const authUserRole = res.locals.authUserRole as UserRole | undefined;
  if (authUserRole !== UserRole.ADMIN) {
    res.status(403).json({ message: "admin access required" });
    return false;
  }
  return true;
};

export const listAdminCustomers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const page = parsePositiveInt(req.query.page, DEFAULT_PAGE);
  const requestedPageSize = parsePositiveInt(
    req.query.pageSize,
    DEFAULT_PAGE_SIZE,
  );
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  const where: Prisma.UserWhereInput = {
    role: UserRole.USER,
    isActive: true,
    ...(q.length > 0
      ? {
          OR: [
            { email: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {}),
  };

  const [total, data] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    }),
  ]);

  res.status(200).json({
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
};

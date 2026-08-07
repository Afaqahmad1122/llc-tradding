import { randomUUID } from "node:crypto";
import { Prisma, UserRole } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { hashPassword, validatePasswordStrength } from "../utils/password.js";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 15;
const MAX_PAGE_SIZE = 50;
const CUSTOMER_SELECT = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} satisfies Prisma.UserSelect;
const ALL_USERS_SELECT = {
  ...CUSTOMER_SELECT,
  phone: true,
  role: true,
  isActive: true,
} satisfies Prisma.UserSelect;

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

const buildNameEmailSearch = (q: string): Prisma.UserWhereInput => {
  if (!q) return {};
  return {
    OR: [
      { email: { contains: q, mode: Prisma.QueryMode.insensitive } },
      { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
    ],
  };
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const randomCustomerPassword = (): string =>
  `Icc${randomUUID().replace(/-/g, "").slice(0, 18)}!1`;

const paginationPayload = (input: {
  page: number;
  pageSize: number;
  total: number;
}) => ({
  page: input.page,
  pageSize: input.pageSize,
  total: input.total,
  totalPages: Math.ceil(input.total / input.pageSize),
});

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
    ...buildNameEmailSearch(q),
  };

  const [total, data] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: CUSTOMER_SELECT,
    }),
  ]);

  res.status(200).json({
    data,
    pagination: paginationPayload({ page, pageSize, total }),
  });
};

export const createAdminCustomer = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const body = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    country?: string;
    city?: string;
    address?: string;
    postalCode?: string;
    password?: string;
  };

  if (!body.name?.trim() || !body.email?.trim()) {
    res.status(400).json({ message: "name and email are required" });
    return;
  }

  const normalizedEmail = normalizeEmail(body.email);
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existing) {
    res.status(409).json({ message: "email already in use" });
    return;
  }

  const password = body.password?.trim() || randomCustomerPassword();
  const strengthError = validatePasswordStrength(password);
  if (strengthError) {
    res.status(400).json({ message: strengthError });
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: body.name.trim(),
      email: normalizedEmail,
      phone: body.phone?.trim() || null,
      country: body.country?.trim() || null,
      city: body.city?.trim() || null,
      address: body.address?.trim() || null,
      postalCode: body.postalCode?.trim() || null,
      passwordHash: await hashPassword(password),
      role: UserRole.USER,
      emailVerifiedAt: new Date(),
    },
    select: CUSTOMER_SELECT,
  });

  res.status(201).json({ customer: user });
};

export const listAllUsers = async (
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

  const roleParam =
    typeof req.query.role === "string" ? req.query.role.toUpperCase() : "";
  if (roleParam && !(roleParam in UserRole)) {
    res.status(400).json({ message: "invalid role filter" });
    return;
  }

  let isActive: boolean | undefined;
  if (req.query.isActive === "true") {
    isActive = true;
  } else if (req.query.isActive === "false") {
    isActive = false;
  } else if (req.query.isActive !== undefined) {
    res.status(400).json({ message: "isActive must be 'true' or 'false'" });
    return;
  }

  const where: Prisma.UserWhereInput = {
    ...(roleParam ? { role: roleParam as UserRole } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
    ...buildNameEmailSearch(q),
  };

  const [total, data] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: ALL_USERS_SELECT,
    }),
  ]);

  res.status(200).json({
    data,
    pagination: paginationPayload({ page, pageSize, total }),
  });
};

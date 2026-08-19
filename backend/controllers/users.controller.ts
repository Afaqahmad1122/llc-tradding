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
const USER_DETAIL_SELECT = {
  ...ALL_USERS_SELECT,
  country: true,
  city: true,
  address: true,
  postalCode: true,
  emailVerifiedAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const parsePositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
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

const decimalToNumber = (value: Prisma.Decimal | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  return Number(value.toString());
};

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

  if (!body.password?.trim()) {
    res.status(400).json({ message: "password is required" });
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

  const password = body.password.trim();
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
  const page = parsePositiveInt(req.query.page, DEFAULT_PAGE);
  const requestedPageSize = parsePositiveInt(
    req.query.pageSize,
    DEFAULT_PAGE_SIZE,
  );
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  const roleParam =
    typeof req.query.role === "string" ? req.query.role.toUpperCase() : "";
  if (
    roleParam &&
    roleParam !== UserRole.ADMIN &&
    roleParam !== UserRole.USER
  ) {
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
    role: roleParam ? (roleParam as UserRole) : { not: UserRole.STAFF },
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

export const getAdminUserDetail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.params.id;
  if (!userId) {
    res.status(400).json({ message: "user id is required" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: USER_DETAIL_SELECT,
  });
  if (!user || user.role === UserRole.STAFF) {
    res.status(404).json({ message: "user not found" });
    return;
  }

  const deals = await prisma.ledgerDeal.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      totalAmount: true,
      currency: true,
      downPaymentRequired: true,
      status: true,
      dealType: true,
      createdAt: true,
      car: {
        select: {
          id: true,
          referenceNo: true,
          title: true,
          year: true,
          model: {
            select: {
              brand: true,
              name: true,
            },
          },
        },
      },
      payments: {
        where: { deletedAt: null },
        select: {
          amount: true,
          type: true,
        },
      },
    },
  });

  const currencyBuckets = new Map<
    string,
    {
      currency: string;
      totalAmount: number;
      paidAmount: number;
      remainingBalance: number;
      dealCount: number;
    }
  >();
  const statusCounts = new Map<string, number>();

  for (const deal of deals) {
    const totalAmount = decimalToNumber(deal.totalAmount);
    const downPaymentRequired = decimalToNumber(deal.downPaymentRequired);
    const paymentEntriesAmount = deal.payments.reduce((sum, payment) => {
      const amount = decimalToNumber(payment.amount);
      return payment.type === "REFUND" ? sum - amount : sum + amount;
    }, 0);
    const paidAmount = Math.max(paymentEntriesAmount + downPaymentRequired, 0);
    const remainingBalance = Math.max(totalAmount - paidAmount, 0);
    const bucket =
      currencyBuckets.get(deal.currency) ??
      {
        currency: deal.currency,
        totalAmount: 0,
        paidAmount: 0,
        remainingBalance: 0,
        dealCount: 0,
      };

    bucket.totalAmount += totalAmount;
    bucket.paidAmount += paidAmount;
    bucket.remainingBalance += remainingBalance;
    bucket.dealCount += 1;
    currencyBuckets.set(deal.currency, bucket);
    statusCounts.set(deal.status, (statusCounts.get(deal.status) ?? 0) + 1);
  }

  res.status(200).json({
    user,
    stats: {
      carCount: deals.length,
      dealCount: deals.length,
      statusCounts: Array.from(statusCounts.entries()).map(([status, count]) => ({
        status,
        count,
      })),
      byCurrency: Array.from(currencyBuckets.values()),
    },
    recentDeals: deals.slice(0, 5).map((deal) => ({
      id: deal.id,
      orderNumber: deal.orderNumber,
      status: deal.status,
      dealType: deal.dealType,
      totalAmount: decimalToNumber(deal.totalAmount),
      currency: deal.currency,
      createdAt: deal.createdAt,
      car: deal.car,
    })),
  });
};

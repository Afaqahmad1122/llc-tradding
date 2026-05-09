import { Prisma, UserRole, type ContactMessage } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

type CreateContactMessageBody = {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  company?: string;
  vehicleRequirement?: string;
  message?: string;
};

type UpdateContactMessageBody = {
  status?: ContactMessageStatus;
  adminNote?: string;
};
type ContactMessageStatus = "NEW" | "IN_REVIEW" | "RESOLVED" | "SPAM";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

const normalizeOptionalString = (value: string | undefined): string | null => {
  if (value === undefined) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const parsePositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
};

const requireAdmin = (res: Response): boolean => {
  const authUserRole = res.locals.authUserRole as UserRole | undefined;
  if (authUserRole !== UserRole.ADMIN && authUserRole !== UserRole.STAFF) {
    res.status(403).json({ message: "admin access required" });
    return false;
  }
  return true;
};

const toAdminContactMessageSelect = () =>
  ({
    id: true,
    name: true,
    email: true,
    phone: true,
    country: true,
    city: true,
    company: true,
    vehicleRequirement: true,
    message: true,
    status: true,
    adminNote: true,
    reviewedAt: true,
    createdAt: true,
    updatedAt: true,
    reviewedBy: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  }) satisfies Prisma.ContactMessageSelect;

const contactMessageStatuses = new Set<ContactMessageStatus>([
  "NEW",
  "IN_REVIEW",
  "RESOLVED",
  "SPAM",
]);

const parseStatusFilter = (value: unknown): ContactMessageStatus | undefined => {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }
  if (contactMessageStatuses.has(value as ContactMessageStatus)) {
    return value as ContactMessageStatus;
  }
  return undefined;
};

const parseSortOrder = (value: unknown): Prisma.SortOrder =>
  value === "oldest" ? "asc" : "desc";

const applyReviewMetadata = (
  existingMessage: ContactMessage,
  nextStatus: ContactMessageStatus | undefined,
  reviewerId: string | undefined,
): Prisma.ContactMessageUpdateInput => {
  if (nextStatus === undefined || !reviewerId) {
    return {};
  }

  if (nextStatus === "NEW") {
    return {
      reviewedAt: null,
      reviewedBy: { disconnect: true },
    };
  }

  if (existingMessage.status !== nextStatus || existingMessage.reviewedById !== reviewerId) {
    return {
      reviewedAt: new Date(),
      reviewedBy: { connect: { id: reviewerId } },
    };
  }

  return {};
};

export const createContactMessage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const body = req.body as CreateContactMessageBody;
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const phone = body.phone?.trim();
  const message = body.message?.trim();

  if (!name || !email || !phone || !message) {
    res.status(400).json({ message: "name, email, phone and message are required" });
    return;
  }

  const createdMessage = await prisma.contactMessage.create({
    data: {
      name,
      email,
      phone,
      country: normalizeOptionalString(body.country),
      city: normalizeOptionalString(body.city),
      company: normalizeOptionalString(body.company),
      vehicleRequirement: normalizeOptionalString(body.vehicleRequirement),
      message,
    },
    select: {
      id: true,
      createdAt: true,
      status: true,
    },
  });

  res.status(201).json({
    message: "contact message received successfully",
    contactMessage: createdMessage,
  });
};

export const getAdminContactMessages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const page = parsePositiveInt(req.query.page, DEFAULT_PAGE);
  const requestedPageSize = parsePositiveInt(req.query.pageSize, DEFAULT_PAGE_SIZE);
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);
  const status = parseStatusFilter(req.query.status);
  const rawSearch = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const search = rawSearch.length > 0 ? rawSearch : undefined;
  const createdAtSort = parseSortOrder(req.query.sort);

  if (req.query.status && !status) {
    res.status(400).json({ message: "invalid status filter" });
    return;
  }

  const where: Prisma.ContactMessageWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { phone: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { message: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {}),
  };

  const [total, messages] = await Promise.all([
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: createdAtSort },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: toAdminContactMessageSelect(),
    }),
  ]);

  res.status(200).json({
    data: messages,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
};

export const getAdminContactMessageById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const id = req.params.id?.trim();
  if (!id) {
    res.status(400).json({ message: "message id is required" });
    return;
  }

  const message = await prisma.contactMessage.findUnique({
    where: { id },
    select: toAdminContactMessageSelect(),
  });

  if (!message) {
    res.status(404).json({ message: "contact message not found" });
    return;
  }

  res.status(200).json({ contactMessage: message });
};

export const updateAdminContactMessage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const authUserId = res.locals.authUserId as string | undefined;
  const id = req.params.id?.trim();
  if (!id) {
    res.status(400).json({ message: "message id is required" });
    return;
  }

  const body = req.body as UpdateContactMessageBody;
  const existingMessage = await prisma.contactMessage.findUnique({
    where: { id },
  });

  if (!existingMessage) {
    res.status(404).json({ message: "contact message not found" });
    return;
  }

  const data: Prisma.ContactMessageUpdateInput = {
    ...(body.status ? { status: body.status } : {}),
    ...(body.adminNote !== undefined
      ? { adminNote: normalizeOptionalString(body.adminNote) }
      : {}),
    ...applyReviewMetadata(existingMessage, body.status, authUserId),
  };

  if (Object.keys(data).length === 0) {
    res.status(400).json({ message: "at least one field is required" });
    return;
  }

  const updatedMessage = await prisma.contactMessage.update({
    where: { id },
    data,
    select: toAdminContactMessageSelect(),
  });

  res.status(200).json({ contactMessage: updatedMessage });
};

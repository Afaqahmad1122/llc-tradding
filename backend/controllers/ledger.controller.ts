import { randomBytes } from "node:crypto";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  LedgerCurrency,
  LedgerDealStatus,
  LedgerDocumentType,
  LedgerEventType,
  LedgerPaymentMethod,
  LedgerPaymentType,
  Prisma,
  UserRole,
} from "@prisma/client";
import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { s3Bucket, s3Client } from "../config/s3.js";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const DOCUMENT_UPLOAD_PREFIX = "ledger-deals";
const PRESIGN_EXPIRES_IN_SEC = 300;
const DOWNLOAD_EXPIRES_IN_SEC = 300;

type CreateLedgerDealBody = {
  orderNumber?: string;
  userId: string;
  carId: string;
  totalAmount: number;
  currency: LedgerCurrency;
  downPaymentRequired?: number | null;
  dueDate?: string | null;
  shipmentOrigin?: string | null;
  shipmentDestination?: string | null;
  vesselName?: string | null;
  bookingNo?: string | null;
  billOfLadingNo?: string | null;
  currentLocation?: string | null;
  shipmentNote?: string | null;
  status?: LedgerDealStatus;
  note?: string | null;
};

type UpdateLedgerDealBody = Partial<CreateLedgerDealBody>;

type AddLedgerPaymentBody = {
  amount: number;
  currency?: LedgerCurrency;
  type: LedgerPaymentType;
  method: LedgerPaymentMethod;
  paidAt?: string;
  referenceNo?: string;
  note?: string | null;
};

type PresignLedgerDocumentBody = {
  contentType: "application/pdf" | "image/jpeg" | "image/png" | "image/webp";
  ext: "pdf" | "jpg" | "jpeg" | "png" | "webp";
};

type CreateLedgerDocumentBody = {
  type: LedgerDocumentType;
  title: string;
  fileKey: string;
  fileUrl?: string | null;
  fileName: string;
  mimeType: "application/pdf" | "image/jpeg" | "image/png" | "image/webp";
  fileSize?: number | null;
  visibleToCustomer: boolean;
  note?: string | null;
};

type SupportedLedgerDocumentMimeType =
  | "application/pdf"
  | "image/jpeg"
  | "image/png"
  | "image/webp";

type UpdateLedgerDocumentBody = {
  type?: LedgerDocumentType;
  title?: string;
  visibleToCustomer?: boolean;
  note?: string | null;
};

type CreateLedgerNoteBody = {
  message: string;
};

const LEDGER_DEAL_INCLUDE = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      country: true,
      city: true,
    },
  },
  car: {
    select: {
      id: true,
      referenceNo: true,
      title: true,
      year: true,
      chassisNo: true,
      priceJpy: true,
      priceUsd: true,
      pricePkr: true,
      model: {
        select: {
          id: true,
          name: true,
          brand: true,
          bodyType: true,
        },
      },
      images: {
        orderBy: [{ isPrimary: "desc" as const }, { position: "asc" as const }],
        select: {
          id: true,
          url: true,
          altText: true,
        },
      },
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  payments: {
    where: { deletedAt: null },
    orderBy: [{ paidAt: "desc" as const }, { createdAt: "desc" as const }],
    include: {
      receivedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
  documents: {
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" as const },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
  events: {
    orderBy: { createdAt: "desc" as const },
    take: 50,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
} satisfies Prisma.LedgerDealInclude;

const parsePositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
};

const decimalToNumber = (value: Prisma.Decimal | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  return Number(value.toString());
};

const money = (value: number): Prisma.Decimal => new Prisma.Decimal(value);

const getAdminId = (res: Response): string | null =>
  typeof res.locals.authUserId === "string" ? res.locals.authUserId : null;

const getRequiredParam = (
  req: Request,
  res: Response,
  name: string,
): string | null => {
  const value = req.params[name];
  if (!value) {
    res.status(400).json({ message: `${name} is required` });
    return null;
  }
  return value;
};

const normalizeOrderNumber = (value: string): string => value.trim().toUpperCase();

const s3ObjectUrl = (key: string): string =>
  `https://${s3Bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

const getLedgerDocumentExt = (
  contentType: string | undefined,
  fileName: string,
): PresignLedgerDocumentBody["ext"] | null => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (contentType === "application/pdf" && ext === "pdf") return "pdf";
  if (contentType === "image/jpeg" && (ext === "jpg" || ext === "jpeg")) {
    return ext;
  }
  if (contentType === "image/png" && ext === "png") return "png";
  if (contentType === "image/webp" && ext === "webp") return "webp";
  return null;
};

const decodeUploadHeader = (value: string | undefined): string =>
  value ? decodeURIComponent(value).trim() : "";

const sanitizeDownloadName = (value: string): string =>
  value.replace(/["/\\?%*:|<>]/g, "-").trim() || "download";

const buildPaymentSummary = (
  totalAmount: Prisma.Decimal,
  payments: Array<{ amount: Prisma.Decimal; type: LedgerPaymentType }>,
  downPaymentRequired?: Prisma.Decimal | null,
  dueDate?: Date | null,
) => {
  const total = decimalToNumber(totalAmount) ?? 0;
  const downPaymentAmount = decimalToNumber(downPaymentRequired) ?? 0;
  const paymentEntriesAmount = payments.reduce((sum, payment) => {
    const amount = decimalToNumber(payment.amount) ?? 0;
    return payment.type === LedgerPaymentType.REFUND ? sum - amount : sum + amount;
  }, 0);
  const paidAmount = Math.max(paymentEntriesAmount + downPaymentAmount, 0);
  const remainingBalance = Math.max(total - paidAmount, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDateOnly = dueDate ? new Date(dueDate) : null;
  dueDateOnly?.setHours(0, 0, 0, 0);
  const isOverdue = Boolean(
    dueDateOnly && remainingBalance > 0 && dueDateOnly.getTime() < today.getTime(),
  );

  const paymentStatus =
    paidAmount <= 0
      ? "NO_PAYMENT"
      : remainingBalance <= 0
        ? "FULLY_PAID"
        : "PARTIALLY_PAID";

  return {
    totalAmount: total,
    paidAmount,
    remainingBalance,
    paymentStatus,
    isOverdue,
    paidPercent: total > 0 ? Math.min(Math.round((paidAmount / total) * 100), 100) : 0,
  };
};

const toLedgerDealPayload = (
  deal: Prisma.LedgerDealGetPayload<{ include: typeof LEDGER_DEAL_INCLUDE }>,
) => {
  const summary = buildPaymentSummary(
    deal.totalAmount,
    deal.payments,
    deal.downPaymentRequired,
    deal.dueDate,
  );
  return {
    ...deal,
    totalAmount: decimalToNumber(deal.totalAmount),
    downPaymentRequired: decimalToNumber(deal.downPaymentRequired),
    payments: deal.payments.map((payment) => ({
      ...payment,
      amount: decimalToNumber(payment.amount),
    })),
    car: {
      ...deal.car,
      priceJpy: decimalToNumber(deal.car.priceJpy),
      priceUsd: decimalToNumber(deal.car.priceUsd),
      pricePkr: decimalToNumber(deal.car.pricePkr),
    },
    paymentSummary: summary,
  };
};

const CUSTOMER_VISIBLE_EVENT_TYPES = new Set<LedgerEventType>([
  LedgerEventType.DEAL_CREATED,
  LedgerEventType.DEAL_UPDATED,
  LedgerEventType.PAYMENT_ADDED,
  LedgerEventType.DOCUMENT_ADDED,
  LedgerEventType.DOCUMENT_UPDATED,
]);

const isCustomerVisibleDocumentEvent = (
  event: Prisma.LedgerDealGetPayload<{ include: typeof LEDGER_DEAL_INCLUDE }>["events"][number],
): boolean => {
  if (
    event.type !== LedgerEventType.DOCUMENT_ADDED &&
    event.type !== LedgerEventType.DOCUMENT_UPDATED
  ) {
    return true;
  }

  const metadata = event.metadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return true;
  }

  return (metadata as { visibleToCustomer?: unknown }).visibleToCustomer !== false;
};

const toCustomerLedgerDealPayload = (
  deal: Prisma.LedgerDealGetPayload<{ include: typeof LEDGER_DEAL_INCLUDE }>,
) => {
  const payload = toLedgerDealPayload(deal);
  const { note, createdBy, createdById, deletedAt, ...customerDeal } = payload;
  void note;
  void createdBy;
  void createdById;
  void deletedAt;

  return {
    ...customerDeal,
    payments: payload.payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      type: payment.type,
      method: payment.method,
      paidAt: payment.paidAt,
      referenceNo: payment.referenceNo,
      createdAt: payment.createdAt,
    })),
    documents: payload.documents
      .filter((document) => document.visibleToCustomer)
      .map((document) => ({
        id: document.id,
        type: document.type,
        title: document.title,
        fileName: document.fileName,
        mimeType: document.mimeType,
        fileSize: document.fileSize,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      })),
    events: payload.events
      .filter((event) => CUSTOMER_VISIBLE_EVENT_TYPES.has(event.type))
      .filter(isCustomerVisibleDocumentEvent)
      .map((event) => ({
        id: event.id,
        type: event.type,
        message: event.message,
        metadata: event.metadata,
        createdAt: event.createdAt,
      })),
  };
};

const paginationPayload = ({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) => ({
  page,
  pageSize,
  total,
  totalPages: Math.max(1, Math.ceil(total / pageSize)),
});

const generateOrderNumber = async (): Promise<string> => {
  const prefix = "ICC-ORD-";
  const count = await prisma.ledgerDeal.count();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const sequence = String(count + 1 + attempt).padStart(4, "0");
    const candidate = `${prefix}${sequence}`;
    const exists = await prisma.ledgerDeal.findUnique({
      where: { orderNumber: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }

  return `${prefix}${Date.now()}`;
};

const requireActiveDeal = async (dealId: string) => {
  return prisma.ledgerDeal.findFirst({
    where: { id: dealId, deletedAt: null },
    include: LEDGER_DEAL_INCLUDE,
  });
};

const assertCustomerAndCar = async (userId: string, carId: string) => {
  const [user, car] = await Promise.all([
    prisma.user.findFirst({
      where: { id: userId, role: UserRole.USER, isActive: true },
      select: { id: true },
    }),
    prisma.car.findFirst({
      where: { id: carId },
      select: { id: true },
    }),
  ]);

  return { user, car };
};

const createLedgerEvent = async ({
  dealId,
  type,
  message,
  createdById,
  metadata,
}: {
  dealId: string;
  type: LedgerEventType;
  message: string;
  createdById: string | null;
  metadata?: Prisma.InputJsonValue;
}) => {
  const data: Prisma.LedgerEventUncheckedCreateInput = {
    dealId,
    type,
    message,
    createdById,
    ...(metadata !== undefined ? { metadata } : {}),
  };

  await prisma.ledgerEvent.create({
    data,
  });
};

export const getAdminLedgerDeals = async (req: Request, res: Response): Promise<void> => {
  const page = parsePositiveInt(req.query.page, DEFAULT_PAGE);
  const requestedPageSize = parsePositiveInt(req.query.pageSize, DEFAULT_PAGE_SIZE);
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const status =
    typeof req.query.status === "string" &&
    (Object.values(LedgerDealStatus) as string[]).includes(req.query.status)
      ? (req.query.status as LedgerDealStatus)
      : undefined;
  const currency =
    typeof req.query.currency === "string" &&
    (Object.values(LedgerCurrency) as string[]).includes(req.query.currency)
      ? (req.query.currency as LedgerCurrency)
      : undefined;

  const where: Prisma.LedgerDealWhereInput = {
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(currency ? { currency } : {}),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { user: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
            { user: { email: { contains: search, mode: Prisma.QueryMode.insensitive } } },
            { user: { phone: { contains: search, mode: Prisma.QueryMode.insensitive } } },
            { car: { referenceNo: { contains: search, mode: Prisma.QueryMode.insensitive } } },
            { car: { title: { contains: search, mode: Prisma.QueryMode.insensitive } } },
            { car: { chassisNo: { contains: search, mode: Prisma.QueryMode.insensitive } } },
            { car: { model: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } } },
            { car: { model: { brand: { contains: search, mode: Prisma.QueryMode.insensitive } } } },
          ],
        }
      : {}),
  };

  const [total, deals] = await Promise.all([
    prisma.ledgerDeal.count({ where }),
    prisma.ledgerDeal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: LEDGER_DEAL_INCLUDE,
    }),
  ]);

  const data = deals.map(toLedgerDealPayload);
  const filteredData =
    req.query.paymentStatus === "OVERDUE"
      ? data.filter((deal) => deal.paymentSummary.isOverdue)
      : req.query.paymentStatus === "FULLY_PAID"
        ? data.filter((deal) => deal.paymentSummary.paymentStatus === "FULLY_PAID")
        : req.query.paymentStatus === "BALANCE_PENDING"
          ? data.filter((deal) => deal.paymentSummary.remainingBalance > 0)
          : data;

  res.status(200).json({
    data: filteredData,
    pagination: paginationPayload({ page, pageSize, total }),
  });
};

export const getMyLedgerDeals = async (_req: Request, res: Response): Promise<void> => {
  const authUserId = res.locals.authUserId as string | undefined;
  const authUserRole = res.locals.authUserRole as UserRole | undefined;

  if (!authUserId) {
    res.status(401).json({ message: "authorization token required" });
    return;
  }

  if (authUserRole !== UserRole.USER) {
    res.status(403).json({ message: "customer account required" });
    return;
  }

  const deals = await prisma.ledgerDeal.findMany({
    where: {
      userId: authUserId,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    include: LEDGER_DEAL_INCLUDE,
  });

  res.status(200).json({
    data: deals.map(toCustomerLedgerDealPayload),
  });
};

export const createAdminLedgerDeal = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as CreateLedgerDealBody;
  const { user, car } = await assertCustomerAndCar(body.userId, body.carId);

  if (!user) {
    res.status(400).json({ message: "customer user not found" });
    return;
  }
  if (!car) {
    res.status(400).json({ message: "car not found" });
    return;
  }

  const orderNumber = body.orderNumber
    ? normalizeOrderNumber(body.orderNumber)
    : await generateOrderNumber();
  const existing = await prisma.ledgerDeal.findUnique({
    where: { orderNumber },
    select: { id: true },
  });
  if (existing) {
    res.status(409).json({ message: "order number already exists" });
    return;
  }

  const adminId = getAdminId(res);
  const deal = await prisma.ledgerDeal.create({
    data: {
      orderNumber,
      userId: body.userId,
      carId: body.carId,
      createdById: adminId,
      totalAmount: money(body.totalAmount),
      currency: body.currency,
      downPaymentRequired:
        body.downPaymentRequired === null || body.downPaymentRequired === undefined
          ? null
          : money(body.downPaymentRequired),
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      shipmentOrigin: body.shipmentOrigin?.trim() || null,
      shipmentDestination: body.shipmentDestination?.trim() || null,
      vesselName: body.vesselName?.trim() || null,
      bookingNo: body.bookingNo?.trim() || null,
      billOfLadingNo: body.billOfLadingNo?.trim() || null,
      currentLocation: body.currentLocation?.trim() || null,
      shipmentNote: body.shipmentNote?.trim() || null,
      status: body.status ?? LedgerDealStatus.PENDING_CONFIRMATION,
      note: body.note?.trim() || null,
      events: {
        create: {
          type: LedgerEventType.DEAL_CREATED,
          message: "Ledger deal created",
          createdById: adminId,
        },
      },
    },
    include: LEDGER_DEAL_INCLUDE,
  });

  res.status(201).json({ deal: toLedgerDealPayload(deal) });
};

export const getAdminLedgerDealById = async (req: Request, res: Response): Promise<void> => {
  const dealId = getRequiredParam(req, res, "id");
  if (!dealId) return;

  const deal = await requireActiveDeal(dealId);
  if (!deal) {
    res.status(404).json({ message: "ledger deal not found" });
    return;
  }

  res.status(200).json({ deal: toLedgerDealPayload(deal) });
};

export const updateAdminLedgerDeal = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as UpdateLedgerDealBody;
  const dealId = getRequiredParam(req, res, "id");
  if (!dealId) return;

  const existing = await prisma.ledgerDeal.findFirst({
    where: { id: dealId, deletedAt: null },
    select: { id: true },
  });

  if (!existing) {
    res.status(404).json({ message: "ledger deal not found" });
    return;
  }

  if (body.userId || body.carId) {
    const { user, car } = await assertCustomerAndCar(
      body.userId ?? "",
      body.carId ?? "",
    );
    if (body.userId && !user) {
      res.status(400).json({ message: "customer user not found" });
      return;
    }
    if (body.carId && !car) {
      res.status(400).json({ message: "car not found" });
      return;
    }
  }

  const orderNumber = body.orderNumber ? normalizeOrderNumber(body.orderNumber) : undefined;
  if (orderNumber) {
    const duplicate = await prisma.ledgerDeal.findFirst({
      where: { orderNumber, id: { not: existing.id } },
      select: { id: true },
    });
    if (duplicate) {
      res.status(409).json({ message: "order number already exists" });
      return;
    }
  }

  const adminId = getAdminId(res);
  const deal = await prisma.ledgerDeal.update({
    where: { id: existing.id },
    data: {
      ...(orderNumber ? { orderNumber } : {}),
      ...(body.userId ? { userId: body.userId } : {}),
      ...(body.carId ? { carId: body.carId } : {}),
      ...(body.totalAmount !== undefined ? { totalAmount: money(body.totalAmount) } : {}),
      ...(body.currency ? { currency: body.currency } : {}),
      ...(body.downPaymentRequired !== undefined
        ? {
            downPaymentRequired:
              body.downPaymentRequired === null ? null : money(body.downPaymentRequired),
          }
        : {}),
      ...(body.dueDate !== undefined ? { dueDate: body.dueDate ? new Date(body.dueDate) : null } : {}),
      ...(body.shipmentOrigin !== undefined
        ? { shipmentOrigin: body.shipmentOrigin?.trim() || null }
        : {}),
      ...(body.shipmentDestination !== undefined
        ? { shipmentDestination: body.shipmentDestination?.trim() || null }
        : {}),
      ...(body.vesselName !== undefined
        ? { vesselName: body.vesselName?.trim() || null }
        : {}),
      ...(body.bookingNo !== undefined
        ? { bookingNo: body.bookingNo?.trim() || null }
        : {}),
      ...(body.billOfLadingNo !== undefined
        ? { billOfLadingNo: body.billOfLadingNo?.trim() || null }
        : {}),
      ...(body.currentLocation !== undefined
        ? { currentLocation: body.currentLocation?.trim() || null }
        : {}),
      ...(body.shipmentNote !== undefined
        ? { shipmentNote: body.shipmentNote?.trim() || null }
        : {}),
      ...(body.status ? { status: body.status } : {}),
      ...(body.note !== undefined ? { note: body.note?.trim() || null } : {}),
    },
    include: LEDGER_DEAL_INCLUDE,
  });

  await createLedgerEvent({
    dealId: deal.id,
    type: LedgerEventType.DEAL_UPDATED,
    message: "Ledger deal updated",
    createdById: adminId,
  });

  res.status(200).json({ deal: toLedgerDealPayload(deal) });
};

export const deleteAdminLedgerDeal = async (req: Request, res: Response): Promise<void> => {
  const dealId = getRequiredParam(req, res, "id");
  if (!dealId) return;

  const deal = await prisma.ledgerDeal.findFirst({
    where: { id: dealId, deletedAt: null },
    select: { id: true },
  });
  if (!deal) {
    res.status(404).json({ message: "ledger deal not found" });
    return;
  }

  await prisma.ledgerDeal.update({
    where: { id: deal.id },
    data: { deletedAt: new Date() },
  });

  res.status(200).json({ success: true });
};

export const addAdminLedgerPayment = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as AddLedgerPaymentBody;
  const dealId = getRequiredParam(req, res, "id");
  if (!dealId) return;

  const deal = await requireActiveDeal(dealId);
  if (!deal) {
    res.status(404).json({ message: "ledger deal not found" });
    return;
  }

  const adminId = getAdminId(res);
  const payment = await prisma.ledgerPayment.create({
    data: {
      dealId: deal.id,
      amount: money(body.amount),
      currency: body.currency ?? deal.currency,
      type: body.type,
      method: body.method,
      paidAt: body.paidAt ? new Date(body.paidAt) : new Date(),
      referenceNo: body.referenceNo?.trim() || null,
      note: body.note?.trim() || null,
      receivedById: adminId,
    },
    include: {
      receivedBy: { select: { id: true, name: true, email: true } },
    },
  });

  await createLedgerEvent({
    dealId: deal.id,
    type: LedgerEventType.PAYMENT_ADDED,
    message: `${body.type.replace(/_/g, " ").toLowerCase()} payment added`,
    createdById: adminId,
    metadata: {
      paymentId: payment.id,
      amount: body.amount,
      currency: payment.currency,
      type: payment.type,
    },
  });

  const updatedDeal = await requireActiveDeal(deal.id);
  res.status(201).json({
    payment: { ...payment, amount: decimalToNumber(payment.amount) },
    deal: updatedDeal ? toLedgerDealPayload(updatedDeal) : null,
  });
};

export const deleteAdminLedgerPayment = async (req: Request, res: Response): Promise<void> => {
  const dealId = getRequiredParam(req, res, "id");
  const paymentId = getRequiredParam(req, res, "paymentId");
  if (!dealId || !paymentId) return;

  const deal = await requireActiveDeal(dealId);
  if (!deal) {
    res.status(404).json({ message: "ledger deal not found" });
    return;
  }

  const payment = await prisma.ledgerPayment.findFirst({
    where: { id: paymentId, dealId: deal.id, deletedAt: null },
    select: { id: true },
  });
  if (!payment) {
    res.status(404).json({ message: "payment not found" });
    return;
  }

  await prisma.ledgerPayment.update({
    where: { id: payment.id },
    data: { deletedAt: new Date() },
  });
  await createLedgerEvent({
    dealId: deal.id,
    type: LedgerEventType.PAYMENT_DELETED,
    message: "Ledger payment deleted",
    createdById: getAdminId(res),
    metadata: { paymentId: payment.id },
  });

  res.status(200).json({ success: true });
};

export const createAdminLedgerNote = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as CreateLedgerNoteBody;
  const dealId = getRequiredParam(req, res, "id");
  if (!dealId) return;

  const deal = await requireActiveDeal(dealId);
  if (!deal) {
    res.status(404).json({ message: "ledger deal not found" });
    return;
  }

  const event = await prisma.ledgerEvent.create({
    data: {
      dealId: deal.id,
      type: LedgerEventType.NOTE_ADDED,
      message: body.message.trim(),
      createdById: getAdminId(res),
    },
    include: { createdBy: { select: { id: true, name: true, email: true } } },
  });

  res.status(201).json({ event });
};

export const presignAdminLedgerDocumentUpload = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const body = req.body as PresignLedgerDocumentBody;
  const dealId = getRequiredParam(req, res, "id");
  if (!dealId) return;

  const deal = await requireActiveDeal(dealId);
  if (!deal) {
    res.status(404).json({ message: "ledger deal not found" });
    return;
  }

  const key = `${DOCUMENT_UPLOAD_PREFIX}/${deal.id}/documents/${randomBytes(16).toString("hex")}.${body.ext}`;
  const command = new PutObjectCommand({
    Bucket: s3Bucket,
    Key: key,
    ContentType: body.contentType,
  });
  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: PRESIGN_EXPIRES_IN_SEC,
  });

  res.status(200).json({
    uploadUrl,
    key,
    fileUrl: s3ObjectUrl(key),
    expiresIn: PRESIGN_EXPIRES_IN_SEC,
  });
};

export const createAdminLedgerDocument = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const body = req.body as CreateLedgerDocumentBody;
  const dealId = getRequiredParam(req, res, "id");
  if (!dealId) return;

  const deal = await requireActiveDeal(dealId);
  if (!deal) {
    res.status(404).json({ message: "ledger deal not found" });
    return;
  }

  const expectedPrefix = `${DOCUMENT_UPLOAD_PREFIX}/${deal.id}/documents/`;
  if (!body.fileKey.startsWith(expectedPrefix)) {
    res.status(400).json({ message: "document key does not belong to this ledger deal" });
    return;
  }

  const adminId = getAdminId(res);
  const document = await prisma.ledgerDocument.create({
    data: {
      dealId: deal.id,
      type: body.type,
      title: body.title.trim(),
      fileKey: body.fileKey,
      fileUrl: body.fileUrl?.trim() || s3ObjectUrl(body.fileKey),
      fileName: body.fileName.trim(),
      mimeType: body.mimeType,
      fileSize: body.fileSize ?? null,
      visibleToCustomer: body.visibleToCustomer,
      note: body.note?.trim() || null,
      uploadedById: adminId,
    },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
    },
  });

  await createLedgerEvent({
    dealId: deal.id,
    type: LedgerEventType.DOCUMENT_ADDED,
    message: "Ledger document uploaded",
    createdById: adminId,
    metadata: {
      documentId: document.id,
      type: document.type,
      visibleToCustomer: document.visibleToCustomer,
    },
  });

  res.status(201).json({ document });
};

export const uploadAdminLedgerDocumentFile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const dealId = getRequiredParam(req, res, "id");
  if (!dealId) return;

  const deal = await requireActiveDeal(dealId);
  if (!deal) {
    res.status(404).json({ message: "ledger deal not found" });
    return;
  }

  const contentType = req.header("content-type") as SupportedLedgerDocumentMimeType | undefined;
  const fileName = decodeUploadHeader(req.header("x-file-name"));
  const title = decodeUploadHeader(req.header("x-document-title")) || fileName;
  const note = decodeUploadHeader(req.header("x-document-note"));
  const visibleToCustomer = req.header("x-visible-to-customer") !== "false";
  const documentTypeHeader = req.header("x-document-type");
  const documentType =
    documentTypeHeader && (Object.values(LedgerDocumentType) as string[]).includes(documentTypeHeader)
      ? (documentTypeHeader as LedgerDocumentType)
      : LedgerDocumentType.OTHER;
  const ext = getLedgerDocumentExt(contentType, fileName);

  if (!contentType || !ext) {
    res.status(400).json({ message: "Only PDF, JPG, PNG, or WEBP files are supported." });
    return;
  }

  if (!fileName) {
    res.status(400).json({ message: "file name is required" });
    return;
  }

  if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    res.status(400).json({ message: "document file is required" });
    return;
  }

  const key = `${DOCUMENT_UPLOAD_PREFIX}/${deal.id}/documents/${randomBytes(16).toString("hex")}.${ext}`;
  await s3Client.send(
    new PutObjectCommand({
      Bucket: s3Bucket,
      Key: key,
      Body: req.body,
      ContentType: contentType,
    }),
  );

  const adminId = getAdminId(res);
  const document = await prisma.ledgerDocument.create({
    data: {
      dealId: deal.id,
      type: documentType,
      title,
      fileKey: key,
      fileUrl: s3ObjectUrl(key),
      fileName,
      mimeType: contentType,
      fileSize: req.body.length,
      visibleToCustomer,
      note: note || null,
      uploadedById: adminId,
    },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
    },
  });

  await createLedgerEvent({
    dealId: deal.id,
    type: LedgerEventType.DOCUMENT_ADDED,
    message: "Ledger document uploaded",
    createdById: adminId,
    metadata: {
      documentId: document.id,
      type: document.type,
      visibleToCustomer: document.visibleToCustomer,
    },
  });

  res.status(201).json({ document });
};

export const updateAdminLedgerDocument = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const body = req.body as UpdateLedgerDocumentBody;
  const dealId = getRequiredParam(req, res, "id");
  const documentId = getRequiredParam(req, res, "documentId");
  if (!dealId || !documentId) return;

  const deal = await requireActiveDeal(dealId);
  if (!deal) {
    res.status(404).json({ message: "ledger deal not found" });
    return;
  }

  const document = await prisma.ledgerDocument.findFirst({
    where: { id: documentId, dealId: deal.id, deletedAt: null },
    select: { id: true },
  });
  if (!document) {
    res.status(404).json({ message: "document not found" });
    return;
  }

  const updated = await prisma.ledgerDocument.update({
    where: { id: document.id },
    data: {
      ...(body.type ? { type: body.type } : {}),
      ...(body.title ? { title: body.title.trim() } : {}),
      ...(body.visibleToCustomer !== undefined
        ? { visibleToCustomer: body.visibleToCustomer }
        : {}),
      ...(body.note !== undefined ? { note: body.note?.trim() || null } : {}),
    },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
    },
  });

  await createLedgerEvent({
    dealId: deal.id,
    type: LedgerEventType.DOCUMENT_UPDATED,
    message: "Ledger document updated",
    createdById: getAdminId(res),
    metadata: { documentId: updated.id },
  });

  res.status(200).json({ document: updated });
};

export const deleteAdminLedgerDocument = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const dealId = getRequiredParam(req, res, "id");
  const documentId = getRequiredParam(req, res, "documentId");
  if (!dealId || !documentId) return;

  const deal = await requireActiveDeal(dealId);
  if (!deal) {
    res.status(404).json({ message: "ledger deal not found" });
    return;
  }

  const document = await prisma.ledgerDocument.findFirst({
    where: { id: documentId, dealId: deal.id, deletedAt: null },
    select: { id: true },
  });
  if (!document) {
    res.status(404).json({ message: "document not found" });
    return;
  }

  await prisma.ledgerDocument.update({
    where: { id: document.id },
    data: { deletedAt: new Date() },
  });
  await createLedgerEvent({
    dealId: deal.id,
    type: LedgerEventType.DOCUMENT_DELETED,
    message: "Ledger document deleted",
    createdById: getAdminId(res),
    metadata: { documentId: document.id },
  });

  res.status(200).json({ success: true });
};

export const getAdminLedgerDocumentDownload = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const dealId = getRequiredParam(req, res, "id");
  const documentId = getRequiredParam(req, res, "documentId");
  if (!dealId || !documentId) return;

  const deal = await requireActiveDeal(dealId);
  if (!deal) {
    res.status(404).json({ message: "ledger deal not found" });
    return;
  }

  const document = await prisma.ledgerDocument.findFirst({
    where: { id: documentId, dealId: deal.id, deletedAt: null },
    select: { id: true, fileKey: true, fileName: true },
  });
  if (!document) {
    res.status(404).json({ message: "document not found" });
    return;
  }

  const command = new GetObjectCommand({
    Bucket: s3Bucket,
    Key: document.fileKey,
    ResponseContentDisposition: `attachment; filename="${document.fileName.replace(/"/g, "")}"`,
  });
  const downloadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: DOWNLOAD_EXPIRES_IN_SEC,
  });

  res.status(200).json({
    downloadUrl,
    expiresIn: DOWNLOAD_EXPIRES_IN_SEC,
  });
};

export const getAdminLedgerCarImageDownload = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const dealId = getRequiredParam(req, res, "id");
  const imageId = getRequiredParam(req, res, "imageId");
  if (!dealId || !imageId) return;

  const deal = await requireActiveDeal(dealId);
  if (!deal) {
    res.status(404).json({ message: "ledger deal not found" });
    return;
  }

  const image = await prisma.carImage.findFirst({
    where: { id: imageId, carId: deal.carId },
    select: {
      id: true,
      url: true,
      key: true,
      position: true,
      car: { select: { referenceNo: true } },
    },
  });
  if (!image) {
    res.status(404).json({ message: "car image not found" });
    return;
  }

  let ext = "jpg";
  try {
    const urlPath = new URL(image.url).pathname;
    ext = urlPath.split(".").pop()?.split("?")[0] || ext;
  } catch {
    const urlPath = image.url.split("?")[0] ?? "";
    ext = urlPath.split(".").pop() || ext;
  }
  const fileName = sanitizeDownloadName(
    `${image.car.referenceNo}-image-${image.position + 1}.${ext}`,
  );

  if (!image.key) {
    res.status(200).json({
      downloadUrl: image.url,
      fileName,
      expiresIn: DOWNLOAD_EXPIRES_IN_SEC,
    });
    return;
  }

  const command = new GetObjectCommand({
    Bucket: s3Bucket,
    Key: image.key,
    ResponseContentDisposition: `attachment; filename="${fileName}"`,
  });
  const downloadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: DOWNLOAD_EXPIRES_IN_SEC,
  });

  res.status(200).json({
    downloadUrl,
    fileName,
    expiresIn: DOWNLOAD_EXPIRES_IN_SEC,
  });
};

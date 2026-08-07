import { z } from "zod";

const trimmed = z.string().trim();
const optionalTrimmed = trimmed.optional();
const positiveAmount = z.number().positive().max(1_000_000_000_000);

const ledgerCurrencyEnum = z.enum(["JPY", "USD", "PKR", "AED"]);
const ledgerDealStatusEnum = z.enum([
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "IN_TRANSIT",
  "ARRIVED",
  "DELIVERED",
  "CANCELLED",
]);
const ledgerPaymentTypeEnum = z.enum([
  "DOWN_PAYMENT",
  "INSTALLMENT",
  "FINAL_PAYMENT",
  "REFUND",
  "ADJUSTMENT",
]);
const ledgerPaymentMethodEnum = z.enum([
  "BANK_TRANSFER",
  "CASH",
  "CARD",
  "ONLINE",
  "OTHER",
]);
const ledgerDocumentTypeEnum = z.enum([
  "INVOICE",
  "PURCHASE_RECEIPT",
  "INSPECTION_SHEET",
  "EXPORT_CERTIFICATE",
  "BILL_OF_LADING",
  "SHIPPING_INVOICE",
  "PAYMENT_RECEIPT",
  "OTHER",
]);

const documentContentTypeEnum = z.enum([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const documentExtEnum = z.enum(["pdf", "jpg", "jpeg", "png", "webp"]);

export const createLedgerDealSchema = z.object({
  orderNumber: trimmed.min(1).max(64).optional(),
  userId: trimmed.min(1),
  carId: trimmed.min(1),
  totalAmount: positiveAmount,
  currency: ledgerCurrencyEnum.default("JPY"),
  downPaymentRequired: positiveAmount.nullable().optional(),
  dueDate: trimmed.datetime().nullable().optional(),
  status: ledgerDealStatusEnum.optional(),
  note: trimmed.max(2000).nullable().optional(),
});

export const updateLedgerDealSchema = z
  .object({
    orderNumber: trimmed.min(1).max(64).optional(),
    userId: trimmed.min(1).optional(),
    carId: trimmed.min(1).optional(),
    totalAmount: positiveAmount.optional(),
    currency: ledgerCurrencyEnum.optional(),
    downPaymentRequired: positiveAmount.nullable().optional(),
    dueDate: trimmed.datetime().nullable().optional(),
    status: ledgerDealStatusEnum.optional(),
    note: trimmed.max(2000).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "at least one field is required",
  });

export const addLedgerPaymentSchema = z.object({
  amount: positiveAmount,
  currency: ledgerCurrencyEnum.optional(),
  type: ledgerPaymentTypeEnum.default("INSTALLMENT"),
  method: ledgerPaymentMethodEnum.default("OTHER"),
  paidAt: trimmed.datetime().optional(),
  referenceNo: optionalTrimmed,
  note: trimmed.max(2000).nullable().optional(),
});

export const createLedgerNoteSchema = z.object({
  message: trimmed.min(1).max(2000),
});

export const presignLedgerDocumentSchema = z.object({
  contentType: documentContentTypeEnum,
  ext: documentExtEnum,
});

export const createLedgerDocumentSchema = z.object({
  type: ledgerDocumentTypeEnum.default("OTHER"),
  title: trimmed.min(1).max(160),
  fileKey: trimmed.min(1).max(512),
  fileUrl: trimmed.url().nullable().optional(),
  fileName: trimmed.min(1).max(255),
  mimeType: documentContentTypeEnum,
  fileSize: z.number().int().positive().max(50 * 1024 * 1024).nullable().optional(),
  visibleToCustomer: z.boolean().default(false),
  note: trimmed.max(2000).nullable().optional(),
});

export const updateLedgerDocumentSchema = z
  .object({
    type: ledgerDocumentTypeEnum.optional(),
    title: trimmed.min(1).max(160).optional(),
    visibleToCustomer: z.boolean().optional(),
    note: trimmed.max(2000).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "at least one field is required",
  });
